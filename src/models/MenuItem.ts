import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  description?: string;
  price: number;
  category?: string;
  tags?: string[];
  active: boolean;
  image?: string;
}

const MenuItemSchema = new Schema<IMenuItem>({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String },
  tags: [{ type: String }],
  active: { type: Boolean, default: true },
  image: { type: String }
}, { timestamps: true });

const MenuItem: Model<IMenuItem> = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
export default MenuItem;
