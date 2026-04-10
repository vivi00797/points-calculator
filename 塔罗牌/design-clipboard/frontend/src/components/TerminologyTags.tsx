import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';

interface TerminologyTagsProps {
  tags: string[];
  onDelete?: (tag: string) => void;
}

export function TerminologyTags({ tags, onDelete }: TerminologyTagsProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  if (!tags || tags.length === 0) return null;

  const firstTag = tags[0];
  const remainingCount = tags.length - 1;

  const handleCopy = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tag);
    setCopied(tag);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div 
      className="absolute -right-6 top-4 z-20 flex flex-col items-end"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-[#fff9f0]/95 backdrop-blur border border-orange-900/20 shadow-md rounded-l-xl p-2 min-w-[80px] transition-all duration-300 relative group-hover:z-50">
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs font-semibold text-orange-900">{firstTag}</span>
              {remainingCount > 0 && (
                <span className="text-[10px] bg-orange-900/10 text-orange-950 px-1.5 py-0.5 rounded-full">
                  +{remainingCount}
                </span>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-2"
            >
              {tags.map((tag) => (
                <div key={tag} className="group/tag flex items-center justify-between gap-4 text-xs bg-white/60 px-2 py-1 rounded border border-transparent hover:border-orange-900/10 transition-colors">
                  <span className="font-medium text-orange-900 whitespace-nowrap">{tag}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover/tag:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleCopy(e, tag)}
                      className="p-1 hover:bg-orange-100 rounded text-orange-700"
                    >
                      {copied === tag ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                    {onDelete && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(tag);
                        }}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
