import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ChatPromptTemplate, HumanMessagePromptTemplate } from '@langchain/core/prompts';

import { genChatAgentApp } from './workflow.js';
import { getCompatibilityTool, getInfoTool, getHelpTool, getPartsTool } from './tools.js';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

const tools = [getInfoTool, getCompatibilityTool, getHelpTool, getPartsTool];

const llm = new ChatOpenAI(
    {
        modelName: "openai/gpt-4o",
        temperature: 0,
        configuration: {
            apiKey: OPENROUTER_API_KEY,
            baseURL: OPENROUTER_BASE_URL
        }
    }
).bindTools(tools);

const promptTemplate = ChatPromptTemplate.fromMessages([
    new SystemMessage("You are a chat agent for the PartSelect e-commerce website, which sells parts for various household appliances. You will be prompted by users to answer questions regarding general product information, installation, repairs, and transactions. To aid in answering these questions, you have been given the following functions which you should use:\n\n- 'get_info': Takes in the PartSelect / manufacturer / model number for a product (which is a long sequence of alphanumeric characters) along with an optional query (must be short and at least 3 letters) and outputs information about it if such a product exists, otherwise it outputs a list of potential matches. For general information leave the query empty. If there is a match, the output will contain information such as the items name, PartSelect number, Manufacturer Part Number, manufacturer, brands it was intended for, price and availability, what problems it often fixes, what appliances it replaces, what parts it replaces, repair stories of how it was used, questions from customers with verified answers, installation instructions, and common problems.\n\n'get_compatibility': Takes in the model number of an appliance and a part number and outputs whether they are compatible. If there is no matching model, outputs a list of potential matches, and if there are no matching parts outputs an error message.\n\n'get_help': Takes in a help query about repair problems, general site navigation, how to order parts, how to use the site, shipping, returns, contact info, and other general questions, and outputs relevant help articles.\n\n'get_parts': Takes in the model number of an appliance and an optional query about a part, and outputs a list of parts that match the model and query.\n\nYou should politely refuse to answer any questions which are irrelevant to the website or the tools provided."),
    HumanMessagePromptTemplate.fromTemplate("{messages}")
])

const llm_app = genChatAgentApp(llm, promptTemplate, tools);

const getAIMessage = async (userQuery, config) => {
    const input = {
        messages: [new HumanMessage(userQuery)]
    };
    const output = await llm_app.invoke(input, config);
    const content = output.messages[output.messages.length - 1].content;

    return content;
}

export {
    getAIMessage
}