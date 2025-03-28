"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
// Remove the useChat import since we'll implement our own chat functionality
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, X, ChevronDown, MoonIcon, SunIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import ImageSlider from "@/components/image-slider"
import ContentModal from "@/components/content-modal"
import { useTheme } from "next-themes"

// Define message type
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  // Replace useChat hook with our own state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [showImageSlider, setShowImageSlider] = useState(false)
  const [modalContent, setModalContent] = useState<{ type: string; content: string; isLoading: boolean; error: string | null } | null>(null)
  const [selectedCompany, setSelectedCompany] = useState("HDB")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Custom input handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Custom submit handler that calls the API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: "user",
      content: input
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await fetch("https://corpus-finance.onrender.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company: selectedCompany,
          messages: [userMessage]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant response to chat
      if (data.messages && data.messages.length > 0) {
        const assistantMessage = data.messages.find((msg: Message) => msg.role === "assistant");
        if (assistantMessage) {
          setMessages(prev => [...prev, assistantMessage]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          role: "assistant", 
          content: "Sorry, I encountered an error while processing your request." 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const hasImages = messages.some(
      (message) =>
        message.role === "assistant" &&
        message.content.includes("![") &&
        message.content.includes("](")
    )
    setShowImageSlider(hasImages)
  }, [messages])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setAudioStream(stream)
      setIsRecording(true)

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // Combine audio chunks into a Blob
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })

        // Update input to show a transcribing indicator
        setInput("Transcribing audio...");

        // Prepare the form data for the request
        const formData = new FormData()
        formData.append("file", audioBlob, "recording.wav")
        formData.append("model", "whisper-1")

        try {
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          // If the response isn't OK, read the error text and throw a detailed error
          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Transcription failed: ${errorText}`)
          }

          const data = await response.json()
          // Set the transcribed text in the input field
          setInput(data.text);
        } catch (error) {
          console.error("Error transcribing audio:", error)
          setInput("Sorry, I couldn't transcribe your message.");
        }
      }
      
      // Start the recording
      mediaRecorder.start()
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      if (audioStream) {
        audioStream.getTracks().forEach((track) => track.stop())
      }
      setAudioStream(null)
      setIsRecording(false)
    }
  }

  const openModal = async (type: string) => {
    // Initialize modal with loading state
    setModalContent({ 
      type, 
      content: "", 
      isLoading: true, 
      error: null 
    })
    
    try {
      // Determine the endpoint based on type
      const endpoint = type === "story" 
        ? `https://corpus-finance.onrender.com/api/story/${selectedCompany}`
        : `https://corpus-finance.onrender.com/api/article/${selectedCompany}`;
        
      const response = await fetch(
        endpoint, 
        {
            method: "POST",
            body: "",
          }
      );
      console.log(response)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}: ${response.statusText}`);
      }
      
      const data = await response.text();
      
      // Update modal with fetched content
      setModalContent({
        type,
        content: data,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setModalContent({
        type,
        content: "",
        isLoading: false,
        error: error instanceof Error ? error.message : "An unknown error occurred"
      });
    }
  }

  const closeModal = () => {
    setModalContent(null)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isRecording) {
      stopRecording()
    }
    handleSubmit(e)
  }

  // Extract images from assistant messages using markdown image syntax
  const extractImages = () => {
    const imageRegex = /!\[.*?\]\((.*?)\)/g
    const images: string[] = []
    messages.forEach((message) => {
      if (message.role === "assistant") {
        let match
        const content = message.content
        while ((match = imageRegex.exec(content)) !== null) {
          images.push(match[1])
        }
      }
    })
    return images.length ? images : ["https://imgs.search.brave.com/SwNS1npnTd0RJtqd0lf_hya5M8VsUA2-gYkdniv901Y/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZWpvdXJuYWwub3Jn/L3dwLWNvbnRlbnQv/dXBsb2Fkcy8yMDI1/LzAyL0luQ29tbXVu/aXR5LVJlYWRpbmct/R3JvdXBzLU1hcF9G/ZWItMjAyNS5qcGc"]
  }

  const images = extractImages()

  return (
    <div className="flex flex-col h-dvh bg-zinc-50 dark:bg-zinc-900">
      <header className="p-4 border-b w-full border-zinc-200 dark:border-zinc-800 backdrop-blur-sm bg-white/50 dark:bg-zinc-950/50 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-40 justify-between">
                {selectedCompany}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCompany("HDB")}>
                HDFC
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCompany("INFY")}>
                Infosys
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCompany("LICI.NS")}>
                LIC
              </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden max-md:flex-col">
        <div className={`flex-1 flex flex-col ${showImageSlider ? "w-1/2" : "w-full"} transition-all duration-300 m-5 rounded-3x`}> 
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-3 rounded-xl shadow-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-[bounce_1s_infinite]"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-[bounce_1s_infinite_0.1s]"></div>
                    <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 animate-[bounce_1s_infinite_0.2s]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

            <div className="flex flex-col justify-between items-center rounded-4xl">
            <div className="md:w-[60%] w-[100%] p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm sticky bottom-0">
            <form onSubmit={handleFormSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1"
                disabled={isLoading}
              />
              {!isRecording ? (
                <Button type="button" variant="outline" size="icon" onClick={startRecording} disabled={isLoading}>
                  <Mic className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" variant="destructive" size="icon" onClick={stopRecording}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit" size="icon" disabled={isLoading || (!input && !isRecording)}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-center space-x-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm md:w-[60%] w-[100%]">
            <Button onClick={() => openModal("story")} variant="outline">
              Story
            </Button>
            <Button onClick={() => openModal("article")} variant="outline">
              Article
            </Button>
          </div>
            </div>
        </div>

        {showImageSlider && images.length > 0 && (
          <div className="w-1/2 border-l animate-slide-in m-5 rounded-3xl">
            <ImageSlider images={images} />
          </div>
        )}
      </div>

      {modalContent && (
        <ContentModal
          title={modalContent.type === "story" ? "Story" : "Article"}
          content={modalContent.isLoading 
            ? "Loading..." 
            : modalContent.error 
              ? `Error: ${modalContent.error}` 
              : modalContent.content}
          onClose={closeModal}
        />
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      <SunIcon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
