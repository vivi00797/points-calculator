import React from 'react';
import { motion } from 'framer-motion';
import { TerminologyTags } from './TerminologyTags';
import { Trash2, RefreshCw } from 'lucide-react';

interface ImageCardProps {
  id?: number | string;
  imageUrl: string;
  tags: string[];
  onDeleteTag?: (tag: string) => void;
  onDelete?: () => void;
  onRetry?: () => void;
  isLoading?: boolean;
}

export function ImageCard({ imageUrl, tags, onDeleteTag, onDelete, onRetry, isLoading }: ImageCardProps) {
  // Randomize rotation slightly for handwritten/polaroid feel
  const rotation = React.useMemo(() => (Math.random() * 4) - 2, []);
  
  // Random decoration (tape, pushpin)
  const decorators = ['tape', 'pin', 'clip'];
  const decorator = React.useMemo(() => decorators[Math.floor(Math.random() * decorators.length)], []);

  const isFailed = tags.includes("AI 解析失败");

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, rotate: rotation }}
      className="relative bg-white p-3 pb-10 shadow-md border border-orange-900/5 max-w-[200px] w-full group transition-transform hover:z-20 hover:scale-105 duration-300"
    >
      {/* Action Buttons (Top Right) */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
        {isFailed && onRetry && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRetry(); }}
            className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-orange-100 text-orange-600 transition-colors"
            title="重新解析"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
          className="p-1 bg-white/90 rounded-full shadow-sm hover:bg-red-50 text-red-600 transition-colors"
          title="删除卡片"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Decorator */}
      {decorator === 'tape' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-[rgba(245,222,179,0.7)] backdrop-blur-sm -rotate-2 opacity-90 shadow-sm pointer-events-none" />
      )}
      {decorator === 'pin' && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-sm border border-red-600 z-10 pointer-events-none">
           <div className="absolute top-[2px] left-[2px] w-[5px] h-[5px] rounded-full bg-white/60" />
        </div>
      )}
      {decorator === 'clip' && (
        <div className="absolute -top-4 left-4 w-4 h-10 border-2 border-slate-400 rounded-full bg-transparent -rotate-[15deg] opacity-80 pointer-events-none" />
      )}

      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-orange-50 border border-orange-900/10 outline outline-1 outline-orange-900/5">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="w-6 h-6 border-2 border-orange-900/30 border-t-orange-500 rounded-full animate-spin mb-2" />
            <span className="text-orange-900/40 handwritten text-xl">标签识别中...</span>
          </div>
        ) : (
          <img src={imageUrl} alt="Inspiration" className="w-full h-full object-cover" />
        )}
      </div>

      {/* Terminology Tags */}
      {!isLoading && tags.length > 0 && (
        <TerminologyTags tags={tags} onDelete={onDeleteTag} />
      )}
    </motion.div>
  );
}
