import { Intent, GraphAnnotation } from "./state";
import { AIMessage } from "@langchain/core/messages";

import { z } from "zod";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  END,
  START,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import {
  CLASSIFY_INTENT_PROMPT,
  SYSTEM_PROMPT_TEMPLATE,
  WEBSITE_INFO_PROMPT,
  SEARCH_SYSTEM_PROMPT,
} from "./prompt";
import { TOOLS } from "../agent/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import "dotenv/config";

// MemorySaver instance for saving state
const memory = new MemorySaver();

// Function to generate a random thread_id between 1 and 100000
function generateThreadId(): number {
  return Math.floor(Math.random() * 100000) + 1;
}

const intentSchema = z.object({
  query: z.string().describe("The user query or input to classify the intent"),
  intentType: z
    .enum([
      Intent.General,
      Intent.Search,
      Intent.Greeting,
      Intent.Accommodation,
      Intent.Destination,
      Intent.Transportation,
      Intent.Activities,
    ])
    .describe("The type of intent"),
});

function buildContextMessage(messages: any[], limit = 4): string {
  const filtered = messages.filter(
    (m) =>
      m.type === "user" ||
      m.role === "user" ||
      m.type === "ai" ||
      m.role === "assistant"
  );

  if (filtered.length === 0 && messages.length > 0) {
    // Nếu filter không có gì, fallback lấy thẳng tin nhắn cuối
    return messages[messages.length - 1]?.content || "";
  }

  if (filtered.length <= 1) {
    const lastMessage = filtered[filtered.length - 1];
    if (!lastMessage) return "";
    return lastMessage.content;
  }

  const recentMessages = filtered.slice(-limit);

  const context = recentMessages
    .map((msg) => {
      const prefix = msg.type === "user" || msg.role === "user" ? "User" : "AI";
      return `${prefix}: ${msg.content}`;
    })
    .join("\n");

  return context;
}

async function classifyIntent(
  state: typeof GraphAnnotation.State
): Promise<typeof GraphAnnotation.Update> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
  }).withStructuredOutput(intentSchema);

  const contextMessage = buildContextMessage(state.messages);

  if (!contextMessage.trim()) {
    console.warn("No valid conversation history. Defaulting to 'general'.");
    return { intent: Intent.General };
  }

  const lastIntent = state.intent || "general";

  const SystemPrompt = CLASSIFY_INTENT_PROMPT.replace(
    "{user_query}",
    contextMessage
  ).replace("{last_intent}", lastIntent);

  const response = await model.invoke([
    { role: "system", content: SystemPrompt },
    { role: "user", content: contextMessage },
  ]);

  const classifiedIntent = response.intentType;

  console.log(">>> CLASSIFIED_INTENT:", classifiedIntent);

  return {
    intent: classifiedIntent,
  };
}

function routeModelOutput(state: typeof MessagesAnnotation.State): string {
  const messages = state.messages;
  const lastMessage = messages[messages.length - 1];
  if ((lastMessage as AIMessage)?.tool_calls?.length || 0 > 0) {
    return "tools";
  } else {
    return END;
  }
}

async function callModel(
  state: typeof GraphAnnotation.State
): Promise<typeof GraphAnnotation.Update> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  }).bindTools(TOOLS);

  let promptTemplate = "";
  const intent = state.intent;

  switch (intent) {
    case "general":
      promptTemplate = SYSTEM_PROMPT_TEMPLATE;
      break;
    case "search":
      promptTemplate = SEARCH_SYSTEM_PROMPT;
      break;
    case "greeting":
      promptTemplate = WEBSITE_INFO_PROMPT;
      break;
    case "accommodation":
      promptTemplate = SEARCH_SYSTEM_PROMPT;
      break;
    case "destination":
      promptTemplate = SEARCH_SYSTEM_PROMPT;
      break;
    case "transportation":
      promptTemplate = SEARCH_SYSTEM_PROMPT;
      break;
    case "activities":
      promptTemplate = SEARCH_SYSTEM_PROMPT;
      break;
    default:
      promptTemplate = SYSTEM_PROMPT_TEMPLATE;
  }

  console.log(">>> SYSTEM_PROMPT:", promptTemplate);

  const response = await model.invoke([
    {
      role: "system",
      content: promptTemplate,
    },
    ...state.messages,
  ]);

  return {
    messages: [...state.messages, response],
  };
}

// Define the workflow with thread_id generation
const workflow = new StateGraph(GraphAnnotation)
  .addNode("classify_intent", classifyIntent)
  .addNode("callModel", callModel)
  .addNode("tools", new ToolNode(TOOLS))
  .addEdge(START, "classify_intent")
  .addEdge("classify_intent", "callModel")
  .addConditionalEdges("callModel", routeModelOutput)
  .addEdge("tools", "callModel");

export const graph = workflow.compile({ checkpointer: memory });
