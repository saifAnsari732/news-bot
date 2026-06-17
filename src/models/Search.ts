import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearch extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  createdAt: Date;
}

const SearchSchema: Schema<ISearch> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    query: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Search: Model<ISearch> = mongoose.models.Search || mongoose.model<ISearch>('Search', SearchSchema);
