'use client';

import { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface IframePreviewModalProps {
  isOpen: boolean;
  title: string;
  url: string | null | undefined;
  onClose: () => void;
}

export default function IframePreviewModal({ isOpen, title, url, onClose }: IframePreviewModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset fullscreen when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleClose = () => {
    setIsFullscreen(false);
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ${
        isFullscreen ? 'p-0' : 'p-4 sm:p-6 md:p-8'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen 
            ? 'w-full h-full rounded-none' 
            : 'w-full max-w-5xl h-[80vh] sm:h-[85vh] md:h-[90vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-4 p-4 border-b border-brown-200 bg-gradient-to-r from-brown-50 to-white">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brown-900 truncate">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-brown-600 truncate">
              Live Preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFullscreen}
              className="p-2 rounded-lg text-brown-600 hover:text-brown-800 hover:bg-brown-100 transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-brown-600 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Close"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Iframe Content */}
        <div className="flex-1 bg-gray-100">
          {url ? (
            <iframe
              src={url}
              title={`${title} - Live Preview`}
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads allow-modals"
              loading="lazy"
              allow="fullscreen; autoplay; encrypted-media"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <ExternalLink className="h-12 w-12 sm:h-16 sm:w-16 text-brown-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-brown-800 mb-2">
                No Preview Available
              </h3>
              <p className="text-sm sm:text-base text-brown-600">
                Live demo link is not available for this project.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-brown-200 bg-brown-50">
          <p className="text-xs text-brown-600 text-center">
            This is a live preview of the project. The actual project may vary.
          </p>
        </div>
      </div>
    </div>
  );
}