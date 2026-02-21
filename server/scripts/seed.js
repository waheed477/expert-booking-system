// server/scripts/seed.js
const mongoose = require('mongoose');
const path = require('path');
// Load .env from server folder
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Expert = require('../models/Expert');

const experts = [
  // ========== ASTROLOGY (3 Experts) ==========
  {
    name: "Dr. Anand Sharma",
    category: "Astrology",
    experience: 15,
    rating: 4.8,
    totalReviews: 234,
    bio: "Dr. Anand Sharma is a renowned astrologer with 15+ years of experience. He specializes in Vedic astrology, horoscope matching, and career predictions.",
    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
    hourlyRate: 50,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: false },
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      },
      { 
        date: new Date(Date.now() + 172800000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "12:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false },
          { time: "05:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Acharya Priya Verma",
    category: "Astrology",
    experience: 12,
    rating: 4.9,
    totalReviews: 567,
    bio: "Acharya Priya is a 4th generation astrologer specializing in Kundli matching and marriage predictions.",
    profileImage: "https://randomuser.me/api/portraits/women/3.jpg",
    hourlyRate: 60,
    languages: ["Hindi", "English", "Sanskrit"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: false },
          { time: "10:00 AM", isBooked: true },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      },
      { 
        date: new Date(Date.now() + 172800000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: true },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Pt. Ravi Shastri",
    category: "Astrology",
    experience: 25,
    rating: 4.7,
    totalReviews: 1890,
    bio: "Pt. Ravi Shastri is a celebrity astrologer who has appeared on TV shows. He specializes in Muhurat fixing and astrological remedies.",
    profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
    hourlyRate: 75,
    languages: ["Hindi", "English", "Gujarati"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "12:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      }
    ]
  },

  // ========== VASTU (3 Experts) ==========
  {
    name: "Prof. Vaidika Kumar",
    category: "Vastu",
    experience: 12,
    rating: 4.6,
    totalReviews: 178,
    bio: "Prof. Vaidika Kumar is a certified Vastu consultant. She has transformed 500+ homes and offices.",
    profileImage: "https://randomuser.me/api/portraits/women/2.jpg",
    hourlyRate: 45,
    languages: ["Hindi", "English", "Sanskrit"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Ar. Suresh Mehta",
    category: "Vastu",
    experience: 18,
    rating: 4.5,
    totalReviews: 342,
    bio: "Suresh Mehta is both an architect and Vastu expert. He has worked on 200+ commercial projects.",
    profileImage: "https://randomuser.me/api/portraits/men/4.jpg",
    hourlyRate: 55,
    languages: ["Hindi", "English", "Marathi"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: false },
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: true },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      },
      { 
        date: new Date(Date.now() + 172800000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Vastu Acharya Neha",
    category: "Vastu",
    experience: 8,
    rating: 4.4,
    totalReviews: 98,
    bio: "Neha specializes in residential Vastu and has helped 300+ families achieve peace and prosperity.",
    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
    hourlyRate: 40,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "11:00 AM", isBooked: false },
          { time: "12:00 PM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false },
          { time: "05:00 PM", isBooked: false }
        ]
      }
    ]
  },

  // ========== NUMEROLOGY (3 Experts) ==========
  {
    name: "Astro. Rajesh Gupta",
    category: "Numerology",
    experience: 8,
    rating: 4.5,
    totalReviews: 92,
    bio: "Numerology expert helping people find their life path numbers and make important decisions.",
    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
    hourlyRate: 40,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: false },
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Dr. Kavita Joshi",
    category: "Numerology",
    experience: 14,
    rating: 4.7,
    totalReviews: 456,
    bio: "Dr. Kavita has a PhD in Numerology and has written 3 books on the subject.",
    profileImage: "https://randomuser.me/api/portraits/women/5.jpg",
    hourlyRate: 55,
    languages: ["Hindi", "English", "Marathi"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: true },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Numerologist Sanjay",
    category: "Numerology",
    experience: 6,
    rating: 4.3,
    totalReviews: 67,
    bio: "Sanjay specializes in business numerology and helps entrepreneurs choose the right business names.",
    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
    hourlyRate: 35,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: false },
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false },
          { time: "05:00 PM", isBooked: false }
        ]
      }
    ]
  },

  // ========== TAROT (2 Experts) ==========
  {
    name: "Tarot Reader Pooja",
    category: "Tarot",
    experience: 7,
    rating: 4.8,
    totalReviews: 234,
    bio: "Pooja is an intuitive tarot card reader. Her readings are known for their accuracy and empathy.",
    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
    hourlyRate: 35,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: true },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Akhil Tripathi",
    category: "Tarot",
    experience: 5,
    rating: 4.4,
    totalReviews: 89,
    bio: "Akhil combines tarot with astrology for more accurate predictions.",
    profileImage: "https://randomuser.me/api/portraits/men/6.jpg",
    hourlyRate: 30,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "11:00 AM", isBooked: false },
          { time: "12:00 PM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  },

  // ========== PALMISTRY (2 Experts) ==========
  {
    name: "Palmist Sharma ji",
    category: "Palmistry",
    experience: 20,
    rating: 4.9,
    totalReviews: 789,
    bio: "Sharma ji is a 3rd generation palmist. He has consulted celebrities and politicians.",
    profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
    hourlyRate: 65,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "09:00 AM", isBooked: true },
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false }
        ]
      }
    ]
  },
  {
    name: "Neha Kapoor",
    category: "Palmistry",
    experience: 9,
    rating: 4.5,
    totalReviews: 167,
    bio: "Neha is one of the few female palmistry experts. She specializes in health predictions.",
    profileImage: "https://randomuser.me/api/portraits/women/7.jpg",
    hourlyRate: 45,
    languages: ["Hindi", "English"],
    availableSlots: [
      { 
        date: new Date(Date.now() + 86400000),
        slots: [
          { time: "10:00 AM", isBooked: false },
          { time: "11:00 AM", isBooked: false },
          { time: "02:00 PM", isBooked: false },
          { time: "03:00 PM", isBooked: false },
          { time: "04:00 PM", isBooked: false }
        ]
      }
    ]
  }
];

async function seedDatabase() {
  try {
    // Check if MONGODB_URI is loaded
    console.log('📁 .env path:', path.join(__dirname, '../.env'));
    console.log('🔗 MONGODB_URI:', process.env.MONGODB_URI);
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing experts
    await Expert.deleteMany({});
    console.log('✅ Cleared existing experts');

    // Insert new experts
    await Expert.insertMany(experts);
    console.log('✅ Added sample experts');

    // Count by category
    const astrology = await Expert.countDocuments({ category: 'Astrology' });
    const vastu = await Expert.countDocuments({ category: 'Vastu' });
    const numerology = await Expert.countDocuments({ category: 'Numerology' });
    const tarot = await Expert.countDocuments({ category: 'Tarot' });
    const palmistry = await Expert.countDocuments({ category: 'Palmistry' });

    console.log('\n📊 Experts by category:');
    console.log(`Astrology: ${astrology} experts`);
    console.log(`Vastu: ${vastu} experts`);
    console.log(`Numerology: ${numerology} experts`);
    console.log(`Tarot: ${tarot} experts`);
    console.log(`Palmistry: ${palmistry} experts`);
    console.log(`Total: ${experts.length} experts`);

    console.log('\n🌱 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();