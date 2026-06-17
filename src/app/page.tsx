"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, RefreshCw, ArrowLeft, Play, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function LiveNewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news/live");
      const data = await res.json();
      if (data.news) {
        setNews(data.news);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const filteredNews = filter === "all" ? news : news.filter(n => n.channelId === filter);

  // Derive unique channels for the filter
  const channels = [{ id: "all", name: "All Channels" }];
  news.forEach(n => {
    if (!channels.find(c => c.id === n.channelId)) {
      channels.push({ id: n.channelId, name: n.channelName });
    }
  });

  return (
    <div className="min-h-screen p-4 md:p-8 lg:p-12 max-w-[100vw] space-y-10">
      
      {/* Massive Premium Hero Section */}
      <section className="relative w-full rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)] border border-white/10 mb-20 bg-black">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0a0a0a] to-[#0f172a] z-0"></div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[150px] mix-blend-screen z-0"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[150px] mix-blend-screen z-0"
        ></motion.div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] z-0 mix-blend-overlay"></div>
        
        <div className="relative z-10 py-32 md:py-40 px-6 flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-emerald-400 text-sm font-bold tracking-widest mb-10 uppercase shadow-[0_0_30px_rgba(16,185,129,0.2)] backdrop-blur-xl"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Live 24/7 National Updates
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: "spring" }}
            className="text-6xl md:text-8xl lg:text-[8rem] font-black tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-cyan-300 to-indigo-400 drop-shadow-2xl leading-none"
          >
            Bharat Live.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-2xl lg:text-3xl text-slate-300 max-w-4xl leading-relaxed font-light mb-16 drop-shadow-lg"
          >
            The heartbeat of the nation, delivered in real-time. Unfiltered, verified breaking news from India's most trusted networks instantly curated for you.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto"
          >
            <button 
              onClick={() => {
                document.getElementById('news-feed')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-bold text-xl rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] transition-all hover:-translate-y-1 w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <TrendingUp className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Read Headlines</span>
            </button>
            <Link href="/ai-research" className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xl rounded-2xl transition-all backdrop-blur-md flex items-center justify-center gap-3 hover:-translate-y-1 w-full sm:w-auto shadow-xl">
              Launch AI Agent <ExternalLink className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* News Feed Section */}
      <div id="news-feed" className="max-w-screen-2xl mx-auto space-y-10 px-4 pb-20">
        
        {/* Sticky Filter & Refresh Bar */}
        <div className="sticky top-0 z-50 flex flex-col md:flex-row md:items-center justify-between gap-6 p-4 md:px-8 bg-black/80 backdrop-blur-3xl border border-white/10 border-t-0 rounded-b-3xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] mb-10 transition-all">
          <div className="flex flex-wrap gap-3">
            {channels.map(channel => (
              <button
                key={channel.id}
                onClick={() => setFilter(channel.id)}
                className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                  filter === channel.id 
                    ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:scale-105'
                }`}
              >
                {channel.name}
              </button>
            ))}
          </div>
          <button 
            onClick={fetchNews}
            disabled={loading}
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black rounded-xl transition-all font-bold text-lg whitespace-nowrap shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] transform hover:-translate-y-1 overflow-hidden disabled:opacity-70 disabled:hover:translate-y-0"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <RefreshCw className={`w-5 h-5 relative z-10 ${loading ? 'animate-spin' : ''}`} /> 
            <span className="relative z-10">{loading ? 'Updating Feed...' : 'Refresh News'}</span>
          </button>
        </div>

      {loading && news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-slate-400 animate-pulse">Connecting to news portals...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNews.map((item, i) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:bg-black/60 transition-all flex flex-col group hover:border-white/20 hover:-translate-y-1">
              <div className="w-full h-48 relative bg-gray-900 border-b border-white/5 flex items-center justify-center">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                ) : (
                  <span className="text-slate-600 font-medium">No Image Available</span>
                )}
                <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/10">
                  {item.channelName}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="text-xs text-emerald-400 font-medium mb-3 flex justify-between items-center">
                  <span>{new Date(item.pubDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <h3 className="text-lg font-bold mb-3 line-clamp-3 leading-snug group-hover:text-emerald-400 transition-colors">{item.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 line-clamp-3 flex-grow">{item.summary}</p>
                <Link href={`/read?url=${encodeURIComponent(item.link)}&title=${encodeURIComponent(item.title || '')}&summary=${encodeURIComponent(item.summary || '')}&image=${encodeURIComponent(item.image || '')}`} className="inline-flex items-center justify-center gap-2 text-sm font-medium text-black bg-white hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors mt-auto">
                  Read Full Story <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
