import { trimMessages } from "@langchain/core/messages";
import { ToolNode } from "@langchain/langgraph/prebuilt";

import {
    START,
    END,
    MessagesAnnotation,
    StateGraph,
    MemorySaver,
} from "@langchain/langgraph";

const trimmer = trimMessages({
    maxTokens: 50,
    strategy: "last",
    tokenCounter: (msgs) => msgs.length,
    includeSystem: true,
    allowPartial: false,
    startOn: "human",
});

const genChatAgentApp = (llm, promptTemplate, tools) => {
    // Whether the agent will simply continue or call a tool
    const shouldContinue = (state) => {
        const { messages } = state;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage.tool_calls?.length) {
            return "tools";
        }

        return END;
    }
    // Define the function that calls the model
    const callModel = async (state) => {
        const trimmedMessages = await trimmer.invoke(state.messages);
        const prompt = await promptTemplate.invoke({ messages: trimmedMessages });
        const response = await llm.invoke(prompt);

        return { messages: response };
    };

    const toolNode = new ToolNode(tools);

    // Define a new graph
    const workflow = new StateGraph(MessagesAnnotation)
        // Define the node and edge
        .addNode("model", callModel)
        .addNode("tools", toolNode)
        .addEdge(START, "model")
        .addEdge("tools", "model")
        .addConditionalEdges("model", shouldContinue, ["tools", END]);

    // Add memory
    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });

    return app;
}

export {
    genChatAgentApp
}