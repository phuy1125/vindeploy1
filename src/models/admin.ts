import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  email: string;
  password: string;
  role: string;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'admin' },
});

const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
