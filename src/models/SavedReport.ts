import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedReport extends Document {
  userId: mongoose.Types.ObjectId;
  reportId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SavedReportSchema: Schema<ISavedReport> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SavedReport: Model<ISavedReport> = mongoose.models.SavedReport || mongoose.model<ISavedReport>('SavedReport', SavedReportSchema);
