"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, ExternalLink, Share2, Download, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function ReportViewer({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/news/${unwrappedParams.id}`);
        const data = await res.json();
        if (data.report) {
          setReportData(data.report);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [unwrappedParams.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!reportData) return <div className="min-h-screen flex items-center justify-center">Report not found.</div>;

  const { report, seo, sources, reliability } = reportData;

  return (
    <div className="min-h-screen p-6 md:p-10 lg:p-14 max-w-screen-2xl mx-auto space-y-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <header className="glass-card border-l-4 border-l-purple-500">
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider">{report.category}</span>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-400" /> {reliability?.score}% Verified</span>
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">{report.headline}</h1>
        <p className="text-xl text-slate-300 border-l-2 border-white/20 pl-4">{report.breakingSummary}</p>
      </header>

      <section className="glass-card space-y-6 mb-8 border-t-4 border-t-purple-500">
        <h2 className="text-3xl font-bold mb-6 text-gradient">Top News Articles</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {report.newsItems?.map((item: any, i: number) => (
            <div key={i} className="bg-black/40 border border-white/10 rounded-xl overflow-hidden hover:bg-black/60 transition-colors flex flex-col">
              {item.imageUrl && (
                <div className="w-full h-48 sm:h-56 relative bg-gray-900 border-b border-white/5">
                  <img src={item.imageUrl} alt={item.headline} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3">{item.headline}</h3>
                <p className="text-slate-300 leading-relaxed mb-6 flex-grow">{item.summary}</p>
                <a href={item.sourceLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/30 px-5 py-2.5 rounded-full transition-colors hover:border-purple-400 bg-purple-500/5 hover:bg-purple-500/10 w-fit">
                  Read Original Article <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {(report.background || report.timeline) && (
            <section className="glass-card">
              <h2 className="text-xl font-semibold mb-4">Background & Timeline</h2>
              {report.background && <p className="text-slate-300 mb-4">{report.background}</p>}
              {report.timeline && (
                <div className="bg-black/30 p-4 rounded-lg border border-white/5">
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{report.timeline}</p>
                </div>
              )}
            </section>
          )}

          {report.keyHighlights && report.keyHighlights.length > 0 && (
            <section className="glass-card">
              <h2 className="text-xl font-semibold mb-4">Key Highlights</h2>
              <ul className="space-y-2">
                {report.keyHighlights.map((point: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span className="text-slate-300">{point}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {report.impactAnalysis && Object.keys(report.impactAnalysis).length > 0 && (
            <section className="glass-card border border-emerald-500/30">
              <h2 className="text-xl font-semibold mb-4">Impact Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(report.impactAnalysis).map(([key, value]) => (
                  <div key={key} className="bg-white/5 p-4 rounded-lg">
                    <h3 className="capitalize text-emerald-400 font-medium mb-1">{key}</h3>
                    <p className="text-sm text-slate-300">{String(value)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
          
          {report.faqs && report.faqs.length > 0 && (
            <section className="glass-card">
              <h2 className="text-xl font-semibold mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {report.faqs.map((faq: any, i: number) => (
                  <div key={i} className="border border-white/10 rounded-lg p-4">
                    <h3 className="font-medium text-white mb-2">Q: {faq.question}</h3>
                    <p className="text-sm text-slate-400">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section className="glass-card bg-orange-500/10 border-orange-500/20">
            <h2 className="text-lg font-semibold text-orange-400 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" /> Misinformation Check
            </h2>
            <p className="text-sm text-slate-300">{report.misinformationCheck}</p>
          </section>

          <section className="glass-card">
            <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">SEO Assets</h2>
            <div className="space-y-3 text-sm">
              <div><strong className="text-slate-400">Slug:</strong> <span className="text-blue-300">{seo?.slug}</span></div>
              <div><strong className="text-slate-400">Meta Title:</strong> <span className="text-slate-300">{seo?.metaTitle}</span></div>
              <div><strong className="text-slate-400">Keywords:</strong> <div className="flex flex-wrap gap-1 mt-1">{seo?.keywords?.map((k:string, i:number) => <span key={i} className="bg-white/10 px-2 py-1 rounded text-xs">{k}</span>)}</div></div>
            </div>
          </section>

          {report.socialMediaPosts && Object.keys(report.socialMediaPosts).length > 0 && (
            <section className="glass-card">
              <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Social Media Templates</h2>
              <div className="space-y-4">
                {Object.entries(report.socialMediaPosts).map(([platform, text]) => (
                  <div key={platform}>
                    <h3 className="text-xs text-slate-400 uppercase font-bold mb-1">{platform}</h3>
                    <div className="bg-black/30 p-3 rounded text-sm text-slate-300 border border-white/5 relative group">
                      <p className="whitespace-pre-wrap">{String(text)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="glass-card">
            <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Sources</h2>
            <ul className="space-y-3">
              {sources?.map((src: any, i: number) => (
                <li key={i} className="flex flex-col">
                  <a href={src.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-400 hover:underline flex items-center gap-1">
                    {src.name} <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-xs text-slate-500">{src.type}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
