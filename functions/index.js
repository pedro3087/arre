const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require('firebase-functions/params');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdf = require('pdf-parse');
const { parse } = require('csv-parse/sync');

// Define Secrets (You must set this in Google Cloud Secret Manager)
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// Initialize Gemini Client
const getGeminiModel = (apiKey) => {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
};

/**
 * Parses file content based on MIME type.
 */
const parseFileContent = async (fileBase64, mimeType) => {
  const buffer = Buffer.from(fileBase64, 'base64');

  if (mimeType === 'application/pdf') {
    const data = await pdf(buffer);
    return data.text;
  } 
  
  if (mimeType === 'text/csv' || mimeType === 'application/vnd.ms-excel') {
    const records = parse(buffer.toString('utf-8'), {
      columns: true,
      skip_empty_lines: true
    });
    return JSON.stringify(records, null, 2);
  }

  // Fallback for text files
  return buffer.toString('utf-8');
};

/**
 * Cloud Function: processMagicImport
 * Analyzes document/text and extracts actionable tasks.
 */
exports.processMagicImport = onCall({ 
    secrets: [geminiApiKey],
    memory: "512MiB",
    timeoutSeconds: 60
  }, async (request) => {
  
  // 1. Validate Input
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { fileBase64, mimeType, instructions } = request.data;
  
  if (!fileBase64 || !mimeType) {
    throw new HttpsError('invalid-argument', 'Missing file data.');
  }

  try {
    // 2. Extract Text
    const extractedText = await parseFileContent(fileBase64, mimeType);
    
    // 3. Prompt Engineering
    const systemPrompt = `
      You are an expert productivity assistant for the "Arre" app.
      Your goal is to extract actionable tasks from the provided document content.
      
      Rules:
      1. Return ONLY a valid JSON array of strings. No markdown, no explanations.
      2. Each string must be a clear, actionable task title (e.g., "Review Q3 report", not "The report mentions...").
      3. If specific instructions are provided, prioritize them.
      4. Limit to the top 10 most important tasks if the document is large.
      
      User Instructions: ${instructions || "Extract all tasks."}
    `;

    // 4. Call Gemini
    const model = getGeminiModel(geminiApiKey.value());
    
    // Using generateContent with a mix of text parts
    const result = await model.generateContent([
      systemPrompt,
      { text: `Document Content:\n${extractedText.substring(0, 30000)}` } // Safety cap for context window
    ]);

    const response = result.response;
    const text = response.text();

    // 5. Clean and Parse JSON
    // Gemini might wrap response in ```json ``` blocks, so we clean it.
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const tasks = JSON.parse(jsonString);

    if (!Array.isArray(tasks)) {
      throw new Error("AI did not return an array.");
    }

    return { tasks };

  } catch (error) {
    console.error("Magic Import Error:", error);
    throw new HttpsError('internal', 'Details extraction failed.', error.message);
  }
});

/**
 * Cloud Function: generateBriefing
 * Generates an AI briefing based on the user's tasks and projects.
 */
exports.generateBriefing = onCall({
    secrets: [geminiApiKey],
    memory: "512MiB",
    timeoutSeconds: 60
  }, async (request) => {
  
  // 1. Validate Input
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in.');
  }

  const { tasks, projects, localTime } = request.data;
  
  if (!tasks || !Array.isArray(tasks)) {
    throw new HttpsError('invalid-argument', 'Missing or invalid tasks data.');
  }

  try {
    // 2. Prompt Engineering
    const systemPrompt = `
      You are an expert, friendly productivity assistant for the "Arre" app.
      Your goal is to provide a concise, motivational, and highly readable daily briefing for the user based on their current tasks and projects.
      The current local time for the user is: ${localTime || new Date().toISOString()}

      Guidelines:
      1. Structure the briefing into three parts: 
         - A very brief greeting and overview of today.
         - A short summary of tasks for today (what's on their plate).
         - A quick glance at tomorrow or upcoming priorities.
      2. Keep it conversational, uplifting, and direct. Avoid sounding robotic.
      3. Use markdown for formatting (bullet points, bold text).
      4. Highlight projects if relevant (e.g., "For your [Project Name] project...").
      5. Don't list every single task individually if there are many; group them or highlight the most critical ones.
      6. Limit your response to 2-3 short paragraphs.
    `;

    // 3. Document Content (Stringified Tasks & Projects)
    const contextData = JSON.stringify({
      projects: projects || [],
      tasks: tasks.map(t => ({ title: t.title, status: t.status, date: t.date, isEvening: t.isEvening, energy: t.energy, projectName: t.projectName }))
    }, null, 2);

    // 4. Call Gemini
    const model = getGeminiModel(geminiApiKey.value());
    
    const result = await model.generateContent([
      systemPrompt,
      { text: `User Context:\n${contextData}` }
    ]);

    const response = result.response;
    const text = response.text();

    return { briefing: text };

  } catch (error) {
    console.error("Generate Briefing Error:", error);
    throw new HttpsError('internal', 'Briefing generation failed.', error.message);
  }
});
