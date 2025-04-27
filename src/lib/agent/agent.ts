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

async function getOrCreateThreadId(
  state: typeof GraphAnnotation.State
): Promise<number> {
  // Check if thread_id already exists in the state
  if (state.threadID) {
    return state.threadID;
  } else {
    // If not, generate a new thread_id and save it in the state
    const newThreadId = generateThreadId();
    return newThreadId;
  }
}

async function classifyIntent(
  state: typeof GraphAnnotation.State
): Promise<typeof GraphAnnotation.Update> {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0,
  }).withStructuredOutput(intentSchema);

  const lastMessage = state.messages[state.messages.length - 1].content;

  const prompt = CLASSIFY_INTENT_PROMPT.replace(
    "{user_query}",
    lastMessage as string
  );
  const response = await model.invoke([{ role: "user", content: prompt }]);
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
