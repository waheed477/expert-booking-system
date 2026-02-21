# 🚀 Expert Session Booking System

A real-time expert session booking platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring live slot updates, double booking prevention, and comprehensive booking management.

## ✨ Features

### 🎯 Core Functionality
- **Expert Directory**: Browse experts with search, filter by category, and pagination
- **Real-time Availability**: Live slot updates using Socket.io
- **Smart Booking System**: Double booking prevention with MongoDB transactions
- **Booking Management**: View and manage bookings with status tracking

### 🔥 Key Highlights
- ⚡ **Real-time Updates**: Slots update instantly across all connected clients
- 🔒 **Double Booking Prevention**: Race condition handling at database level
- 📱 **Fully Responsive**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI**: Clean, professional interface with Tailwind CSS
- ✅ **Form Validation**: Comprehensive validation using Zod and react-hook-form

### 📊 Technical Features
- RESTful API architecture
- WebSocket integration for real-time features
- MongoDB with Mongoose ODM
- React with TypeScript
- Environment-based configuration
- Proper error handling
- Loading states and skeletons

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Query** for data fetching
- **Socket.io-client** for real-time updates
- **React Hook Form** + **Zod** for validation
- **Sonner** for toast notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for WebSocket connections
- **Joi** for request validation
- **CORS** enabled for security
- **Dotenv** for configuration

## 📁 Project Structure
expert-booking-system/
├── client/ # React frontend
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── hooks/ # Custom React hooks
│ │ ├── context/ # React Context providers
│ │ ├── lib/ # Utilities and configs
│ │ └── types/ # TypeScript type definitions
│ ├── public/ # Static assets
│ └── package.json
│
├── server/ # Node.js backend
│ ├── models/ # MongoDB models
│ ├── controllers/ # Business logic
│ ├── routes/ # API routes
│ ├── middleware/ # Express middleware
│ ├── config/ # Configuration files
│ └── package.json
│
└── README.md