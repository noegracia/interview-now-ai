import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

import OpenAI from "openai";
import config from "./src/config.js"; // Import the config file

const { user, systemPrompt, GPT_API_KEY, model } = config;

const openai = new OpenAI({
  apiKey: GPT_API_KEY
});

// const response = await openai.listEngines();


const app = express();
const port = 3001;

app.use(bodyParser.json());
app.use(cors());

import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import fs from "fs";
import csv from "csv-parser"; // Ensure this is compatible with your setup

import dotenv from 'dotenv';
dotenv.config();

async function loadQnAData() {
  const qna = [];
  await new Promise((resolve, reject) => {
    let index = 0; // Initialize an index to use as an ID
    fs.createReadStream('./data/qna.csv')
      .pipe(csv())
      .on('data', (row) => {
        qna.push({ ...row, id: index }); // Add the index as an ID
        index++;
      })
      .on('end', resolve)
      .on('error', reject);
  });
  return qna;
}


async function searchQnA(query) {
  if (!query) {
    throw new Error("Missing query");
  }

  const qna = await loadQnAData();
  // console.log("Number of QnA pairs loaded:", qna.length);

  const vectorStore = await HNSWLib.load("qna", new OpenAIEmbeddings());
  const searchResult = await vectorStore.similaritySearch(query, 2);
  // console.log("Raw search results:", searchResult);

  const searchResultIds = searchResult.map((r) => r.metadata.id);
  // console.log("Search result IDs:", searchResultIds);
  
  let results = qna.filter((entry) => searchResultIds.includes(parseInt(entry.id)));
  // console.log("Filtered search results:", results);

  return results;

}

app.post("/", async (req, res) => {
  try {
    const chatMessages = req.body;

    console.log(req.body);
    
    // Search for the most similar QnA pair
    const searchResult = await searchQnA(chatMessages[chatMessages.length - 1].message);
    const contextPrompt = "You can use the following context to answer the question:\n\n" + JSON.stringify(searchResult) + "\n\n";

    const systemMessage = { //  Explain things like you're talking to a software professional with 5 years of experience.
      "role": "system", "content": systemPrompt + contextPrompt
    }



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

    console.log(myApiRequestBody);

    // Call OpenAI API
    const openaiResponse = await openai.chat.completions.create(myApiRequestBody);

    // Send back OpenAI response
    console.log(openaiResponse.choices[0].message);
    res.json({ openaiResponse: openaiResponse.choices[0].message }); // Assuming you want to send the first choice text back

    } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal Server Error" });
    }
    });

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


