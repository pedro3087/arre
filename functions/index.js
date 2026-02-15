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
