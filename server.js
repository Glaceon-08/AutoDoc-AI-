const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Required: npm install node-fetch@2

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION FOR OPENAI ---
const PORT = 3000;
const apiKey = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o"; // You can also use "gpt-4-turbo" or "gpt-3.5-turbo"
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-001:generateContent";
        

// Health check route
app.get('/', (req, res) => {
    res.send('🚀 AutoDoc AI Logic Engine (OpenAI Mode) is ONLINE.');
});

app.post('/api/analyze', async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code) return res.status(400).json({ error: "Empty code buffer" });

        const systemPrompt = `You are a Senior Software Architect. Analyze the provided ${language} code and return a valid JSON object ONLY. 
        JSON Schema:
        { 
          "comments": "the source code with professional, line-by-line documentation added",
          "summary": "A high-level 2-sentence executive summary",
          "explanation": "A deep step-by-step logic breakdown",
          "complexity": {
             "time": "Big O notation (e.g. O(n^2))",
             "space": "Big O notation (e.g. O(1))",
             "reason": "Provide a massive, detailed mechanical breakdown of exactly why the algorithm behaves this way."
          },
          "smells": [
             "Suggestion 1: e.g. Lack of early exit optimization...",
             "Suggestion 2: e.g. Inefficient for large data; suggest Timsort/built-in sort..."
          ],
          "mermaid": "A valid graph TD Mermaid.js flowchart string. Node labels MUST be double quoted A[\"label\"].",
          "readme": "A full GitHub README.md content using Markdown."
        }`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: code }
                ],
                response_format: { type: "json_object" }, // Ensures OpenAI returns valid JSON
                temperature: 0.1
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json({ error: data.error?.message || "OpenAI API Failure" });
        }

        // OpenAI returns data in choices[0].message.content
        const aiOutput = JSON.parse(data.choices[0].message.content);
        res.json(aiOutput);

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Internal Server Error - Check terminal logs" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 AutoDoc AI Backend running at http://localhost:${PORT} using OpenAI`);
});