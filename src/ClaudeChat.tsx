import { useEffect, useRef, useState } from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export function ClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm gpt-5, powered by the AI SDK. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/claude-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "1",
        content:
          "Hello! I'm gpt-5, powered by the AI SDK. How can I help you today?",
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="mt-4 sm:mt-8 mx-auto w-full max-w-4xl px-2 sm:px-0">
      <div className="bg-[#1a1a1a] border-2 border-[#fbf0df] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#fbf0df] text-[#1a1a1a] px-3 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <h2 className="text-base sm:text-lg font-bold">GPT-5 AI Chat</h2>
          <button
            onClick={clearChat}
            className="text-xs sm:text-sm bg-[#1a1a1a] text-[#fbf0df] px-2 sm:px-3 py-1 rounded hover:bg-[#333] transition-colors"
          >
            Clear Chat
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 sm:h-96 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-lg px-3 sm:px-4 py-2 ${
                  message.role === "user"
                    ? "bg-[#fbf0df] text-[#1a1a1a]"
                    : "bg-[#333] text-[#fbf0df]"
                }`}
              >
                <div className="text-xs sm:text-sm font-medium mb-1">
                  {message.role === "user" ? "You" : "GPT-5"}
                </div>
                <div className="whitespace-pre-wrap text-sm sm:text-base break-words">
                  {message.content}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#333] text-[#fbf0df] rounded-lg px-3 sm:px-4 py-2 max-w-[85%] sm:max-w-[80%]">
                <div className="text-xs sm:text-sm font-medium mb-1">GPT-5</div>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-[#fbf0df]"></div>
                  <span className="text-sm sm:text-base">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="p-3 sm:p-4 border-t border-[#333]"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 bg-[#333] text-[#fbf0df] border border-[#555] rounded-lg px-3 py-2 text-sm sm:text-base focus:outline-none focus:border-[#fbf0df] placeholder-[#fbf0df]/50"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#fbf0df] text-[#1a1a1a] px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base hover:bg-[#f3d5a3] disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
