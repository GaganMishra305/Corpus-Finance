import { openai } from "@ai-sdk/openai"
import { streamText, type Message } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json()

  // Filter through messages and remove base64 image data to avoid sending to the model
  const formattedMessages = messages.map((m) => {
    if (m.role === "user" && m.content.includes("data:image")) {
      // Keep the message but note that it contained an image
      return {
        ...m,
        content: m.content.replace(/data:image\/[^;]+;base64,[^"]+/g, "[Image attached]"),
      }
    }
    return m
  })

  const result = streamText({
    model: openai("gpt-4o"),
    messages: formattedMessages,
  })

  return result.toDataStreamResponse()
}

