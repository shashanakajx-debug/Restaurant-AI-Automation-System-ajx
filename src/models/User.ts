import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import { UserRole } from '@/types/user'

export interface IUser extends Document {
  email: string
  name?: string
  password: string
  role: UserRole
  phone?: string
  address?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  preferences?: {
    dietaryRestrictions?: string[]
    favoriteCategories?: string[]
    notificationSettings?: {
      email: boolean
      sms: boolean
      push: boolean
    }
    language: string
    currency: string
  }
  isActive: boolean
  lastLogin?: Date
  emailVerified: boolean

  resetToken?: string
  resetTokenExpiry?: number

  /** ✅ Add these two lines */
  createdAt?: Date
  updatedAt?: Date

  comparePassword(candidate: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, trim: true, maxlength: 50 },
    password: { type: String, required: true, minlength: 8 },
    role: {
      type: String,
      enum: ['admin', 'staff', 'customer'],
      default: 'customer',
    },
    phone: { type: String, trim: true },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Number, default: null },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'US' },
    },
    preferences: {
      dietaryRestrictions: [{ type: String }],
      favoriteCategories: [{ type: String }],
      notificationSettings: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true },
      },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' },
    },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    emailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // ✅ Adds createdAt & updatedAt
    toJSON: {
      transform(doc, ret) {
        const { password, __v, ...clean } = ret as any
        return clean
      },
    },
  }
)

// Pre-save hook to hash password
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()

  try {
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (err) {
    next(err as Error)
  }
})

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return await bcrypt.compare(candidate, this.password)
}

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
