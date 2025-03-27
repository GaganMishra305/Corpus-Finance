// File: /api/transcribe.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Optional: log formData keys and values for debugging
    for (const key of formData.keys()) {
      console.log("formData key:", key, formData.get(key));
    }
    
    // Use a configurable model; default to "whisper-1"
    const model = process.env.TRANSCRIPTION_MODEL || "whisper-1";
    
    // Append the model to formData if not already provided
    if (!formData.has("model")) {
      formData.append("model", model);
    }
    
    // Forward the request to the transcription API endpoint
    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: "Transcription service error", details: errorData },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Failed to process transcription" },
      { status: 500 }
    );
  }
}
