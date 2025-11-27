import mongoose, { Document, Schema } from 'mongoose';

export interface IStep {
  step: number;
  name: string;
  note: string;
}

export interface IIdea {
  title: string;
  description: string;
}

export interface IAccount extends Document {
  name: string;
  markets: string[];
  segment: string;
  score: number;
  currentStep: number;
  rationale: string;
  ideas: IIdea[];
  stage: string;
  steps: IStep[];
}

export interface IHunt extends Document {
  subChannel: string;
  markets: string[];
  focusBrands: string[];
  createdAt: Date;
  accounts: IAccount[];
  huntResult: {
    summary: string;
    totalAccounts: number;
  };
}

const StepSchema = new Schema<IStep>({
  step: { type: Number, required: true },
  name: { type: String, required: true },
  note: { type: String, required: true },
});

const IdeaSchema = new Schema<IIdea>({
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const AccountSchema = new Schema<IAccount>({
  name: { type: String, required: true },
  markets: { type: [String], required: true },
  segment: { type: String, required: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  currentStep: { type: Number, required: true, min: 1, max: 10 },
  rationale: { type: String, required: true },
  ideas: { type: [IdeaSchema], required: true, default: [] },
  stage: { type: String, required: true },
  steps: { type: [StepSchema], required: true, default: [] },
});

const HuntSchema = new Schema<IHunt>({
  subChannel: { type: String, required: true },
  markets: { type: [String], required: true },
  focusBrands: { type: [String], required: true },
  accounts: { type: [AccountSchema], required: true, default: [] },
  huntResult: {
    summary: { type: String, required: true },
    totalAccounts: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
});

export const Hunt = mongoose.model<IHunt>('Hunt', HuntSchema);
export const Account = mongoose.model<IAccount>('Account', AccountSchema);
