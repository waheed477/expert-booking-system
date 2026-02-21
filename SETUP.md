# 🚀 Expert Booking System - Complete Setup Guide

## 📋 Prerequisites
Before starting, ensure you have installed:
- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **npm** (comes with Node.js)

## ⚡ Step-by-Step Installation

1. Clone the Repository

git clone https://github.com/waheed477/expert-booking-system.git
cd expert-booking-system


2. Backend Setup

# Open Terminal 1
cd server
npm install
echo "PORT=5001
MONGODB_URI=mongodb://localhost:27017/expert_booking_dev
NODE_ENV=development
CLIENT_URL=http://localhost:5173" > .env
npm run dev

3. Frontend Setup

# Open Terminal 2
cd client
npm install
echo "VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001" > .env
npm run dev

