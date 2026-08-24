import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Banner from './models/Banner.js';
import Page from './models/Page.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Check if banners exist
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.insertMany([
        {
          title: 'We bring the store to your door',
          subtitle: 'Get organic produce and sustainably sourced groceries delivery at up to 40% off grocery.',
          imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e',
          linkUrl: '/shop',
          position: 'hero',
          isActive: true,
          order: 1
        },
        {
          title: '$29',
          subtitle: 'Enjoy Discount on all types of Grocery & frozen item',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
          linkUrl: '/offers',
          position: 'promotional',
          isActive: true,
          order: 1
        },
        {
          title: '30%',
          subtitle: 'Enjoy Discount on all types of Grocery & frozen item',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
          linkUrl: '/offers',
          position: 'promotional',
          isActive: true,
          order: 2
        },
        {
          title: '50%',
          subtitle: 'Enjoy Discount on all types of Grocery & frozen item',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
          linkUrl: '/offers',
          position: 'promotional',
          isActive: true,
          order: 3
        },
        {
          title: 'SHIP',
          subtitle: 'Enjoy Discount on all types of Grocery & frozen item',
          imageUrl: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png',
          linkUrl: '/offers',
          position: 'promotional',
          isActive: true,
          order: 4
        }
      ]);
      console.log('Banners seeded!');
    }

    // Check if pages exist
    const pageCount = await Page.countDocuments();
    if (pageCount === 0) {
      await Page.insertMany([
        {
          slug: 'about-us',
          title: 'About Us',
          content: '<h2>About RoseDash</h2><p>We are a premium quick commerce platform delivering your essentials in minutes.</p>',
          isActive: true
        },
        {
          slug: 'privacy-policy',
          title: 'Privacy Policy',
          content: '<h2>Privacy Policy</h2><p>Your privacy is important to us. Here is how we handle your data.</p>',
          isActive: true
        },
        {
          slug: 'terms',
          title: 'Terms of Service',
          content: '<h2>Terms of Service</h2><p>By using our app, you agree to these terms.</p>',
          isActive: true
        }
      ]);
      console.log('Pages seeded!');
    }

    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
