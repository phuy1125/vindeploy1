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

  //User's favorite travel
  userPreference: Annotation<string>,

  //User's travel history
  tripPlan: Annotation<string>,

  //Check if user is logged in
  userLogIn: Annotation<boolean>,
});

export type GraphAnnotationType = typeof GraphAnnotation.State;
