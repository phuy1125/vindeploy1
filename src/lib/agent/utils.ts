import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";

export function formatMessages(messages: BaseMessage[]): string {
  return messages
    .map((msg, idx) => {
      const msgType =
        "_getType" in msg
          ? msg._getType()
          : "type" in msg
          ? (msg as Record<string, any>)?.type
          : "unknown";
      const messageContent =
        typeof msg.content === "string"
          ? msg.content
          : msg.content
              .flatMap((c) => ("text" in c ? (c.text as string) : []))
              .join("\n");
      return `<${msgType} index="${idx}">\n${messageContent}\n</${msgType}>`;
    })
    .join("\n");
}

export function getRecentMessages(
  messages: BaseMessage[],
  maxCount = 3
): BaseMessage[] {
  const recent: BaseMessage[] = [];

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg instanceof HumanMessage || msg instanceof AIMessage) {
      recent.unshift(msg);
    }
    if (recent.length === maxCount) break;
  }

  return recent;
}
