import * as cheerio from "cheerio";

import express from "express";
import cors from "cors";

import { getAIMessage } from "./llm/llm.js";

const web_app = express();
web_app.use(cors());

const PORT = process.env.PORT || 5000;
web_app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

web_app.get("/info", async (req, res) => {
    res.json(await getInfo(req.query.id));
});

web_app.get("/chat", async (req, res) => {
    console.log("Recieved request");

    const config = { configurable: { thread_id: req.query.id } };
    const message = await getAIMessage(req.query.q, config);

    console.log("Recieved response");
    console.log(message);

    res.json({ response: message });
});