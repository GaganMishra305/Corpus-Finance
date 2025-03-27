"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
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

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()
  const [isRecording, setIsRecording] = useState(false)
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const [showImageSlider, setShowImageSlider] = useState(false)
  const [modalContent, setModalContent] = useState<{ type: string; content: string } | null>(null)
  const [selectedCompany, setSelectedCompany] = useState("Company A")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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
        handleInputChange({ target: { value: "Transcribing audio..." } } as React.ChangeEvent<HTMLInputElement>)

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
          handleInputChange({ target: { value: data.text } } as React.ChangeEvent<HTMLInputElement>)
        } catch (error) {
          console.error("Error transcribing audio:", error)
          handleInputChange({
            target: { value: "Sorry, I couldn't transcribe your message." },
          } as React.ChangeEvent<HTMLInputElement>)
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

  const openModal = (type: string) => {
    const content =
      type === "story"
        ? "This is an interesting story about AI and its impact on our daily lives..."
        : "This article discusses the latest advancements in chatbot technology..."
    setModalContent({ type, content })
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
    return images
  }

  const images = extractImages()

  return (
    <div className="flex flex-col h-dvh bg-zinc-50 dark:bg-zinc-900">
      <header className="p-4 border-b border-zinc-200 dark:border-zinc-800 backdrop-blur-sm bg-white/50 dark:bg-zinc-950/50 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-40 justify-between">
                {selectedCompany}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSelectedCompany("Company A")}>
                Company A
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCompany("Company B")}>
                Company B
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCompany("Company C")}>
                Company C
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ThemeToggle />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className={`flex-1 flex flex-col ${showImageSlider ? "w-1/2" : "w-full"} transition-all duration-300`}>
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
          </div>

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm sticky bottom-0">
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

          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-center space-x-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm">
            <Button onClick={() => openModal("story")} variant="outline">
              Story
            </Button>
            <Button onClick={() => openModal("article")} variant="outline">
              Article
            </Button>
          </div>
        </div>

        {showImageSlider && images.length > 0 && (
          <div className="w-1/2 border-l animate-slide-in">
            <ImageSlider images={images} />
          </div>
        )}
      </div>

      {modalContent && (
        <ContentModal
          title={modalContent.type === "story" ? "Story" : "Article"}
          content={modalContent.content}
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
