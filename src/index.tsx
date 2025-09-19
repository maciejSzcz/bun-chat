import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { serve } from "bun";
import index from "./index.html";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const server = serve({
  port: process.env.PORT || 3000,
  hostname: process.env.HOST || "0.0.0.0",
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/claude-chat": {
      async POST(req) {
        try {
          const { message, conversationHistory } = await req.json();

          if (!message) {
            return Response.json(
              { error: "Message is required" },
              { status: 400 }
            );
          }

          // Create a conversation context from the history
          const context = conversationHistory
            .slice(-5) // Keep last 5 messages for context
            .map(
              (msg: any) =>
                `${msg.role === "user" ? "Human" : "Assistant"}: ${msg.content}`
            )
            .join("\n");

          const prompt = context
            ? `Previous conversation:\n${context}\n\nHuman: ${message}\n\nAssistant:`
            : `Human: ${message}\n\nAssistant:`;

          // Generate response using Claude Code
          const result = await generateText({
            model: openrouter("openai/gpt-5"),
            prompt: prompt,
          });

          const response = await result.text;

          return Response.json({
            response: response,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error("Claude API error:", error);
          return Response.json(
            {
              error: "Failed to generate response",
              details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
          );
        }
      },
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(
  `🚀 Server running at http://${process.env.HOST || "0.0.0.0"}:${
    process.env.PORT || 3000
  }`
);
