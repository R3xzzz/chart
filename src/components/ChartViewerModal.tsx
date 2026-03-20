'use client';

import { X, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';
import { isIframeUrl } from '@/lib/fileUtils';

interface ChartViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
  title: string;
}

export default function ChartViewerModal({ isOpen, onClose, fileUrl, title }: ChartViewerModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fileUrl) return null;

  const isIframe = isIframeUrl(fileUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="relative w-full max-w-6xl h-[90vh] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-lg font-semibold text-slate-100 truncate pr-4">{title}</h2>
          <div className="flex items-center gap-2">
            <a 
              href={fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-slate-900/20 relative overflow-auto flex items-center justify-center">
          {isIframe ? (
            <iframe 
              src={`${fileUrl}#view=FitH`} 
              className="w-full h-full border-0 bg-white"
              title={title}
            />
          ) : (
            <div className="w-full h-full min-h-[500px] relative flex items-center justify-center p-4">
              <img 
                src={fileUrl} 
                alt={title}
                className="max-w-full max-h-full object-contain rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
