import { tool } from "@langchain/core/tools"
import { z } from "zod";

import { getInfo, getPartCompatibility, getParts } from "../scrape/utils.js";
import { ppInfoResult, ppCompatibilityResult, ppPartsResult } from "../scrape/pp.js";
import { helpInfoVectorStore } from "./vector_store.js";

const getInfoTool = tool(
    async ({ part_num, query = "" }) => {
        console.log("Tool called with part_num: ", part_num);

        const infoResult = await getInfo(part_num, query);
        return ppInfoResult(infoResult);
    },
    {
        name: "get_info",
        description: "This function takes in the PartSelect / manufacturer / model number of a product (which is a long sequence of alphanumeric characters) along with an optional query (must be simple and at least 3 letters, i.e. 'leaking', 'pump', 'broken' or 'fit') and outputs information about it specific to that query. For general information leave the query empty.",
        schema: z.object({
            part_num: z.string().describe("The PartSelect / manufacturer / model number of the product (which is a long sequence of alphanumeric characters)."),
            query: z.string().optional().describe("An optional query (must be simple and at least 3 letters, i.e. 'leaking', 'pump', 'broken' or 'fit'). For general information leave this empty.")
        })
    }
);

const getCompatibilityTool = tool(
    async ({ model_number, part_number }) => {
        return ppCompatibilityResult(await getPartCompatibility(model_number, part_number));
    },
    {
        name: "get_compatibility",
        description: "This function takes in the model number of an appliance and the PartSelect / manufacturer number of a part (both of these are long sequences of alphanumeric characters) and outputs whether they are compatible.",
        schema: z.object({
            model_number: z.string().describe("The model number of the appliance (a long sequence of alphanumeric characters)."),
            part_number: z.string().describe("The PartSelect / manufacturer number of the part (a long sequence of alphanumeric characters).")
        })
    }
)

const getPartsTool = tool(
    async ({ model_number, query = "" }) => {
        return ppPartsResult(await getParts(model_number, query));
    },
    {
        name: "get_parts",
        description: "This function takes in the model number of an appliance and an optional query (this should be simple and consist of keywords, e.g. 'leaking', 'pump', 'broken' or 'fit') about a part, and outputs a list of parts that match the model and query.",
        schema: z.object({
            model_number: z.string().describe("The model number of the appliance (a long sequence of alphanumeric characters)."),
            query: z.string().optional().describe("The query about a part (simple and consisting of keywords, e.g. 'leaking', 'pump', 'broken' or 'fit').")
        })
    }
);


const getHelpTool = tool(
    async ({ query }) => {
        const retrievedDocs = await helpInfoVectorStore.similaritySearch(query);
        const serialized = retrievedDocs
            .map(
                (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
            )
            .join("\n");

        return [serialized, retrievedDocs];
    },
    {
        name: "get_help",
        description: "This function takes in a help query about repair problems, general site navigation, how to order parts, how to use the site, shipping, returns, and other general questions, and outputs relevant help articles.",
        schema: z.object({
            query: z.string().describe("The help query.")
        })
    }
)

export {
    getInfoTool,
    getCompatibilityTool,
    getPartsTool,
    getHelpTool
}