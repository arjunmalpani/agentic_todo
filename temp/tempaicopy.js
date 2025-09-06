// index.js
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: "AIzaSyA4Xf_fr4OcKSmnA_2zpebmnTtHidnDP68" });

async function chatWithGemini() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const ask = () => {
        rl.question("You: ", async (input) => {
            try {
                const resp = await ai.models.generateContent({
                    model: "gemini-2.5‑flash",              // modern default model
                    contents: input,                       // your message
                    // Optionally disable “thinking” to save cost/time:
                    // config: { thinkingConfig: { thinkingBudget: 0 } },
                });
                console.log("Gemini:", resp.text());
                ask();
            } catch (e) {
                console.error("❗ Error:", e);
                rl.close();
            }
        });
    };

    ask();
}

chatWithGemini();
