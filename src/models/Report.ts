import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  summary: string;
  report: {
    headline: string;
    breakingSummary: string;
    newsItems: { headline: string; summary: string; sourceLink: string }[];
    background: string;
    timeline: string;
    keyHighlights: string[];
    category: string;
    region: string;
    importantPeople: string[];
    organizations: string[];
    impactAnalysis: any;
    whyItMatters: string;
    trendScore: number;
    trendExplanation: string;
    sentiment: string;
    importanceScore: number;
    importanceExplanation: string;
    misinformationCheck: string;
    expertInsight: string;
    faqs: { question: string; answer: string }[];
    socialMediaPosts: any;
    youtubeContent: any;
    newsletterSummary: string;
    relatedNews: string[];
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    slug: string;
    keywords: string[];
    tags: string[];
  };
  sources: { name: string; url: string; type: string }[];
  reliability: { score: number; status: string };
  createdAt: Date;
}

const ReportSchema: Schema<IReport> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    summary: { type: String, required: true },
    report: { type: Schema.Types.Mixed, required: true },
    seo: { type: Schema.Types.Mixed, required: true },
    sources: { type: Schema.Types.Mixed, required: true },
    reliability: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
