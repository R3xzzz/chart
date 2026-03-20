import mongoose, { Schema, Document } from 'mongoose';

export interface IChart extends Document {
  icao: string;
  fileUrl: string;
  originalName?: string;
  createdAt: Date;
}

const ChartSchema: Schema = new Schema({
  icao: {
    type: String,
    required: [true, 'ICAO code is required'],
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{4}$/, 'ICAO code must be exactly 4 letters'],
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required'],
  },
  originalName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Chart || mongoose.model<IChart>('Chart', ChartSchema);
