import type { ChatMessage } from "@/lib/types";

export default function ChatMessageBubble({ msg }: { msg: ChatMessage }) {
  if (msg.role === "user") {
    return (
      <div className="self-end max-w-[88%] bg-bg-elevated rounded-xl rounded-br-sm px-3 py-2 text-xs text-text-secondary">
        {msg.content}
      </div>
    );
  }
  return (
    <div className="self-start max-w-[95%] border-l-2 border-accent-green/30 pl-3 text-xs text-text-muted leading-relaxed">
      {msg.content}
    </div>
  );
}
