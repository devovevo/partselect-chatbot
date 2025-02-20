// import { ChatOpenAI } from '@langchain/openai';
// import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';

// import { genChatAgentApp } from './src/api/workflow.js';

// import { v4 as uuidv4 } from 'uuid';

// const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
// const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// const llm = new ChatOpenAI(
//     {
//         modelName: "deepseek/deepseek-chat",
//         temperature: 0,
//         configuration: {
//             apiKey: OPENROUTER_API_KEY,
//             baseURL: OPENROUTER_BASE_URL
//         }
//     }
// );

// const app = genChatAgentApp(llm);
// const config = { configurable: { thread_id: uuidv4() } };

// export const getAIMessage = async (userQuery) => {
//     const input = {
//         messages: [new HumanMessage(userQuery)]
//     };
//     const output = await app.invoke(input, config);
//     const content = output.messages[output.messages.length - 1].content;

//     return output;
// }

// console.log(await getAIMessage("What is the price of a refrigerator?"));