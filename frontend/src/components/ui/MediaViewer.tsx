import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';

export interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  title?: string;
  caption?: string;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  isOpen,
  onClose,
  mediaUrl,
  mediaType = 'image',
  title,
  caption
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn text-white"
    >
      {/* Top Bar Controls */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="flex items-center justify-between gap-4 py-2 border-b border-white/10"
      >
        <div className="truncate">
          {title && <h3 className="text-sm font-bold truncate">{title}</h3>}
          {caption && <p className="text-xs text-zinc-400 truncate">{caption}</p>}
        </div>

        <div className="flex items-center gap-2">
          {mediaType === 'image' && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
          )}

          <a
            href={mediaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Open original media"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            title="Close Lightbox (Escape)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Media Center */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto"
      >
        {mediaType === 'image' ? (
          <img
            src={mediaUrl}
            alt={title || 'Media preview'}
            className={`max-h-[80vh] object-contain rounded-2xl transition-transform duration-300 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
          />
        ) : (
          <video
            src={mediaUrl}
            controls
            autoPlay
            className="max-h-[80vh] max-w-full rounded-2xl shadow-2xl"
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center py-2 text-xs text-zinc-500 font-mono">
        Press Escape to close • Pinch or click to zoom
      </div>
    </div>
  );
};
