require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  functionDeclarations,
  functions,
  systemInstruction,
  geminiModel,
} = require("../configs/geminiConfig");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Set up Gemini model with tool functions
const model = genAI.getGenerativeModel({
  model: geminiModel,
  systemInstruction,
  tools: {
    functionDeclarations,
  },
});

const chat = model.startChat();
async function getAiResponse(inputMessage) {
  try {
    const result = await chat.sendMessage(inputMessage);
    let callQueue = result.response.functionCalls() ?? [];
    let calls = 0;
    let callResults = []; // Store function call results

    while (callQueue && callQueue.length > 0) {
      calls++;
      console.log(`This is call ${calls}`);

      const callName = callQueue[0].name;
      const callArg = callQueue[0].args ?? null;

      const callResponse = await functions[callName](callArg);
      console.log(callResponse);

      callResults.push({
        name: callName,
        args: callArg,
        response: callResponse
      });

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
        return {
          response: callResult.response.text(), // AI-generated response
          functionCalls: callResults.map(result => {
            return {
              functionName: result.name, // Name of the function called
              description: functionDeclarations.find(func => func.name === result.name)?.description || "No description available",
              parameters: result.args, // Parameters passed to the function
              output: result.response, // Output returned by the function
            }
          })
        };
      }
    }
    return {
      success: true,
      response: result.response.text(), // AI-generated response
    }; // Final response if no further function calls are made
  } catch (error) {
    console.error("Error:", error);
    throw new Error("Something went wrong while interacting with the AI.");
  }
}


module.exports = getAiResponse;
