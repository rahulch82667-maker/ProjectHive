'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectGalleryProps {
  thumbnail: string;
  images: string[];
  demoVideo?: string;
  title: string;
}

export default function ProjectGallery({ thumbnail, images, demoVideo, title }: ProjectGalleryProps) {
  // Combine thumbnail and other images into a single list of media
  const allImages = [thumbnail, ...images].filter(Boolean);
  
  // We determine what is currently selected. 
  // 'video' or an index of allImages
  const [selectedIndex, setSelectedIndex] = useState<number | 'video'>(0);

  // Helper to detect if a URL is a video (optional but good to have)
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return '';
  };

  const videoEmbedUrl = demoVideo ? getEmbedUrl(demoVideo) : '';
  const isDirectVideo = demoVideo && !videoEmbedUrl;

  const handlePrev = () => {
    if (selectedIndex === 'video') {
      setSelectedIndex(allImages.length - 1);
    } else if (selectedIndex === 0) {
      if (demoVideo) {
        setSelectedIndex('video');
      } else {
        setSelectedIndex(allImages.length - 1);
      }
    } else {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex === 'video') {
      setSelectedIndex(0);
    } else if (selectedIndex === allImages.length - 1) {
      if (demoVideo) {
        setSelectedIndex('video');
      } else {
        setSelectedIndex(0);
      }
    } else {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-4">
      {/* Main Display Area */}
      <div className="relative aspect-video w-full bg-gray-900 rounded-xl overflow-hidden group shadow-inner">
        {selectedIndex === 'video' && demoVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-black">
            {videoEmbedUrl ? (
              <iframe
                src={videoEmbedUrl}
                title={`${title} Demo Video`}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={demoVideo}
                controls
                className="w-full h-full max-h-full"
                poster={thumbnail}
                preload="metadata"
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={allImages[typeof selectedIndex === 'number' ? selectedIndex : 0]}
              alt={`${title} Preview`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
              className="object-contain transition-transform duration-500 ease-out hover:scale-105"
            />
          </div>
        )}

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-brown-700 hover:text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-brown-700 hover:text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Floating Indicator */}
        <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm text-white px-3 py-1 text-xs font-semibold rounded-full shadow-md select-none tracking-wider">
          {selectedIndex === 'video'
            ? 'VIDEO'
            : `${(selectedIndex as number) + 1} / ${allImages.length}`}
        </div>
      </div>

      {/* Thumbnails strip */}
      <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-brown-200 scrollbar-track-transparent">
        {/* Video Thumbnail (placed first if exists) */}
        {demoVideo && (
          <button
            onClick={() => setSelectedIndex('video')}
            className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
              selectedIndex === 'video'
                ? 'border-brown-700 ring-2 ring-brown-100 shadow-md'
                : 'border-transparent opacity-70 hover:opacity-100 shadow-sm'
            }`}
          >
            {/* Display thumbnail with a play overlay */}
            <div className="absolute inset-0 bg-black/45 flex items-center justify-center z-10">
              <Play size={20} className="text-white fill-white drop-shadow" />
            </div>
            <Image
              src={thumbnail}
              alt="Video Demo Thumbnail"
              fill
              sizes="96px"
              className="object-cover filter brightness-75"
            />
          </button>
        )}

        {/* Image Thumbnails */}
        {allImages.map((img, idx) => (
          <button
            key={img}
            onClick={() => setSelectedIndex(idx)}
            className={`relative flex-shrink-0 w-24 aspect-video rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer ${
              selectedIndex === idx
                ? 'border-brown-700 ring-2 ring-brown-100 shadow-md'
                : 'border-transparent opacity-75 hover:opacity-100 shadow-sm'
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              sizes="96px"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
