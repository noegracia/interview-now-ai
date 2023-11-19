import dotenv from 'dotenv';
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import fs from "fs";
import csv from "csv-parser";

dotenv.config();

const generateEmbeddings = async () => {
  try {
    const start = performance.now() / 1000;
    const qna = [];

    // Read and process the CSV file
    await new Promise((resolve, reject) => {
      fs.createReadStream("./data/qna.csv")
        .pipe(csv())
        .on("data", (row) => qna.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    // Transform the data
    const textsToEmbed = qna.map(
      (entry) =>
        `Question: ${entry.question}\n\nAnswer: ${entry.answer}\n\nContext: ${entry.context}\n\n`
    );

    const metadata = qna.map((entry, index) => ({ id: index }));

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await HNSWLib.fromTexts(
      textsToEmbed,
      metadata,
      embeddings
    );

    // Saves the embeddings in the ./qna directory in the root directory
    await vectorStore.save("qna");

    const end = performance.now() / 1000;

    console.log(`Took ${(end - start).toFixed(2)}s`);
  } catch (error) {
    console.error(error);
  }
};

generateEmbeddings();
