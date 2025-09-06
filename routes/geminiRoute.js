const express = require("express");
const getAiResponse = require("../services/geminiChatService");
const router = express.Router();

router.get("/", async (req, res, next) => {
  const { prompt } = req.query;
  const AiResponse = await getAiResponse(prompt);
  res.json({
    user: prompt,
    aiAgent: AiResponse,
  });
});

module.exports = router;
