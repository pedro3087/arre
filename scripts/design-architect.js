#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// ─── Environment ─────────────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN   = process.env.GITHUB_TOKEN;
const PR_NUMBER      = process.env.PR_NUMBER;
const REPO_OWNER     = process.env.REPO_OWNER;
const REPO_NAME      = process.env.REPO_NAME;

// ─── Constants ───────────────────────────────────────────────────────────────
const MAX_FILES        = 10;           // CHK016/CHK031: cap to avoid token overflow
const GEMINI_TIMEOUT   = 55_000;       // CHK029: 55s → stays under 60s target
const FRONTEND_EXTS    = ['.tsx', '.module.css', '.css']; // CHK015: .ts handled separately
const TS_STYLE_PATTERN = /style|className|var\(--|\.module/i; // CHK015: .ts filter

// T013: parse --local flag
const isLocal = process.argv.includes('--local');

// ─── T012: Get git diff ───────────────────────────────────────────────────────
function getDiff(local) {
  try {
    const cmd = local ? 'git diff HEAD' : 'git diff origin/main...HEAD';
    return execSync(cmd, { maxBuffer: 10 * 1024 * 1024 }).toString();
  } catch (e) {
    console.warn('⚠️  Failed to get git diff:', e.message);
    return '';
  }
}

// ─── T007: Parse diff, filter to frontend files ──────────────────────────────
function parseDiff(rawDiff) {
  const files = [];
  const blocks = rawDiff.split(/^diff --git /m).filter(Boolean);

  for (const block of blocks) {
    const match = block.match(/^a\/.+? b\/(.+?)$/m);
    if (!match) continue;
    const filePath = match[1];

    const isFrontend = FRONTEND_EXTS.some(ext => filePath.endsWith(ext));
    const isTS = filePath.endsWith('.ts') && !filePath.endsWith('.tsx');

    if (!isFrontend && !isTS) continue;

    // CHK015: for plain .ts files, only include if diff touches style-related lines
    if (isTS) {
      const addedLines = block.split('\n').filter(l => l.startsWith('+') || l.startsWith('-'));
      if (!addedLines.some(l => TS_STYLE_PATTERN.test(l))) continue;
    }

    files.push({ file: filePath, content: block });
  }

  return files;
}

// ─── T008: Deterministic HEX color detection (SC-001) ────────────────────────
function detectHardcodedHex(filteredFiles) {
  const findings = [];
  const hexRegex = /#[0-9a-fA-F]{3,8}\b/g;

  for (const { file, content } of filteredFiles) {
    const addedLines = content
      .split('\n')
      .filter(l => l.startsWith('+') && !l.startsWith('+++'));

    for (const line of addedLines) {
      const matches = [...line.matchAll(hexRegex)];
      for (const m of matches) {
        findings.push({
          ruleId: 'VIBES-001',
          severity: 'Critical',
          file,
          description: `Hardcoded color \`${m[0]}\` found. All colors must use CSS variables.`,
          suggestion: `Replace \`${m[0]}\` with the appropriate token from \`src/styles/variables.css\` (e.g., \`var(--text-primary)\`, \`var(--accent-emerald)\`).`,
        });
      }
    }
  }

  return findings;
}

// ─── T009: Build Gemini prompt ────────────────────────────────────────────────
function buildGeminiPrompt(filteredFiles, designVibesContent) {
  const diffContent = filteredFiles
    .map(f => `### File: ${f.file}\n\`\`\`diff\n${f.content.slice(0, 3000)}\n\`\`\``)
    .join('\n\n');

  return `You are a senior Product Designer and Frontend Architect reviewing code changes for the **Arre** design system.

## Your Rulebook (DESIGN_VIBES.md)

${designVibesContent}

## Code Changes to Review

${diffContent}

## Instructions

Review the code changes against the rulebook. Return ONLY a valid JSON array of findings. No markdown outside the array, no explanation text.

Each finding must use this exact shape:
[
  {
    "ruleId": "VIBES-002",
    "severity": "Warning",
    "file": "src/components/Example.module.css",
    "description": "Brief description of the issue.",
    "suggestion": "Specific actionable fix."
  }
]

Severity rules:
- "Critical" → VIBES-001 only (do NOT report — already detected deterministically)
- "Warning"   → VIBES-002, VIBES-003, VIBES-004, VIBES-006
- "Suggestion" → VIBES-005 or minor polish / UX friction items

Return [] if no issues found.`;
}

// ─── T010: Call Gemini API with timeout ──────────────────────────────────────
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY not set — skipping LLM analysis.');
    return [];
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{ text: 'You are a senior Product Designer auditing code for the Arre design system. Return only valid JSON.' }],
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`⚠️  Gemini API error ${response.status} — skipping LLM analysis.`);
      return [];
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    // Strip markdown code fences if present
    const jsonText = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(jsonText);
  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      console.warn('⚠️  Gemini API timed out after 55s — skipping LLM analysis.');
    } else {
      console.warn('⚠️  Gemini API unavailable:', err.message, '— skipping LLM analysis.');
    }
    return [];
  }
}

// ─── T011: Render markdown report ────────────────────────────────────────────
function renderMarkdownReport(findings, filesAnalyzed, truncatedCount) {
  const critical   = findings.filter(f => f.severity === 'Critical');
  const warning    = findings.filter(f => f.severity === 'Warning');
  const suggestion = findings.filter(f => f.severity === 'Suggestion');

  const truncatedNote = truncatedCount > 0
    ? ` *(capped at ${MAX_FILES} — ${truncatedCount} file(s) omitted from LLM analysis)*`
    : '';

  let report = `## 🎨 Design Architect Review\n\n`;
  report += `**Files analyzed**: ${filesAnalyzed}${truncatedNote}  \n`;
  report += `**Findings**: ${findings.length} total — 🔴 ${critical.length} critical · 🟡 ${warning.length} warning · 🔵 ${suggestion.length} suggestion\n\n`;

  if (findings.length === 0) {
    report += `✅ **All design rules pass!** No violations detected.\n`;
    return report;
  }

  const renderGroup = (items, emoji, label) => {
    if (items.length === 0) return '';
    let s = `### ${emoji} ${label} (${items.length})\n\n`;
    for (const f of items) {
      s += `**\`${f.file}\`** — \`${f.ruleId}\`\n`;
      s += `> ${f.description}\n`;
      s += `> 💡 **Fix**: ${f.suggestion}\n\n`;
    }
    return s;
  };

  report += renderGroup(critical, '🔴', 'Critical');
  report += renderGroup(warning, '🟡', 'Warning');
  report += renderGroup(suggestion, '🔵', 'Suggestion');

  return report;
}

// ─── T016: Post PR comment ────────────────────────────────────────────────────
async function postPrComment(body) {
  if (!GITHUB_TOKEN || !PR_NUMBER || !REPO_OWNER || !REPO_NAME) {
    console.log('ℹ️  GitHub context not available — printing report to console.');
    console.log(body);
    return;
  }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`GitHub API error ${res.status}: ${text}`);
    } else {
      console.log('✅ Design review comment posted to PR.');
    }
  } catch (e) {
    console.error('Error posting to GitHub:', e.message);
  }
}

// ─── T020: Fetch existing design-debt issues (deduplication) ─────────────────
async function getExistingDesignDebtIssues() {
  if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) return [];
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=design-debt&state=open&per_page=100`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`,
      },
    });
    if (!res.ok) return [];
    const issues = await res.json();
    return issues.map(i => i.title);
  } catch {
    return [];
  }
}

// ─── T021: Create a GitHub Issue for design debt ──────────────────────────────
async function createDesignDebtIssue(finding, prNumber) {
  const url   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`;
  const title = `[DESIGN-DEBT][PR-${prNumber}] ${finding.description.slice(0, 80)}`;
  const body  = [
    `## Design Debt Item`,
    ``,
    `**Rule**: \`${finding.ruleId}\``,
    `**File**: \`${finding.file}\``,
    `**PR**: #${prNumber}`,
    ``,
    `**Issue**:`,
    finding.description,
    ``,
    `**Suggested Fix**:`,
    finding.suggestion,
    ``,
    `---`,
    `*Created automatically by the Design Architect Agent*`,
  ].join('\n');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, labels: ['design-debt'] }),
    });
    if (!res.ok) {
      console.warn(`⚠️  Could not create Issue: ${res.status}`);
    } else {
      console.log(`📋 Created design-debt Issue: ${title.slice(0, 70)}…`);
    }
  } catch (e) {
    console.warn('⚠️  Error creating GitHub Issue:', e.message);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function run() {
  const startTime = Date.now();
  console.log(`--- Design Architect Agent (${isLocal ? 'local' : 'CI'} mode) ---`);

  // T012: Get diff
  const rawDiff = getDiff(isLocal);
  if (!rawDiff.trim()) {
    const msg = '✅ No changes detected — design audit skipped.';
    console.log(msg);
    if (!isLocal) await postPrComment(`🤖 **Design Architect Agent**\n\n${msg}`);
    process.exit(0);
  }

  // T007: Parse + filter
  let filteredFiles = parseDiff(rawDiff);
  if (filteredFiles.length === 0) {
    const msg = '✅ No frontend changes detected — design audit skipped.';
    console.log(msg);
    if (!isLocal) await postPrComment(`🤖 **Design Architect Agent**\n\n${msg}`);
    process.exit(0);
  }

  // CHK016: Cap at MAX_FILES
  const totalFound   = filteredFiles.length;
  const truncatedCount = Math.max(0, totalFound - MAX_FILES);
  if (truncatedCount > 0) {
    console.warn(`⚠️  ${totalFound} frontend files in diff — analyzing first ${MAX_FILES} only.`);
    filteredFiles = filteredFiles.slice(0, MAX_FILES);
  }
  console.log(`📁 Analyzing ${filteredFiles.length} frontend file(s)…`);

  // T008: Deterministic HEX check
  const hexFindings = detectHardcodedHex(filteredFiles);
  if (hexFindings.length > 0) {
    console.log(`🔴 ${hexFindings.length} hardcoded color violation(s) detected.`);
  }

  // T009/T010: Gemini LLM analysis
  let llmFindings = [];
  const vibesPath = path.join(process.cwd(), 'docs', 'DESIGN_VIBES.md');

  // CHK017: Guard against missing/empty DESIGN_VIBES.md
  if (!fs.existsSync(vibesPath)) {
    console.warn('⚠️  docs/DESIGN_VIBES.md not found — skipping LLM analysis. Only HEX check ran.');
  } else {
    const vibesContent = fs.readFileSync(vibesPath, 'utf-8');
    if (!vibesContent.trim()) {
      console.warn('⚠️  docs/DESIGN_VIBES.md is empty — skipping LLM analysis.');
    } else {
      const prompt = buildGeminiPrompt(filteredFiles, vibesContent);
      llmFindings  = await callGemini(prompt);
    }
  }

  // T011: Merge + render
  const allFindings = [...hexFindings, ...llmFindings];
  const report = renderMarkdownReport(allFindings, filteredFiles.length, truncatedCount);

  // T015: Elapsed time
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  if (Number(elapsed) > 55) {
    console.warn(`⚠️  Analysis took ${elapsed}s — over the 55s target.`);
  } else {
    console.log(`⏱️  Analysis completed in ${elapsed}s`);
  }

  if (isLocal) {
    // T014: Local mode → print to stdout
    console.log('\n' + report);
  } else {
    // T017/T018: CI mode → post PR comment
    let commentBody = `🤖 **Design Architect Agent**\n\n${report}`;
    if (llmFindings.length === 0 && fs.existsSync(vibesPath)) {
      commentBody += `\n\n---\n> ⚠️ LLM analysis was skipped or returned no results. Deterministic checks (HEX scan) still ran.`;
    }
    await postPrComment(commentBody);

    // T020–T023: W-004 — auto-create GitHub Issues for Suggestion-level findings only
    const suggestions = allFindings.filter(f => f.severity === 'Suggestion');
    if (suggestions.length > 0 && GITHUB_TOKEN && PR_NUMBER) {
      const existingTitles = await getExistingDesignDebtIssues();
      for (const finding of suggestions) {
        // T022: Deduplication — match on PR number + first 40 chars of description
        const dupKey = `[DESIGN-DEBT][PR-${PR_NUMBER}]`;
        const isDuplicate = existingTitles.some(
          t => t.startsWith(dupKey) && t.includes(finding.description.slice(0, 40))
        );
        if (isDuplicate) {
          console.log(`⏭️  Duplicate Issue skipped for: ${finding.description.slice(0, 60)}…`);
        } else {
          await createDesignDebtIssue(finding, PR_NUMBER);
        }
      }
    }
  }

  // CHK007: Critical = severity label only; CI continues via continue-on-error
  const hasCritical = allFindings.some(f => f.severity === 'Critical');
  if (hasCritical) {
    console.log('🔴 Critical design violations found (exit 1 — CI non-blocking via continue-on-error).');
    process.exit(1);
  }

  process.exit(0);
}

run();
