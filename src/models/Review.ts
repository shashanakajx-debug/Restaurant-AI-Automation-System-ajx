import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  userId?: string;
  customerName: string;
  customerEmail: string;
  orderId?: string;
  rating: number; // 1-5 stars
  title?: string;
  comment: string;
  foodRating?: number;
  serviceRating?: number;
  ambianceRating?: number;
  images?: string[];
  helpful: number;
  verified: boolean;
  restaurantId: string;
  response?: {
    text: string;
    author: string;
    createdAt: Date;
  };
  toJSON(): any;
}

const ReviewSchema = new Schema<IReview>({
  userId: {
    type: String,
    index: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Customer name cannot be more than 100 characters']
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  orderId: {
    type: String,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    index: true
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Comment cannot be more than 2000 characters']
  },
  foodRating: {
    type: Number,
    min: [1, 'Food rating must be at least 1'],
    max: [5, 'Food rating cannot exceed 5']
  },
  serviceRating: {
    type: Number,
    min: [1, 'Service rating must be at least 1'],
    max: [5, 'Service rating cannot exceed 5']
  },
  ambianceRating: {
    type: Number,
    min: [1, 'Ambiance rating must be at least 1'],
    max: [5, 'Ambiance rating cannot exceed 5']
  },
  images: [{
    type: String,
    match: [/^https?:\/\/.+/, 'Please provide valid image URLs']
  }],
  helpful: {
    type: Number,
    default: 0,
    min: [0, 'Helpful count cannot be negative']
  },
  verified: {
    type: Boolean,
    default: false,
    index: true
  },
  restaurantId: {
    type: String,
    required: true,
    index: true
  },
  response: {
    text: {
      type: String,
      trim: true,
      maxlength: [1000, 'Response cannot be more than 1000 characters']
    },
    author: {
      type: String,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      if ('__v' in ret) delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better performance
ReviewSchema.index({ restaurantId: 1, rating: -1 });
ReviewSchema.index({ restaurantId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ orderId: 1 });
ReviewSchema.index({ verified: 1, rating: -1 });
ReviewSchema.index({ helpful: -1, createdAt: -1 });

// Compound index for restaurant reviews with rating
ReviewSchema.index({ restaurantId: 1, rating: 1, createdAt: -1 });

// Text index for search functionality
ReviewSchema.index({
  title: 'text',
  comment: 'text'
});

// Static method to find reviews by restaurant
ReviewSchema.statics.findByRestaurant = function(restaurantId: string, options?: {
  rating?: number;
  verified?: boolean;
  limit?: number;
  skip?: number;
}) {
  const query: any = { restaurantId };
  
  if (options?.rating) query.rating = options.rating;
  if (options?.verified !== undefined) query.verified = options.verified;
  
  let queryBuilder = this.find(query).sort({ createdAt: -1 });
  
  if (options?.skip) queryBuilder = queryBuilder.skip(options.skip);
  if (options?.limit) queryBuilder = queryBuilder.limit(options.limit);
  
  return queryBuilder;
};

// Static method to find reviews by user
ReviewSchema.statics.findByUser = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to get average rating for restaurant
ReviewSchema.statics.getAverageRating = function(restaurantId: string) {
  return this.aggregate([
    { $match: { restaurantId, verified: true } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
};

// Static method to find recent reviews
ReviewSchema.statics.findRecentReviews = function(days: number = 30) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return this.find({ createdAt: { $gte: date } }).sort({ createdAt: -1 });
};

// Instance method to mark as helpful
ReviewSchema.methods.markHelpful = function() {
  this.helpful += 1;
  return this.save();
};

// Instance method to add response
ReviewSchema.methods.addResponse = function(text: string, author: string) {
  this.response = {
    text,
    author,
    createdAt: new Date()
  };
  return this.save();
};

// Instance method to verify review
ReviewSchema.methods.verify = function() {
  this.verified = true;
  return this.save();
};

const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
