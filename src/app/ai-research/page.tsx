"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2, Clock, Bookmark, ArrowLeft } from "lucide-react";
// import { useSession } from "next-auth/react";

export default function Dashboard() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  // const { data: session } = useSession();
  
  // For the sake of demo without complex next-auth setup issues:
  const mockUserId = "60d0fe4f5311236168a109ca";

  useEffect(() => {
    // Fetch history
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/news/history?userId=${mockUserId}`);
        const data = await res.json();
        if (data.history) setHistory(data.history);
      } catch (e) {
        console.error(e);
      }
    };
    fetchHistory();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);

    try {
      const res = await fetch("/api/news/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, userId: mockUserId }), // Using mock for now
      });
      const data = await res.json();
      
      if (data.reportId) {
        router.push(`/report/${data.reportId}`);
      }
    } catch (err) {
      console.error(err);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 lg:p-20 max-w-screen-xl mx-auto flex flex-col items-center">
      
      {/* Home Button */}
      <div className="w-full flex justify-start mb-16">
        <button 
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Live News
        </button>
      </div>

      {/* Hero Section */}
      <header className="text-center mb-16 space-y-6 max-w-3xl">
        <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl mb-4 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
          <SearchIcon className="w-8 h-8 text-purple-400" />
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 tracking-tight">
          AI Research Agent
        </h1>
        <p className="text-xl text-slate-400 font-light">
          Enter any topic. The AI will instantly scrape multiple trusted sources, cross-verify facts, and build a comprehensive SEO-friendly report.
        </p>
      </header>

      {/* Massive Search Bar */}
      <div className="w-full max-w-4xl relative z-10 mb-24">
        <form onSubmit={handleSearch} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative flex items-center bg-black/80 border border-white/10 rounded-3xl p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:border-purple-500/50">
            <SearchIcon className="absolute left-8 text-purple-500/50 w-8 h-8" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to research today?"
              className="w-full bg-transparent border-none py-6 pl-24 pr-6 text-white text-2xl font-medium focus:outline-none focus:ring-0 placeholder-slate-600"
              disabled={loading}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query}
              className="hidden sm:flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg rounded-2xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed m-1"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Generate Report"}
            </button>
          </div>
        </form>
        {loading && (
          <div className="absolute -bottom-16 left-0 right-0 text-center animate-pulse text-purple-400 font-medium tracking-wide flex items-center justify-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> Extracting and analyzing data...
          </div>
        )}
      </div>

      {/* History Grid */}
      <div className="w-full max-w-5xl mt-8">
        <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
          <Clock className="w-6 h-6 text-indigo-400" /> 
          <h2 className="text-2xl font-bold text-white tracking-wide">Recent Researches</h2>
        </div>
        
        {history.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-3xl border border-white/5 border-dashed">
            <p className="text-slate-500 text-lg">No recent history found. Run your first search above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {history.map((item) => (
              <div 
                key={item._id} 
                onClick={() => router.push(`/report/${item._id}`)}
                className="group p-6 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-purple-500/30 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <h3 className="font-bold text-xl text-white mb-3 line-clamp-1 group-hover:text-purple-300 transition-colors">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed line-clamp-2">{item.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
