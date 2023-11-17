import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { Configuration, OpenAIApi } from "openai";

const { Configuration, OpenAIApi } = OpenAI;
const { user, systemPrompt, GPT_API_KEY, model } = config;

const configuration = new Configuration({
  organization: "org-1IsfDe2Mml99uwYUBnqiaENh",
  apiKey: GPT_API_KEY,
});
const openai = new OpenAIApi(configuration);
// const response = await openai.listEngines();

const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
  "role": "system", "content": systemPrompt
}

const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());


app.post("/", async (req, res) => {
  try {
    const chatMessages = req.body;

    // Transform chat messages into OpenAI format
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "GPT" ? "assistant" : "user";
      return { role: role, content: messageObject.message };
    });

    // Create OpenAI request body
    const myApiRequestBody = {
      model: model,
      messages: [
        systemMessage,
        ...apiMessages
      ],
    };

    // Call OpenAI API
    const openaiResponse = await fetch("http://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GPT_API_KEY}`, // Replace with your OpenAI API key
      },
      body: JSON.stringify(myApiRequestBody),
    });

    // Parse and send back OpenAI response
    const openaiData = await openaiResponse.json();
    res.json({ openaiResponse: openaiData.choices[0].text }); // Assuming you want to send the first choice text back
    } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
    });

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


