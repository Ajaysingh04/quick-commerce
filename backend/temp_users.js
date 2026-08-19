import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/product-delivery').then(async () => {
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ role: 'partner' }).toArray();
  console.log('Partner Users:');
  users.forEach(u => console.log(u.email, u._id));
  process.exit(0);
});
