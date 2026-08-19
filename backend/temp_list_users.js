import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/product-delivery').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({}).toArray();
  
  console.log('All Users in DB:');
  users.forEach(u => console.log(`Email: ${u.email} | Role: ${u.role}`));
  process.exit(0);
});
