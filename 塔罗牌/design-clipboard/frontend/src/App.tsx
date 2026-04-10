import { useState, useEffect } from 'react';
import { format, addWeeks, subWeeks, startOfWeek, endOfWeek, getISOWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import WeeklyGrid from './components/WeeklyGrid';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');


  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekNumber = getISOWeek(currentDate);

  // Fetch from backend
  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3000/api/images`);
      const data = await res.json();
      setImages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch(`http://localhost:3000/api/notes/${weekNumber}`);
      const data = await res.json();
      setNote(data.content || '');
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  useEffect(() => {
    fetchImages();
    fetchNotes();
  }, [currentDate]);


  const handlePasteImage = async (file: File, dayOffset: number) => {
    const dayOfWeek = dayOffset + 1; // 1: Mon, ..., 7: Sun
    const tempId = `temp-${Date.now()}`;
    const objectUrl = URL.createObjectURL(file);

    // Optimistically add to UI
    const tempImage = {
      id: tempId,
      url: objectUrl,
      weekNumber,
      dayOfWeek,
      isLoading: true,
      tags: []
    };
    
    setImages(prev => [...prev, tempImage]);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('weekNumber', String(weekNumber));
      formData.append('dayOfWeek', String(dayOfWeek));

      const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const newImage = await res.json();
      
      setImages(prev => prev.map(img => img.id === tempId ? newImage : img));
    } catch (err) {
      console.error("Upload failed", err);
      // Remove temp image on failure
      setImages(prev => prev.filter(img => img.id !== tempId));
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!window.confirm('确定要删除这张灵感图片吗？')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/images/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Delete failed");
      
      setImages(prev => prev.filter(img => img.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("删除失败，请重试");
    }
  };

  const handleReanalyzeImage = async (id: number) => {
    // 1. Set loading state locally
    setImages(prev => prev.map(img => img.id === id ? { ...img, isLoading: true, tags: [] } : img));

    try {
      const res = await fetch(`http://localhost:3000/api/images/${id}/reanalyze`, {
        method: 'POST'
      });
      
      if (!res.ok) throw new Error("Re-analysis failed");
      const updatedImage = await res.json();
      
      setImages(prev => prev.map(img => img.id === id ? updatedImage : img));
    } catch (err) {
      console.error("Re-analysis failed", err);
      // If failed, restore old state but with failure tag to allow retry
      setImages(prev => prev.map(img => img.id === id ? { ...img, isLoading: false, tags: [{ text: "AI 解析失败" }] } : img));
    }
  };

  // Debounced save for notes
  useEffect(() => {
    if (loading) return; // Don't save while initial data is loading

    const timer = setTimeout(async () => {
      // We only save if there's actually something to save 
      // or if we want to support clearing the note.
      try {
        await fetch('http://localhost:3000/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            weekNumber,
            content: note
          })
        });
      } catch (err) {
        console.error("Failed to auto-save note", err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [note, weekNumber, loading]);

  // Filter current week's images and prepend local url mapping safely


  const currentWeekImages = images.filter(img => img.weekNumber === weekNumber).map(img => ({
    ...img,
    url: img.url.startsWith('blob:') || img.url.startsWith('http') ? img.url : `http://localhost:3000${img.url}` 
  }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 notebook-lines relative overflow-y-auto w-full">
      {/* Top Nav */}
      <header className="max-w-6xl mx-auto mb-10 flex items-center justify-between px-4 mt-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={prevWeek} 
            className="p-3 bg-white/70 backdrop-blur rounded-full hover:bg-white shadow-sm border border-orange-900/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-300 group"
          >
            <ChevronLeft className="w-6 h-6 text-orange-900 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <div className="text-center relative">
            <h1 className="text-6xl handwritten font-bold text-orange-950 tracking-tight mb-2 opacity-90 drop-shadow-sm">
              设计灵感手账
            </h1>
            <p className="text-orange-900/60 font-sans font-medium">
              第 {weekNumber} 周 • {format(startDate, 'M月d日')} - {format(endDate, 'yyyy年M月d日')}
            </p>
          </div>
          
          <button 
            onClick={nextWeek} 
            className="p-3 bg-white/70 backdrop-blur rounded-full hover:bg-white shadow-sm border border-orange-900/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-300 group"
          >
            <ChevronRight className="w-6 h-6 text-orange-900 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto border-[3px] border-orange-900/10 bg-[#fdfaf6] shadow-2xl rounded-2xl p-6 md:p-8 min-h-[75vh] relative isolate pb-20">
        {loading && (
          <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
          </div>
        )}
        <WeeklyGrid 
          currentDate={currentDate} 
          onPasteImage={handlePasteImage}
          onDeleteImage={handleDeleteImage}
          onReanalyzeImage={handleReanalyzeImage}
          images={currentWeekImages}
          note={note}
          onNoteChange={setNote}
        />


      </main>
    </div>
  );
}

export default App;
