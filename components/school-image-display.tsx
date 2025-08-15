'use client'

import Image from 'next/image'
import { useState } from 'react'

interface SchoolImageProps {
  school: {
    id: string
    name: string
    imageUrl?: string
    bannerUrl?: string
  }
  width?: number
  height?: number
  className?: string
  objectFit?: 'cover' | 'contain' | 'fill'
  onError?: (error: any) => void
}

export function SchoolPreviewImage({
  school,
  width = 200,
  height = 200,
  className = '',
  objectFit = 'cover',
  onError
}: SchoolImageProps) {
  const [imageError, setImageError] = useState(false)
  
  const handleError = (error: any) => {
    setImageError(true)
    onError?.(error)
  }

  if (imageError || !school.imageUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-purple-800/30 ${className}`}
        style={{ width, height }}
      >
        <div className="text-center">
          <div className="text-purple-300 text-2xl font-bold">
            {school.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={school.imageUrl}
      alt={`${school.name} preview`}
      width={width}
      height={height}
      className={className}
      style={{ objectFit }}
      onError={handleError}
    />
  )
}

export function SchoolBannerImage({
  school,
  className = '',
  objectFit = 'cover',
  onError
}: SchoolImageProps) {
  const [imageError, setImageError] = useState(false)
  
  const handleError = (error: any) => {
    setImageError(true)
    onError?.(error)
  }

  if (imageError || !school.bannerUrl) {
    return (
      <div 
        className={`flex items-center justify-center bg-purple-800/30 w-full h-full ${className}`}
      >
        <div className="text-center">
          <div className="text-purple-300 text-lg font-semibold">
            {school.name}
          </div>
          <div className="text-purple-400 text-sm mt-1">
            Banner image
          </div>
        </div>
      </div>
    )
  }

  return (
    <Image
      src={school.bannerUrl}
      alt={`${school.name} banner`}
      fill
      className={`object-cover ${className}`}
      onError={handleError}
    />
  )
}