require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const readline = require("readline");
const connectDB = require("../services/db");
const {
    functionDeclarations,
    functions,
    systemInstruction,
    geminiModel,
} = require("../configs/geminiConfig");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Todo functions' declarations for Gemini

// Bind functions to the Gemini tools

// Set up Gemini model with tool functions
const model = genAI.getGenerativeModel({
    model: geminiModel,
    systemInstruction,
    tools: {
        functionDeclarations,
    },
});
async function chatWithGemini() {
    await connectDB();
    const chat = model.startChat();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const askQuestion = async () => {
        rl.question("Enter your message: ", async (message) => {
            try {
                const result = await chat.sendMessage(message);
                let callQueue = result.response.functionCalls() ?? [];
                let calls = 0;
                while (callQueue && callQueue.length > 0) {
                    calls++;
                    console.log(`This is call ${calls}`);

                    const callName = callQueue[0].name;
                    const callArg = callQueue[0].args ?? null;

                    const callResponse = await functions[callName](callArg);
                    console.log(callResponse);

                    const callResult = await chat.sendMessage([
                        {
                            functionResponse: {
                                name: callName,
                                response: callResponse,
                            },
                        },
                    ]);
                    callQueue = callResult.response?.functionCalls() ?? [];

                    console.log("🤖", callResult.response.text(), `Response ${calls}`);
                    if (callQueue.length === 0) {
                        askQuestion()
                        return
                    };
                }
                console.log("AI : ", result.response.text()); // Log state after response
                askQuestion(); // Recursively ask for the next message
            } catch (error) {
                console.error("Error:", error);
                rl.close();
            }
        });
    };

    askQuestion(); // Start the conversation
}

chatWithGemini();
