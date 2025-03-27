"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface ImageSliderProps {
  images: string[]
}

export default function ImageSlider({ images }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1
    setCurrentIndex(newIndex)
  }

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1
    const newIndex = isLastImage ? 0 : currentIndex + 1
    setCurrentIndex(newIndex)
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold">Images</h2>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4">
        <div className="relative w-full h-full">
          <Image
            src={images[currentIndex] || "/placeholder.svg?height=400&width=400"}
            alt={`Image ${currentIndex + 1}`}
            className="object-contain"
            fill
          />
        </div>

        {images.length > 1 && (
          <>
            <Button variant="outline" size="icon" className="absolute left-4 rounded-full" onClick={goToPrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="icon" className="absolute right-4 rounded-full" onClick={goToNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      <div className="p-4 border-t">
        <div className="flex justify-center space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-primary" : "bg-gray-300"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

