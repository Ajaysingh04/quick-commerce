import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  await db.collection('coupons').updateOne(
    { code: 'ZOMATO60' },
    { 
      $set: {
        code: 'ZOMATO60',
        discountPercent: 60,
        maxDiscount: 120,
        minOrderValue: 149,
        validFrom: new Date('2020-01-01'),
        validTo: new Date('2030-01-01'),
        isActive: true
      }
    },
    { upsert: true }
  );
  
  console.log('Inserted ZOMATO60 coupon');
  process.exit(0);
});
