import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import { TextLoader } from "langchain/document_loaders/fs/text";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { OpenAIEmbeddings } from "@langchain/openai";

const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large"
});
const helpInfoVectorStore = new MemoryVectorStore(embeddings);

const docsPath = "//home/devovevo/Instalily/case-study/back-end/scrape/docs/";

const loader = new DirectoryLoader(docsPath, {
    ".txt": (path) => new TextLoader(path)
});
const docs = await loader.load();

const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
});

const splits = await splitter.splitDocuments(docs);
await helpInfoVectorStore.addDocuments(splits);

export {
    helpInfoVectorStore
}