# EcoBazaar

<div align="center">

**A Sustainable Marketplace for the Future**

A full-featured e-commerce platform with advanced sustainability analytics, carbon footprint tracking, and environmental impact visualization.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

</div>

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Database](#database)
- [Contributing](#contributing)

## 🌱 About

EcoBazaar is a sustainable marketplace platform designed to promote eco-friendly shopping and consumption. The platform combines modern e-commerce features with environmental impact tracking, helping users make informed purchasing decisions while monitoring their carbon footprint.

Built with a focus on:
- **Sustainability**: Real-time carbon footprint calculation and eco-scoring
- **Security**: Role-Based Access Control (RBAC) with secure authentication
- **Analytics**: Comprehensive environmental impact analytics and insights
- **User Experience**: Professional green-themed responsive UI with smooth animations

## ✨ Features

### User Features
- 🔐 **Secure Authentication**: Email signup/login with verification and JWT tokens
- 🛍️ **Product Catalog**: Browse, search, and filter sustainable products
- 🌍 **Eco-Scoring**: Real-time product environmental impact scores
- 💳 **Shopping Cart**: Add products and manage orders
- 🤖 **ML-Based Recommendations**: Smart product recommendations using machine learning
- 📱 **QR Code Scanning**: Scan products for quick information (Captcha integration)
- 🎁 **Rewards System**: Earn and redeem eco-rewards for sustainable choices
- 📊 **Analytics Dashboard**: Personal consumption analytics and carbon tracking
- 🌳 **Virtual Forest**: Track environmental contributions through virtual forest growth

### Admin Features
- 📈 **Admin Dashboard**: Monitor platform metrics and user activity
- 🛒 **Product Management**: Add, edit, and manage product catalog
- 👥 **User Management**: Manage user accounts and permissions
- 💰 **Bank Offers**: Manage promotional offers and discounts
- 🔍 **Analytics**: Advanced platform-wide analytics and insights

### Marketplace Features
- 💶 **Price Comparison**: Compare prices across products
- 🔔 **Order Tracking**: Real-time order status tracking
- 📜 **Order History**: Complete purchase history
- ⭐ **Like Popup**: Save favorite products
- 🎨 **Dynamic UI**: Responsive components with smooth animations

## 🛠 Tech Stack

### Frontend
- **React 19**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **Vite**: Next-generation build tool
- **React Router**: Client-side routing
- **Framer Motion**: Advanced animations
- **Recharts**: Data visualization
- **Lucide React**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type safety
- **SQLite (better-sqlite3)**: Lightweight database
- **JWT**: Secure token authentication
- **BCrypt**: Password hashing
- **CORS**: Cross-origin request handling

### AI/ML
- **Google Generative AI (Gemini)**: AI-powered features
- **ml-random-forest**: ML predictions
- **ml-regression-multivariate-linear**: Statistical analysis

### Additional Tools
- **Swagger UI**: API documentation
- **html5-qrcode**: QR code scanning
- **dotenv**: Environment configuration

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Gemini API Key**: Get it from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ecobazaarf
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required dependencies listed in `package.json`.

## 🔧 Environment Setup

### 1. Create Environment File

Create a `.env.local` file in the project root:

```bash
# Copy template if available
# or create .env.local manually
```

### 2. Add Required Environment Variables

```env
# Google Gemini API Key (required for AI features)
GEMINI_API_KEY=your_gemini_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

**How to get your Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the API key
4. Paste it in your `.env.local` file

> ⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## ▶️ Running the Application

### Development Mode

```bash
npm run dev
```

**What happens:**
- Backend (Express server) starts on `http://localhost:3000`
- Frontend (Vite dev server) runs with hot module replacement
- The application will open in your browser automatically

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

Runs the production build locally to test before deployment.

### Type Checking

```bash
npm run lint
```

Validates TypeScript types without generating any output.

## 📁 Project Structure

```
ecobazaarf/
├── components/              # Reusable React components
│   ├── BankOffers.tsx      # Bank offers display
│   ├── Captcha.tsx         # QR code scanning
│   ├── LikePopup.tsx       # Favorites/likes
│   ├── Navbar.tsx          # Navigation component
│   ├── OfferCard.tsx       # Product offer cards
│   ├── PaymentModal.tsx    # Payment interface
│   ├── PriceComparison.tsx # Price comparison
│   ├── PriceDetails.tsx    # Price breakdown
│   ├── ProtectedRoute.tsx  # Route protection with RBAC
│   └── VirtualForest.tsx   # Virtual forest visualization
├── pages/                   # Page components
│   ├── AdminDashboard.tsx  # Admin overview
│   ├── AdminPanel.tsx      # Admin controls
│   ├── Analytics.tsx       # User analytics
│   ├── CircularMarketplace.tsx # Marketplace UI
│   ├── Dashboard.tsx       # User dashboard
│   ├── Login.tsx           # Login page
│   ├── Products.tsx        # Product listing
│   ├── Profile.tsx         # User profile
│   ├── Register.tsx        # Registration
│   └── ... (other pages)
├── context/                 # React Context
│   └── AuthContext.tsx     # Authentication state
├── services/               # Business logic
│   ├── authService.ts      # Authentication API calls
│   ├── userService.ts      # User operations
│   ├── productService.ts   # Product operations
│   └── rewardService.ts    # Rewards system
├── src/services/           # Additional services
│   ├── authService.ts      # Backend auth
│   └── userService.ts      # Backend user ops
├── App.tsx                 # Main application component
├── index.tsx               # Entry point
├── server.ts               # Express server setup
├── db.ts                   # Database initialization
├── types.ts                # TypeScript type definitions
├── mlModule.ts             # Machine learning module
├── vite.config.ts          # Vite configuration
├── tsconfig.json           # TypeScript configuration
├── package.json            # Dependencies and scripts
└── index.html              # HTML template
```

## 📝 Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `npm run dev` | Start dev server with hot reload |
| Start | `npm start` | Start the application |
| Build | `npm run build` | Create production build |
| Preview | `npm run preview` | Preview production build |
| Lint | `npm run lint` | Check TypeScript types |

## 📚 API Documentation

The application includes Swagger UI for API documentation.

**Access API Docs:** http://localhost:3000/api-docs

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address

#### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products/eco-score/:id` - Calculate eco-score
- `GET /api/products/comparison` - Compare products

#### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order tracking info

#### Analytics
- `GET /api/analytics/dashboard` - User analytics
- `GET /api/analytics/carbon-footprint` - Carbon tracking
- `GET /api/analytics/sustainability` - Sustainability metrics

#### Admin
- `GET /api/admin/users` - Manage users
- `GET /api/admin/analytics` - Platform analytics
- `POST /api/admin/offers` - Manage bank offers

## 🔐 Authentication

The application uses JWT (JSON Web Tokens) for secure authentication:

1. Users register/login with email and password
2. Password is hashed using bcryptjs
3. JWT token is issued upon successful login
4. Token is stored in browser storage
5. Protected routes verify token validity
6. Role-Based Access Control (RBAC) manages user permissions

### User Roles
- **User**: Standard customer with full shopping access
- **Admin**: Full platform access including analytics and management

## 💾 Database

The application uses **SQLite** with better-sqlite3:

- **Location**: Database is stored locally (configured in `db.ts`)
- **Tables**: Users, Products, Orders, Analytics, etc.
- **Type-Safe**: All queries are type-checked with TypeScript

### Database Operations
- User profiles and authentication data
- Product catalog and inventory
- Order history and tracking
- Analytics and metrics
- Rewards and transactions

## 🐛 Troubleshooting

### Port 3000 Already in Use
```bash
# Change port in vite.config.ts or kill the process using port 3000
# On Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Gemini API Key Error
- Verify the API key in `.env.local`
- Check API key has proper permissions in Google AI Studio
- Ensure `.env.local` is not in `.gitignore` exceptions

### Database Errors
- Delete old database file and restart (data will be reset)
- Check `db.ts` for schema issues
- Ensure write permissions in project directory

### Build Fails
- Clear node_modules: `rm -r node_modules` and `npm install`
- Clear Vite cache: `rm -r dist`
- Check Node.js version compatibility

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the documentation above

---

<div align="center">

**Built with ♻️ for a sustainable future**

Made with ❤️ by the EcoBazaar Team

</div>
