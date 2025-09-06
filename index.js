require("dotenv").config();
const express = require("express");
const connectDB = require("./services/db");
const app = express();
const port = process.env.PORT || 3000;
const geminiRoute = require("./routes/geminiRoute");
connectDB();
//middlewares

app.use(express.json()); // To parse incoming JSON requests

app.use("/api", geminiRoute);
// Routes

// Listen
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
