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
    console.log("Number of QnA pairs loaded:", qna.length);
  
    const vectorStore = await HNSWLib.load("qna", new OpenAIEmbeddings());
    const searchResult = await vectorStore.similaritySearch(query, 2);
    console.log("Raw search results:", searchResult);

    const searchResultIds = searchResult.map((r) => r.metadata.id);
    console.log("Search result IDs:", searchResultIds);
    
    let results = qna.filter((entry) => searchResultIds.includes(parseInt(entry.id)));
    console.log("Filtered search results:", results);
  
    return results;

  }
  
  // Example usage
  searchQnA("Do you have a degree?").then(results => {
    console.log("Final results:", results);
  }).catch(error => {
    console.error("Search error:", error);
  });
  
