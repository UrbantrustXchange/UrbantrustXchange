// backend/seed.js
// Run once to populate gift cards and create the admin user.
// Usage: node seed.js

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('./models/User');
const GiftCard = require('./models/GiftCard');

const ADMIN_EMAIL    = 'admin@urbantrustxchange.com';
const ADMIN_PASSWORD = 'Admin@UTX2024!';   // ← change after first login

const cards = [
  { name: 'Apple',       rate: 11.5, enabled: true,  risk_level: 'low'    },
  { name: 'Amazon',      rate: 11.0, enabled: true,  risk_level: 'low'    },
  { name: 'Steam',       rate: 10.6, enabled: true,  risk_level: 'low'    },
  { name: 'PlayStation', rate: 10.8, enabled: true,  risk_level: 'low'    },
  { name: 'Xbox',        rate: 10.5, enabled: true,  risk_level: 'low'    },
  { name: 'Google Play', rate: 10.3, enabled: true,  risk_level: 'low'    },
  { name: 'iTunes',      rate: 11.2, enabled: true,  risk_level: 'low'    },
  { name: 'Razer Gold',  rate: 10.2, enabled: true,  risk_level: 'medium' },
  { name: 'eBay',        rate: 10.0, enabled: true,  risk_level: 'medium' },
  { name: 'Visa',        rate: 9.5,  enabled: false,  risk_level: 'high'  },
  { name: 'Mastercard',  rate: 9.3,  enabled: false,  risk_level: 'high'  },
  { name: 'Vanilla',     rate: 9.0,  enabled: false,  risk_level: 'high'  },
  { name: 'MoneyPak',    rate: 8.8,  enabled: false,  risk_level: 'high'  },
  { name: 'Walmart',     rate: 9.1,  enabled: true,   risk_level: 'high'  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Upsert gift cards (keeps existing rates if already seeded)
  for (const card of cards) {
    await GiftCard.findOneAndUpdate(
      { name: card.name },
      { $setOnInsert: card },
      { upsert: true, new: true }
    );
  }
  console.log(`✅ ${cards.length} gift cards seeded`);

  // Create admin if not exists
  const adminExists = await User.findOne({ email: ADMIN_EMAIL });
  if (!adminExists) {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      email:           ADMIN_EMAIL,
      password:        hashed,
      phoneNumber:     '+233000000000',
      role:            'admin',
      isEmailVerified: true,
      isVerified:      true,
    });
    console.log(`✅ Admin created: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    console.log('   ⚠️  Change the password after first login!');
  } else {
    console.log(`ℹ️  Admin already exists: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
  console.log('✅ Seeding complete. Disconnected.');
}

seed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
