import { BaseMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export enum Intent {
  General = "general",
  Search = "search",
  Greeting = "greeting",
  Accommodation = "accommodation",
  Destination = "destination",
  Transportation = "transportation",
  Activities = "activities",
}

export const GraphAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,

  //Detect intent of the user query
  intent: Annotation<Intent>,

  last_intent: Annotation<Intent>,
});

export type GraphAnnotationType = typeof GraphAnnotation.State;
