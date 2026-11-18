import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Bifurcate important topics from PPT/Session details
  app.post("/api/gemini/bifurcate", async (req, res) => {
    try {
      const { courseName, sessionTitle, fileName } = req.body;
      if (!courseName || !sessionTitle) {
        return res.status(400).json({ error: "courseName and sessionTitle are required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
        // Fallback list of topics if no API key is available
        const fallbackTopics = [
          { text: "Core theoretical models & frameworks" },
          { text: "Practical quantitative applications & calculations" },
          { text: "Key case studies and class debate takeaways" },
          { text: "Primary strategic models discussed in session" },
          { text: "Future business trends and policy implications" }
        ];
        return res.json({ topics: fallbackTopics, fallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `As an expert MBA Academic Coordinator at the Indian School of Business (ISB), analyze this course and session PPT details to extract the most important, realistic exam study topics.
Course: ${courseName}
Session: ${sessionTitle}
${fileName ? `PPT File Name: ${fileName}` : ""}

Provide a list of 4 to 6 specific, highly relevant exam topics, core theories, quantitative models, or qualitative frameworks that are typically covered in this MBA lecture. Keep each topic brief (under 85 characters) but specific to the subject.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an elite academic assistant specializing in ISB MBA curriculum and exams. Your job is to break down PPT slides/sessions into concrete, actionable study topics.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "A list of specific important exam topics or core theories.",
            items: {
              type: Type.OBJECT,
              properties: {
                text: {
                  type: Type.STRING,
                  description: "Specific exam topic or core model from the lecture/PPT (e.g. 'IS-LM model derivatives', 'Porter's Five Forces application', 'Black-Scholes valuation formula').",
                }
              },
              required: ["text"]
            }
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini API");
      }

      const topics = JSON.parse(text.trim());
      res.json({ topics });
    } catch (error: any) {
      console.error("Gemini bifurcation error:", error);
      res.status(500).json({ 
        error: "Failed to generate topics", 
        details: error?.message || String(error),
        topics: [
          { text: "Core Concepts & Theories" },
          { text: "Key Case Studies & Class Discussions" },
          { text: "Analytical Frameworks" },
          { text: "Quantitative Models & Applications" }
        ]
      });
    }
  });

  // API Route: Extract and synthesize complete Course Workload Outline
  app.post("/api/gemini/parse-outline", async (req, res) => {
    const { courseName, fileName } = req.body;
    if (!courseName) {
      return res.status(400).json({ error: "courseName is required" });
    }

    const generateFallback = (name: string) => {
      const cleanName = name || "New MBA Course";
      return {
        scoring: [
          { id: "fsc_1", component: "Class Participation & Prep", weightage: "15%" },
          { id: "fsc_2", component: "Case Analysis Papers", weightage: "20%" },
          { id: "fsc_3", component: "Mid-Term Examination", weightage: "30%" },
          { id: "fsc_4", component: "End-Term Examination", weightage: "35%" }
        ],
        readings: `'Foundations of ${cleanName}' (8th Edition) by J. S. Academic & R. P. Mehta`,
        workloadSessions: Array.from({ length: 10 }, (_, i) => ({
          id: `fws_${i + 1}`,
          sessionNum: i + 1,
          title: `Session ${i + 1}: Key Concepts & Frameworks in ${cleanName}`,
          preReads: `Chapter ${i + 1}: Core Principles • Case Study: Global Strategy in ${cleanName}`
        }))
      };
    };

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
        const fallback = generateFallback(courseName);
        return res.json({ ...fallback, fallback: true });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `As an expert MBA Academic Coordinator at the Indian School of Business (ISB), analyze this course outline for "${courseName}".
The student uploaded a PDF outline file named "${fileName || "syllabus_outline.pdf"}".

Extract or synthesize the following:
1. Scoring weightages (%) for course components (e.g. Case write-ups 20%, Class Participation 15%, Midterm 30%, Endterm 35%).
2. Main Reading of the Course: Core textbook(s) with authors' names (e.g., "Corporate Finance (5th Ed.) by Jonathan Berk & Peter DeMarzo").
3. 10 Sessions with Pre-reads: Generate/extract EXACTLY 10 sessions. 
CRITICAL RULE FOR PRE-READS: Keep pre-reads strictly as concise headings/titles (e.g. "Chapter 4: Valuing Bonds" or "HBS Case: Ameritrade Strategy"). Do NOT write long explanatory paragraphs or syllabus text dumps.

Return as JSON matching the schema. Ensure workloadSessions contains EXACTLY 10 items.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are an ISB MBA syllabus extraction expert. You output concise, clean academic data containing exactly 10 sessions, clear scoring percentages, main reading with authors' names, and short pre-read headings only.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scoring: {
                type: Type.ARRAY,
                description: "List of course components and their weightage percentage.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    component: { type: Type.STRING, description: "e.g., 'Class Participation', 'Case Analysis', 'Midterm Exam', 'Final Exam'." },
                    weightage: { type: Type.STRING, description: "e.g., '15%', '20%', '30%'." }
                  },
                  required: ["component", "weightage"]
                }
              },
              readings: {
                type: Type.STRING,
                description: "Main reading of the course with authors' names (e.g., 'Macroeconomics (11th Ed.) by N. Gregory Mankiw')."
              },
              workloadSessions: {
                type: Type.ARRAY,
                description: "Exactly 10 sessions for this course outline, with sessionNum, title, and concise preRead headings.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sessionNum: { type: Type.INTEGER, description: "Session number (1 to 10)." },
                    title: { type: Type.STRING, description: "Concise session title." },
                    preReads: { type: Type.STRING, description: "Short heading of pre-reads, e.g. 'Ch. 3: IS-LM Framework • HBS Case #102'." }
                  },
                  required: ["sessionNum", "title", "preReads"]
                }
              }
            },
            required: ["scoring", "readings", "workloadSessions"]
          }
        }
      });

      const text = response.text;
      if (!text) {
        throw new Error("No response text from Gemini API");
      }

      const result = JSON.parse(text.trim());
      // Ensure all objects have an id
      const formattedScoring = (result.scoring || []).map((s: any, idx: number) => ({
        id: s.id || `sc_${Date.now()}_${idx}`,
        component: s.component,
        weightage: s.weightage
      }));

      const formattedSessions = (result.workloadSessions || []).map((s: any, idx: number) => ({
        id: s.id || `ws_${Date.now()}_${idx}`,
        sessionNum: s.sessionNum || (idx + 1),
        title: s.title,
        preReads: s.preReads
      }));

      res.json({
        scoring: formattedScoring,
        readings: result.readings || "No core textbooks mentioned.",
        workloadSessions: formattedSessions
      });

    } catch (error: any) {
      console.error("Gemini syllabus parse error:", error);
      res.status(500).json({ 
        error: "Failed to parse outline", 
        details: error?.message || String(error),
        ...generateFallback(courseName)
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
