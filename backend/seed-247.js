import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Store from './models/Store.js';

dotenv.config();

const seedStores = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/product-delivery');
    console.log('MongoDB Connected');

    const newStores = [
      {
        name: 'Midnight Munchies (24/7)',
        description: 'Late night cravings solved! Open 24/7 delivering hot product.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
        cuisineTypes: ['Burgers', 'Pizza', 'Beverages', 'Desserts'],
        rating: 4.8,
        deliveryTime: 25,
        costForTwo: 400,
        address: {
          street: 'Night Owl Street',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110001'
        },
        tags: ['24/7 Open', 'Late Night', 'Fast Product'],
        isActive: true
      },
      {
        name: 'The 24x7 Sushi Bar',
        description: 'Premium sushi and asian cuisine available all night.',
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=600&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1200&q=80',
        cuisineTypes: ['Sushi', 'Chinese', 'Asian'],
        rating: 4.9,
        deliveryTime: 35,
        costForTwo: 1200,
        address: {
          street: 'Premium Lane',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110002'
        },
        tags: ['24/7 Open', 'Premium', 'Sushi'],
        isActive: true
      },
      {
        name: 'Awadh Express (24/7)',
        description: 'Authentic Biryani and Kebabs available round the clock.',
        image: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&w=600&q=80',
        bannerImage: 'https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&w=1200&q=80',
        cuisineTypes: ['Biryani', 'Indian', 'Rolls'],
        rating: 4.7,
        deliveryTime: 30,
        costForTwo: 600,
        address: {
          street: 'Kebab Street',
          city: 'New Delhi',
          state: 'Delhi',
          zipCode: '110003'
        },
        tags: ['24/7 Open', 'Spicy', 'Mughlai'],
        isActive: true
      }
    ];

    await Store.insertMany(newStores);
    console.log('24/7 Stores Successfully Added!');
    process.exit();
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedStores();
