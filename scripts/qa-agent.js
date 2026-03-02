import fs from 'fs';
import { execSync } from 'child_process';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PR_NUMBER = process.env.PR_NUMBER;
const REPO_OWNER = process.env.REPO_OWNER; // e.g. "octocat"
const REPO_NAME = process.env.REPO_NAME; // e.g. "Hello-World"
const TEST_REPORT_PATH = process.env.TEST_REPORT_PATH || 'test-results.json';
const COMMIT_SHA = process.env.COMMIT_SHA;

async function run() {
  console.log('--- Starting AI QA Agent Analysis ---');

  if (!fs.existsSync(TEST_REPORT_PATH)) {
    console.log(`No test report found at ${TEST_REPORT_PATH}. Exiting.`);
    return;
  }

  const rawData = fs.readFileSync(TEST_REPORT_PATH, 'utf-8');
  let reportData;
  try {
    reportData = JSON.parse(rawData);
  } catch (err) {
    console.error('Failed to parse Playwright JSON output:', err);
    return;
  }

  // 1. Extract Failed Tests
  const failedTests = [];
  if (reportData.suites) {
     const extractFailures = (suites) => {
        for (const suite of suites) {
            if (suite.specs) {
                for (const spec of suite.specs) {
                    if (!spec.ok) {
                        const failureMsgs = spec.tests
                            .flatMap(t => t.results)
                            .filter(r => r.status !== 'passed' && r.status !== 'skipped')
                            .map(r => r.error ? r.error.message : r.error?.snippet || 'Unknown error');
                        
                        if (failureMsgs.length > 0) {
                             failedTests.push({
                                title: spec.title,
                                file: spec.file,
                                errors: failureMsgs
                             });
                        }
                    }
                }
            }
            if (suite.suites) {
                extractFailures(suite.suites);
            }
        }
     };
     extractFailures(reportData.suites);
  } else if (reportData.errors && reportData.errors.length > 0) {
      failedTests.push({ title: 'Global setup/teardown', errors: reportData.errors });
  }

  // Extract Stats for Summary Table
  const stats = reportData.stats || { expected: 0, unexpected: 0, flaky: 0, skipped: 0, duration: 0 };
  const total = stats.expected + stats.unexpected + stats.flaky + stats.skipped;
  const durationInSeconds = (stats.duration / 1000).toFixed(1);

  const resultsTable = `| Metric | Count |\n|---|---|\n| 🧪 Total Tests | ${total} |\n| ✅ Passed | ${stats.expected} |\n| ❌ Failed | ${stats.unexpected} |\n| ⚠️ Flaky | ${stats.flaky} |\n| ⏭️ Skipped | ${stats.skipped} |\n| ⏱️ Duration | ${durationInSeconds}s |`;

  if (failedTests.length === 0) {
    console.log('No failed tests detected. Posting success summary.');
    if (GITHUB_TOKEN && PR_NUMBER && REPO_OWNER && REPO_NAME) {
      const commentBody = `🤖 **QA Agent Coverage Report**\n\n✅ **All tests passed successfully!**\n\n${resultsTable}`;
      await postGitHubCommentRaw(commentBody);
    } else {
      console.log('GitHub context missing or not running in PR. Exiting gracefully.');
    }
    return;
  }

  console.log(`Detected ${failedTests.length} failed tests.`);

  // 2. Get Git Diff
  let gitDiff = '';
  try {
     // Ensure we're fetching enough history if needed, but in Actions we usually checkout the PR branch merged into main.
     gitDiff = execSync('git diff origin/main...HEAD').toString();
  } catch (e) {
     console.warn('Failed to get git diff. Proceeding without diff context.', e.message);
  }

  // 3. Construct Prompt
  let promptContext = `You are an expert QA Engineer and SDET. A CI pipeline for a Web Application has failed during Playwright End-to-End tests.\n\n`;
  promptContext += `### Failed Tests Details\n`;
  failedTests.forEach(t => {
     promptContext += `- **Test Name:** ${t.title}\n`;
     if (t.file) promptContext += `  **File:** ${t.file}\n`;
     promptContext += `  **Errors:**\n${t.errors.join('\n').substring(0, 500)}...\n\n`;
  });

  promptContext += `### Recent Code Changes (Git Diff)\n`;
  promptContext += `\`\`\`diff\n${gitDiff.substring(0, 3000)}\n\`\`\`\n\n`;
  
  promptContext += `Analyze the provided Playwright errors alongside the git diff. 
1. **Identify the root cause**: Did the test break because of a valid application bug introduced in the diff? Or does the test need to be updated (e.g., a selector changed)? Or is it flaky?
2. **Provide a solution**: Provide the specific code change snippet (either fixing the app or fixing the test file) needed to pass the test again.

Provide your response in Markdown, using clear headers, bullet points, and codeblocks. Do not include introductory conversational filler.`;

  console.log('--- Calling Gemini API ---');
  if (!GEMINI_API_KEY) {
      console.log('GEMINI_API_KEY is not set. Cannot run analysis. Exiting.');
      // Output the prompt anyway for debugging if key is missing locally
      console.log(promptContext);
      return;
  }

  const geminiResponse = await callGeminiAPI(promptContext);
  if (!geminiResponse) {
      console.log('Failed to get a response from Gemini.');
      return;
  }

  console.log('--- Gemini Analysis Completed ---');

  // 4. Post to GitHub PR
  if (GITHUB_TOKEN && PR_NUMBER && REPO_OWNER && REPO_NAME) {
      const fullComment = `🤖 **AI QA Agent Analysis**\n\nI detected test failures in this PR and analyzed the errors against the recent code changes.\n\n### Test Execution Summary\n\n${resultsTable}\n\n---\n\n### Root Cause Analysis\n\n${geminiResponse}`;
      await postGitHubCommentRaw(fullComment);
  } else {
      console.log('GitHub context not fully provided. Skipping PR comment.');
      console.log('--- Analysis Output ---');
      console.log(geminiResponse);
  }
}

async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{ text: "You are a senior SDET and QA automation architect debugging Playwright test failures."}]
        }
      })
    });
    
    if (!response.ok) {
       const text = await response.text();
       console.error(`Gemini API Error: ${response.status} ${text}`);
       return null;
    }

    const data = await response.json();
    if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
}

async function postGitHubCommentRaw(commentBody) {
    console.log(`Posting comment to PR #${PR_NUMBER}...`);
    
    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues/${PR_NUMBER}/comments`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ body: commentBody })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`GitHub API Error: ${response.status} ${text}`);
        } else {
            console.log('Successfully posted comment to GitHub PR.');
        }

    } catch (e) {
        console.error('Error posting to GitHub:', e);
    }
}

run();
