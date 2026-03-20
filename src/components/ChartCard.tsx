import { FileImage, FileText } from 'lucide-react';
import { isIframeUrl } from '@/lib/fileUtils';

interface ChartCardProps {
  icao: string;
  fileUrl: string;
  originalName?: string;
  onClick: () => void;
}

export default function ChartCard({ icao, fileUrl, originalName, onClick }: ChartCardProps) {
  const isIframe = isIframeUrl(fileUrl);
  const displayName = originalName || `Chart for ${icao}`;

  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col items-center justify-center p-4 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-blue-500 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="p-4 bg-slate-950 rounded-full mb-3 group-hover:scale-110 transition-transform">
        {isIframe ? (
          <FileText className="w-8 h-8 text-red-400" />
        ) : (
          <FileImage className="w-8 h-8 text-blue-400" />
        )}
      </div>
      
      <h3 className="text-sm font-medium text-slate-300 text-center truncate w-full" title={displayName}>
        {displayName}
      </h3>
      
      <div className="mt-2 text-xs text-slate-500 font-mono">
        {icao}
      </div>
    </div>
  );
}
