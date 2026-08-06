import mongoose, { Schema, Document } from 'mongoose';

export interface IDocument {
  title: string;
  url: string;
  uploadedAt: Date;
}

export interface INominee {
  name: string;
  relation: string;
  phone: string;
}

export interface ICustomer extends Document {
  customerId: string;
  fullName: string;
  fatherName?: string;
  mobile: string;
  alternateMobile?: string;
  email?: string;
  aadhaar?: string;
  pan?: string;
  occupation?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  nominee?: INominee;
  documents: IDocument[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true,
      index: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      index: true,
    },
    alternateMobile: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    aadhaar: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
    },
    occupation: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'Indore',
    },
    state: {
      type: String,
      trim: true,
      default: 'Madhya Pradesh',
    },
    pincode: {
      type: String,
      trim: true,
    },
    nominee: {
      name: { type: String, trim: true },
      relation: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    documents: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CustomerSchema.index({ fullName: 'text', mobile: 'text', email: 'text', customerId: 'text' });

export const Customer = mongoose.models.Customer || mongoose.model<ICustomer>('Customer', CustomerSchema);
export default Customer;
