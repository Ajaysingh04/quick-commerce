import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  const coupons = await db.collection('coupons').find({}).toArray();
  const store = await db.collection('stores').findOne({});
  
  console.log('Single Store ID:', store?._id);
  console.log('--- Coupons ---');
  coupons.forEach(c => {
    console.log(`Code: ${c.code}, Active: ${c.isActive}, MinOrder: ${c.minOrderValue}, Store: ${c.store}`);
  });
  
  process.exit(0);
});
