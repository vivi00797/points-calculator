import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { ImageCard } from './ImageCard';

interface Props {
  currentDate: Date;
  onPasteImage: (file: File, dayOffset: number) => void;
  onDeleteImage: (id: number) => void;
  onReanalyzeImage: (id: number) => void;
  images: any[]; 
  note: string;
  onNoteChange: (content: string) => void;
}

export default function WeeklyGrid({ currentDate, onPasteImage, onDeleteImage, onReanalyzeImage, images, note, onNoteChange }: Props) {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const getDay = (offset: number) => addDays(startDate, offset);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Row 1: Mon, Tue, Wed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[250px]">
        <DayCell title="周一" date={getDay(0)} offset={0} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
        <DayCell title="周二" date={getDay(1)} offset={1} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
        <DayCell title="周三" date={getDay(2)} offset={2} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
      </div>

      {/* Row 2: Thu, Fri, Weekend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[250px]">
        <DayCell title="周四" date={getDay(3)} offset={3} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
        <DayCell title="周五" date={getDay(4)} offset={4} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
        <WeekendCell dateSat={getDay(5)} dateSun={getDay(6)} onPasteImage={onPasteImage} onDeleteImage={onDeleteImage} onReanalyzeImage={onReanalyzeImage} images={images} />
      </div>


      {/* Row 3: Notes (Draggable height) */}
      <div className="w-full border-2 border-dashed border-orange-900/20 rounded-xl p-6 bg-orange-50/40 min-h-[160px] resize-y overflow-auto relative mt-4 shadow-inner group transition-colors hover:bg-orange-50/60 flex flex-col">
        <h3 className="handwritten text-4xl text-orange-900/30 absolute top-4 left-6 pointer-events-none z-0">
          {note ? '' : '随笔与灵感...'}
        </h3>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          className="w-full h-full flex-1 bg-transparent border-none outline-none resize-none handwritten text-2xl text-orange-950/80 relative z-10 p-0 leading-relaxed placeholder:text-transparent"
          placeholder="随笔与灵感..."
          spellCheck={false}
        />
        <div className="absolute bottom-2 right-2 text-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-xs">
          自动保存中... 拖拽调整高度 ↘
        </div>
      </div>

    </div>
  );
}

function DayCell({ title, date, offset, onPasteImage, onDeleteImage, onReanalyzeImage, images }: { 
  title: string, 
  date: Date, 
  offset: number, 
  onPasteImage: (f: File, o: number) => void,
  onDeleteImage: (id: number) => void,
  onReanalyzeImage: (id: number) => void,
  images: any[] 
}) {

  const cellImages = images.filter(img => img.dayOfWeek === offset + 1);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
       // Support image pasting directly
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          onPasteImage(file, offset);
          break;
        }
      }
    }
  };

  return (
    <div 
      className="border border-orange-900/10 rounded-xl overflow-visible flex flex-col bg-[#fefdfb] shadow-sm relative group transition-all hover:shadow-md focus-within:ring-2 focus-within:ring-orange-200 focus-within:outline-none"
      onPaste={handlePaste}
      tabIndex={0}
    >
      <div className="bg-orange-100/40 p-3 text-center border-b border-orange-900/5 rounded-t-xl z-20">
        <span className="handwritten text-2xl text-orange-950 font-bold">{title}</span>
        <span className="text-sm text-orange-900/50 ml-2 font-medium font-sans">{format(date, 'M月d日')}</span>
      </div>
      <div className="flex-1 p-4 relative min-h-[200px] flex flex-wrap gap-4 items-center justify-center content-center z-10">
        {cellImages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-orange-900/20 handwritten text-2xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity select-none pointer-events-none">
            截图并按 Cmd+V 粘贴
          </div>
        )}
        {cellImages.map((img, i) => (
          <ImageCard 
            key={img.id || i} 
            imageUrl={img.url} 
            tags={img.tags?.map((t:any) => t.text) || []} 
            isLoading={img.isLoading}
            onDelete={() => onDeleteImage(img.id)}
            onRetry={() => onReanalyzeImage(img.id)}
          />
        ))}

      </div>
    </div>
  );
}

function WeekendCell({ dateSat, dateSun, onPasteImage, onDeleteImage, onReanalyzeImage, images }: { 
  dateSat: Date, 
  dateSun: Date, 
  onPasteImage: (f: File, o: number) => void, 
  onDeleteImage: (id: number) => void,
  onReanalyzeImage: (id: number) => void,
  images: any[] 
}) {

  const satImages = images.filter(img => img.dayOfWeek === 6);
  const sunImages = images.filter(img => img.dayOfWeek === 7);

  const handlePaste = (e: React.ClipboardEvent, offset: number) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          onPasteImage(file, offset);
          break;
        }
      }
    }
  };

  return (
    <div className="border border-orange-900/10 rounded-xl overflow-hidden flex flex-col bg-[#fefdfb] shadow-sm relative group hover:shadow-md">
      <div className="bg-orange-100/40 p-3 text-center border-b border-orange-900/5">
        <span className="handwritten text-2xl text-orange-950 font-bold flex items-center justify-center gap-2">
          周末 
        </span>
      </div>
      <div className="flex-1 grid grid-cols-2 divide-x divide-orange-900/10 divide-dashed">
        <div 
          className="p-4 relative min-h-[200px] flex flex-wrap gap-2 items-center justify-center content-center focus-within:bg-orange-50/30 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-200 transition-colors"
          onPaste={(e) => handlePaste(e, 5)}
          tabIndex={0}
        >
          <span className="absolute top-2 right-2 text-xs text-orange-900/40 font-bold font-sans">周六 {format(dateSat, 'd日')}</span>
          {satImages.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-orange-900/10 handwritten text-xl opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none text-center px-4">
              粘贴此处
             </div>
          )}
          {satImages.map((img, i) => (
             <ImageCard 
              key={img.id || i} 
              imageUrl={img.url} 
              tags={img.tags?.map((t:any) => t.text) || []} 
              isLoading={img.isLoading} 
              onDelete={() => onDeleteImage(img.id)}
              onRetry={() => onReanalyzeImage(img.id)}
             />
          ))}

        </div>
        <div 
          className="p-4 relative min-h-[200px] flex flex-wrap gap-2 items-center justify-center content-center focus-within:bg-orange-50/30 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-200 transition-colors"
          onPaste={(e) => handlePaste(e, 6)}
          tabIndex={0}
        >
          <span className="absolute top-2 right-2 text-xs text-orange-900/40 font-bold font-sans">周日 {format(dateSun, 'd日')}</span>
          {sunImages.length === 0 && (
             <div className="absolute inset-0 flex items-center justify-center text-orange-900/10 handwritten text-xl opacity-0 group-hover:opacity-100 transition-opacity select-none pointer-events-none text-center px-4">
              粘贴此处
             </div>
          )}
          {sunImages.map((img, i) => (
             <ImageCard 
              key={img.id || i} 
              imageUrl={img.url} 
              tags={img.tags?.map((t:any) => t.text) || []} 
              isLoading={img.isLoading} 
              onDelete={() => onDeleteImage(img.id)}
              onRetry={() => onReanalyzeImage(img.id)}
             />
          ))}

        </div>
      </div>
    </div>
  );
}
