import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import Store from '../models/Store.js';

const seedStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const featuredStores = [
      { name: 'Fresh Mart', category: 'Grocery & Essentials', rating: 4.8, bannerImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&h=200&fit=crop', featured: true, deliveryTime: 15, isActive: true },
      { name: 'Green Valley', category: 'Organic Fruits', rating: 4.9, bannerImage: 'https://images.unsplash.com/photo-1604719312566-8fa20f1882fb?w=300&h=200&fit=crop', featured: true, deliveryTime: 20, isActive: true },
      { name: 'Daily Baker', category: 'Breads & Bakery', rating: 4.7, bannerImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=200&fit=crop', featured: true, deliveryTime: 25, isActive: true },
      { name: 'Meat & More', category: 'Fresh Meat', rating: 4.5, bannerImage: 'https://images.unsplash.com/photo-1607623814075-e51df1bd682f?w=300&h=200&fit=crop', featured: true, deliveryTime: 30, isActive: true }
    ];

    for (const store of featuredStores) {
      const existing = await Store.findOne({ name: store.name });
      if (!existing) {
        await Store.create(store);
        console.log(`Created store: ${store.name}`);
      } else {
        console.log(`Store ${store.name} already exists. Updating featured status.`);
        existing.featured = true;
        existing.bannerImage = store.bannerImage;
        existing.category = store.category;
        existing.rating = store.rating;
        await existing.save();
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding stores:', error);
    process.exit(1);
  }
};

seedStores();
