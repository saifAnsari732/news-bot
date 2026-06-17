"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, ExternalLink } from "lucide-react";

export default function ArticleReaderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const url = searchParams.get('url');

  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) {
      setError("No article URL provided.");
      setLoading(false);
      return;
    }

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/news/extract?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || "Failed to fetch article");
        setArticle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [url]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-16 py-10 lg:py-16">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all mb-12 font-medium shadow-lg backdrop-blur-md"
        >
          <ArrowLeft className="w-5 h-5" /> Back to News Feed
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
            <p className="text-slate-400 font-medium">Extracting article content...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-12 text-center max-w-2xl mx-auto mt-20">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Extraction Failed</h2>
            <p className="text-slate-300 mb-8 text-lg">{error}</p>
            <a href={url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium text-lg">
              Read on Original Website <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        ) : article ? (
          <article className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Left Column: Title & Image (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-6 relative">
              <div className="lg:sticky lg:top-12 space-y-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white tracking-tight">
                  {article.title}
                </h1>
                
                {article.image && (
                  <div className="w-full aspect-[4/3] relative rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                )}
                
                <div className="pt-8">
                  <a href={article.originalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black border border-emerald-500/30 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] w-full justify-center lg:w-auto">
                    View Original Source <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Text Content */}
            <div className="lg:col-span-7 xl:col-span-6">
              <div className="glass-card !bg-black/40 !border-white/5 !p-8 lg:!p-12 !rounded-3xl">
                <div className="prose prose-invert prose-lg md:prose-xl max-w-none prose-p:leading-relaxed prose-p:text-slate-300 prose-a:text-emerald-400">
                  {article.content.split('\n\n').map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-8">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>

          </article>
        ) : null}
      </div>
    </div>
  );
}
