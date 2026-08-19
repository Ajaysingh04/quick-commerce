import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/appsica';

const seedAdvanced = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(MONGO_URI);
    console.log('Database connected!');

    // 1. Seed Categories if empty
    const categoryCount = await Category.countDocuments();
    let categoriesMap = {};
    const categoriesToSeed = [
      { name: 'Burgers', icon: '🍔' },
      { name: 'Pizza', icon: '🍕' },
      { name: 'Sushi', icon: '🍣' },
      { name: 'Indian', icon: '🍛' },
      { name: 'Salads & Healthy', icon: '🥗' },
      { name: 'Desserts', icon: '🍰' },
      { name: 'Chinese', icon: '🍜' },
      { name: 'Biryani', icon: '🍗' },
      { name: 'Pasta', icon: '🍝' },
      { name: 'Beverages', icon: '🥤' },
      { name: 'Rolls & Wraps', icon: '🌯' },
      { name: 'Coffee', icon: '☕' }
    ];

    if (categoryCount === 0) {
      console.log('Seeding categories...');
      for (const cat of categoriesToSeed) {
        const newCat = await Category.create(cat);
        categoriesMap[cat.name.toLowerCase()] = newCat._id;
      }
    } else {
      const allCats = await Category.find();
      allCats.forEach(c => {
        categoriesMap[c.name.toLowerCase()] = c._id;
      });
    }

    // 2. Seed Stores if empty
    const storeCount = await Store.countDocuments();
    let storesMap = {};
    const storesToSeed = [
      { name: 'The Burger Craft & Co.', description: 'Artisanal burgers and gourmet thickshakes.', bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Burgers', 'Fast Product', 'Beverages'], rating: 4.8, reviewsCount: 340, deliveryTime: 25, distance: 1.8, costForTwo: 500, featured: true },
      { name: 'La Piazza Woodfired', description: 'Authentic woodfired neapolitan pizzas and fresh pasta.', bannerImage: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Pizza', 'Italian', 'Pasta', 'Desserts'], rating: 4.7, reviewsCount: 512, deliveryTime: 35, distance: 3.2, costForTwo: 800, featured: true },
      { name: 'Ninja Roll & Asian House', description: 'Sushi rollers, street noodles, and classic Asian starters.', bannerImage: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Sushi', 'Asian', 'Healthy', 'Chinese'], rating: 4.9, reviewsCount: 289, deliveryTime: 30, distance: 2.5, costForTwo: 900, featured: true },
      { name: 'Royal Zaika & Kebabs', description: 'Rich Indian curries, slow cooked dum biryani, and rolls.', bannerImage: 'https://images.unsplash.com/photo-1585938338392-50a592202c7b?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Indian', 'Biryani', 'Rolls & Wraps'], rating: 4.6, reviewsCount: 780, deliveryTime: 40, distance: 4.1, costForTwo: 700, featured: false },
      { name: 'The Green Bowl Co.', description: 'Superproduct salad bowls, keto-friendly platters, and cold presses.', bannerImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Salads & Healthy', 'Healthy', 'Beverages'], rating: 4.7, reviewsCount: 154, deliveryTime: 20, distance: 1.5, costForTwo: 550, featured: false },
      { name: 'Velvet Crust Patisserie', description: 'Handcrafted desserts, rich chocolate cakes, and special coffees.', bannerImage: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', cuisineTypes: ['Desserts', 'Coffee', 'Beverages'], rating: 4.8, reviewsCount: 210, deliveryTime: 22, distance: 2.1, costForTwo: 400, featured: false }
    ];

    if (storeCount === 0) {
      console.log('Seeding stores...');
      for (const res of storesToSeed) {
        const newRes = await Store.create(res);
        storesMap[res.name.toLowerCase()] = newRes._id;
      }
    } else {
      const allRes = await Store.find();
      allRes.forEach(r => {
        storesMap[r.name.toLowerCase()] = r._id;
      });
    }

    // 3. Seed Products if empty
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding products list...');
      const productsToSeed = [
        { name: 'Smoked Truffle Burger', description: 'Double beef patty, melted swiss cheese, and luxury truffle oil glaze.', price: 299, isVeg: false, categoryName: 'burgers', storeName: 'the burger craft & co.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80' },
        { name: 'Crispy Paneer Burger', description: 'Fried crunchy paneer block with spicy jalapeno dressing and iceberg lettuce.', price: 229, isVeg: true, categoryName: 'burgers', storeName: 'the burger craft & co.', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80' },
        { name: 'Classic Margherita Pizza', description: 'Rich buffalo mozzarella, organic tomato basil puree, and cold-pressed olive oil.', price: 349, isVeg: true, categoryName: 'pizza', storeName: 'la piazza woodfired', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80' },
        { name: 'Dragon Avocado Roll', description: 'Avocado sushi rolls topped with eel sauce, cucumber, and spicy mayo.', price: 549, isVeg: false, categoryName: 'sushi', storeName: 'ninja roll & asian house', image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80' },
        { name: 'Paneer Makhani (Royal)', description: 'Paneer cubes cooked in rich butter, tomato, cashew paste gravy with local spices.', price: 329, isVeg: true, categoryName: 'indian', storeName: 'royal zaika & kebabs', image: 'https://images.unsplash.com/photo-1585938338392-50a592202c7b?auto=format&fit=crop&w=300&q=80' },
        { name: 'Avocado Quinoa Salad', description: 'Quinoa mixed with diced avocados, parsley, cucumber, tomato, and lime dressing.', price: 289, isVeg: true, categoryName: 'salads & healthy', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80', storeName: 'the green bowl co.' },
        { name: 'Belgian Chocolate Mud Cake', description: 'Warm fudge chocolate mud cake with layered thick frosting.', price: 189, isVeg: true, categoryName: 'desserts', storeName: 'velvet crust patisserie', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80' },
        { name: 'Hakka Chilli Paneer', description: 'Paneer wok-tossed in dark soy sauce, chilli paste, capsicum, and onions.', price: 249, isVeg: true, categoryName: 'chinese', storeName: 'ninja roll & asian house', image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80' },
        { name: 'Schezwan Veg Noodles', description: 'Spicy wok noodles loaded with crisp carrot, cabbage, and schezwan peppers.', price: 199, isVeg: true, categoryName: 'chinese', storeName: 'ninja roll & asian house', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80' },
        { name: 'Hyderabadi Chicken Biryani', description: 'Long grain basmati rice, layered with marinated chicken, saffron, and fresh mint.', price: 349, isVeg: false, categoryName: 'biryani', storeName: 'royal zaika & kebabs', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80' },
        { name: 'Royal Veg Dum Biryani', description: 'Saffron basmati rice cooked on dum with seasonal vegetables and cottage cheese.', price: 289, isVeg: true, categoryName: 'biryani', storeName: 'royal zaika & kebabs', image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=300&q=80' },
        { name: 'Creamy Alfredo Pasta', description: 'Penne tossed in rich and creamy parmesan butter sauce with mushrooms.', price: 279, isVeg: true, categoryName: 'pasta', storeName: 'la piazza woodfired', image: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=300&q=80' },
        { name: 'Spicy Arrabbiata Pasta', description: 'Pasta in spicy roasted tomato garlic marinara with fresh red pepper flakes.', price: 259, isVeg: true, categoryName: 'pasta', storeName: 'la piazza woodfired', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80' },
        { name: 'Fresh Mint Mojito', description: 'Crushed lime and mint muddled with sparkling club soda and simple syrup.', price: 129, isVeg: true, categoryName: 'beverages', storeName: 'the burger craft & co.', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80' },
        { name: 'Double Chocolate Shake', description: 'Creamy cocoa shake with chocolate shavings and whipped cream garnish.', price: 159, isVeg: true, categoryName: 'beverages', storeName: 'the burger craft & co.', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=300&q=80' },
        { name: 'Double Egg Chicken Kathi Roll', description: 'Flatbread layered with eggs, roasted chicken tikka chunks, and pickled onions.', price: 179, isVeg: false, categoryName: 'rolls & wraps', storeName: 'royal zaika & kebabs', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80' },
        { name: 'Spicy Paneer Tikka Wrap', description: 'Tortilla wrapper stuffed with tandoori paneer tikka cubes, lettuce, and mint chutney.', price: 169, isVeg: true, categoryName: 'rolls & wraps', storeName: 'royal zaika & kebabs', image: 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=300&q=80' },
        { name: 'Classic Cappuccino', description: 'Perfect espresso shot with steamed milk and airy microfoam top.', price: 149, isVeg: true, categoryName: 'coffee', storeName: 'velvet crust patisserie', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Caramel Iced Latte', description: 'Double espresso poured over ice and milk, sweetened with rich caramel syrup.', price: 179, isVeg: true, categoryName: 'coffee', storeName: 'velvet crust patisserie', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80' }
      ];

      for (const product of productsToSeed) {
        const catId = categoriesMap[product.categoryName];
        const resId = storesMap[product.storeName];
        if (catId && resId) {
          await Product.create({
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            isVeg: product.isVeg,
            category: catId,
            store: resId
          });
        }
      }
    }

    // 4. Seed Coupons if empty
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      console.log('Seeding coupons...');
      await Coupon.create({ code: 'SPIN10', discountPercent: 10, minOrderValue: 299, validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      await Coupon.create({ code: 'SPIN20', discountPercent: 20, minOrderValue: 499, validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      await Coupon.create({ code: 'WELCOME50', discountPercent: 50, minOrderValue: 199, validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) });
      console.log('Coupons seeded!');
    }

    // 5. Update products tags (ingredients, moods, dietGoal)
    const products = await Product.find();
    console.log(`Found ${products.length} products to update/enrich tags...`);

    const sampleIngredients = {
      pizza: ['Wheat Flour', 'Mozzarella Cheese', 'Tomato Basil Sauce', 'Pepperoni', 'Oregano'],
      burger: ['Brioche Bun', 'Chicken Patty', 'Cheddar Cheese', 'Lettuce', 'Tomato', 'Special Sauce'],
      salad: ['Lettuce', 'Cherry Tomatoes', 'Cucumber', 'Olive Oil', 'Feta Cheese', 'Avocado'],
      pasta: ['Penne Pasta', 'Olive Oil', 'Garlic', 'Parmesan Cheese', 'Basil', 'Heavy Cream'],
      sushi: ['Sushi Rice', 'Nori (Seaweed)', 'Salmon', 'Avocado', 'Soy Sauce', 'Wasabi'],
      default: ['Fresh Dough', 'Cheese', 'House Sauce', 'Organic Seasoning', 'Olive Oil']
    };

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const nameLower = product.name.toLowerCase();

      // Pick realistic ingredients
      let ingredients = sampleIngredients.default;
      if (nameLower.includes('pizza')) ingredients = sampleIngredients.pizza;
      else if (nameLower.includes('burger')) ingredients = sampleIngredients.burger;
      else if (nameLower.includes('salad')) ingredients = sampleIngredients.salad;
      else if (nameLower.includes('pasta')) ingredients = sampleIngredients.pasta;
      else if (nameLower.includes('sushi')) ingredients = sampleIngredients.sushi;

      // Assign goal based on tags
      let dietGoal = [];
      if (nameLower.includes('salad') || nameLower.includes('vegan') || nameLower.includes('healthy') || product.price > 400) {
        dietGoal.push('Weight Loss');
        dietGoal.push('Healthy Diet');
      } else if (nameLower.includes('burger') || nameLower.includes('pizza') || nameLower.includes('shake')) {
        dietGoal.push('Weight Gain');
      } else {
        dietGoal.push('Healthy Diet');
      }

      if (nameLower.includes('chicken') || nameLower.includes('paneer') || nameLower.includes('fish') || nameLower.includes('egg')) {
        dietGoal.push('High Protein');
      }

      // Assign mood based on tags
      let mood = [];
      if (nameLower.includes('pizza') || nameLower.includes('burger') || nameLower.includes('shake')) {
        mood.push('Party');
        mood.push('Happy');
      } else if (nameLower.includes('coffee') || nameLower.includes('tea') || nameLower.includes('snack') || nameLower.includes('sandwich')) {
        mood.push('Study');
        mood.push('Sad'); // comfort product/drink
      } else if (nameLower.includes('sushi') || nameLower.includes('pasta') || nameLower.includes('wine') || nameLower.includes('dessert') || nameLower.includes('cake')) {
        mood.push('Romantic Dinner');
        mood.push('Happy');
      } else {
        mood.push('Happy');
      }

      // Assign calories
      let calories = 300 + Math.floor(Math.random() * 600); // 300 to 900
      if (nameLower.includes('salad')) calories = 150 + Math.floor(Math.random() * 150); // 150 to 300

      product.ingredients = ingredients;
      product.dietGoal = dietGoal;
      product.mood = mood;
      product.calories = calories;
      product.arModelUrl = 'mock_3d_model_representation';

      await product.save();
    }

    console.log('Product updates complete!');

    // Add some reviews
    const reviewsCount = await Review.countDocuments();
    if (reviewsCount <= 2) {
      console.log('Seeding mock reviews with photos, comments and likes...');
      const users = await User.find({ role: 'user' });
      const stores = await Store.find();

      if (users.length > 0 && stores.length > 0) {
        for (let j = 0; j < Math.min(stores.length, 5); j++) {
          const store = stores[j];
          for (let k = 0; k < Math.min(users.length, 2); k++) {
            const user = users[k];
            try {
              await Review.create({
                user: user._id,
                store: store._id,
                rating: 4 + Math.floor(Math.random() * 2), // 4 or 5
                comment: `Absolutely loved the product and delivery service at ${store.name}! Must try their popular dishes.`,
                productPhoto: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
                likes: [user._id],
                comments: [
                  {
                    user: user._id,
                    userName: 'Support Bot',
                    text: 'Thank you for your valuable feedback! Glad you loved it.',
                    createdAt: new Date()
                  }
                ]
              });
            } catch (err) {
              // Ignore duplicate errors
            }
          }
        }
        console.log('Social reviews seeded successfully!');
      }
    }

    mongoose.connection.close();
    console.log('Seeding process finished. Database connection closed.');
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedAdvanced();
