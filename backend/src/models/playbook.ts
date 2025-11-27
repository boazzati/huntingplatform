import mongoose, { Document, Schema } from 'mongoose';

export interface IPlaybook extends Document {
  subChannel: string;
  version: number;
  contentMd: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookSchema = new Schema<IPlaybook>({
  subChannel: { type: String, required: true, unique: true },
  version: { type: Number, required: true, default: 1 },
  contentMd: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const Playbook = mongoose.model<IPlaybook>('Playbook', PlaybookSchema);
