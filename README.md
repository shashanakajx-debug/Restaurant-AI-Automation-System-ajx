# Restaurant AI Automation System

A comprehensive AI-powered restaurant management and customer experience platform built with Next.js, TypeScript, and modern web technologies.

## 🚀 Features

### Phase 1 (MVP) - Current
- **Customer-Facing Features**
  - Modern, responsive menu display with categories and search
  - Interactive shopping cart with real-time updates
  - Secure checkout with Stripe integration
  - Simple reservation system
  - AI-powered chat assistant for menu recommendations

- **Admin Dashboard**
  - User authentication and role-based access control
  - Menu management (CRUD operations)
  - Order management and status tracking
  - Basic analytics and reporting
  - Real-time order notifications

- **AI Integration**
  - OpenAI-powered chat assistant
  - Intelligent menu recommendations
  - Natural language order processing
  - Context-aware customer interactions

### Phase 2 (Planned)
- Advanced AI capabilities (review analysis, menu optimization)
- WhatsApp integration for order notifications
- Email marketing automation
- Advanced analytics and reporting
- Multi-restaurant support

### Phase 3 (Future)
- Full POS integration
- Hardware integration (kitchen displays, printers)
- Advanced AI features (demand forecasting, pricing optimization)
- Mobile app development
- Enterprise features

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Zustand** - State management
- **TanStack Query** - Server state management

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **NextAuth.js** - Authentication
- **Stripe** - Payment processing
- **OpenAI API** - AI capabilities

### Development & Testing
- **Jest** - Unit testing
- **Cypress** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **TypeScript** - Static type checking

## 📁 Project Structure

```
restaurant-ai-automation-system/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (auth)/            # Authentication routes
│   │   ├── 📁 (admin)/           # Admin dashboard routes
│   │   ├── 📁 (customer)/        # Customer-facing routes
│   │   └── 📁 api/               # API routes
│   ├── 📁 components/            # Reusable UI components
│   │   ├── 📁 ui/               # Base UI components
│   │   ├── 📁 forms/            # Form components
│   │   ├── 📁 layout/           # Layout components
│   │   ├── 📁 menu/             # Menu-specific components
│   │   ├── 📁 cart/             # Cart components
│   │   ├── 📁 orders/           # Order components
│   │   ├── 📁 ai/               # AI components
│   │   └── 📁 admin/            # Admin components
│   ├── 📁 lib/                  # Utility libraries
│   │   ├── 📁 auth/             # Authentication utilities
│   │   ├── 📁 database/         # Database utilities
│   │   ├── 📁 ai/               # AI utilities
│   │   ├── 📁 payments/         # Payment utilities
│   │   ├── 📁 utils/            # General utilities
│   │   ├── 📁 hooks/            # Custom React hooks
│   │   └── 📁 constants/        # App constants
│   ├── 📁 models/               # Database models
│   ├── 📁 types/                # TypeScript type definitions
│   ├── 📁 schemas/              # Validation schemas
│   ├── 📁 middleware/           # Next.js middleware
│   └── 📁 services/             # Business logic services
├── 📁 public/                   # Static assets
├── 📁 scripts/                  # Build and utility scripts
├── 📁 tests/                    # Test files
└── 📁 docs/                     # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 8+
- MongoDB (local or MongoDB Atlas)
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd restaurant-ai-automation-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/restaurant-ai-automation
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-here
   OPENAI_API_KEY=your-openai-api-key-here
   STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
   STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
   ```

4. **Set up the database**
   ```bash
   npm run seed:dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Admin Account
- **Email**: admin@restaurant.com
- **Password**: admin123

## 🧪 Testing

### Unit Tests
```bash
npm run test
npm run test:watch
npm run test:coverage
```

### E2E Tests
```bash
npm run test:e2e
npm run test:e2e:open
```

## 🏗️ Development

### Code Quality
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors
npm run format        # Format code with Prettier
npm run check-types   # Check TypeScript types
```

### Database Seeding
```bash
npm run seed:dev      # Seed development database
```

Developer convenience: the running dev server exposes a protected endpoint to trigger seeding: `POST /api/dev/seed`.
Set `NODE_ENV=development` and `DEV_SEED_KEY` in your `.env.local`, and include the key value in the `x-dev-seed-key` request header when calling the route.

### Building for Production
```bash
npm run build         # Build the application
npm run start         # Start production server
```

## 🔧 Configuration

### Environment Variables
See `.env.example` for all available environment variables.

### Feature Flags
Control feature availability with environment variables:
- `NEXT_PUBLIC_AI_CHAT_ENABLED=true`
- `NEXT_PUBLIC_RESERVATIONS_ENABLED=true`
- `NEXT_PUBLIC_REVIEWS_ENABLED=true`
- `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
- `NEXT_PUBLIC_PAYMENTS_ENABLED=true`

## 📚 API Documentation

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/[id]` - Get menu item by ID
- `POST /api/admin/menu` - Create menu item (admin only)
- `PUT /api/admin/menu/[id]` - Update menu item (admin only)
- `DELETE /api/admin/menu/[id]` - Delete menu item (admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order by ID
- `PUT /api/orders/[id]/status` - Update order status

### AI
- `POST /api/ai/chat` - Chat with AI assistant
- `POST /api/ai/recommendations` - Get AI recommendations
- `POST /api/ai/reviews` - Generate review responses

### Admin
- `GET /api/admin/dashboard` - Get dashboard data
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/orders` - Get all orders (admin only)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure code passes linting and formatting checks
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [OpenAI](https://openai.com/) for AI capabilities
- [Stripe](https://stripe.com/) for payment processing
- [MongoDB](https://www.mongodb.com/) for the database
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components

## 📞 Support

For support, email support@restaurant-ai.com or create an issue in the GitHub repository.

---

**Built with ❤️ for the restaurant industry**