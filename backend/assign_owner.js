import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  const user = await db.collection('users').findOne({ email: 'appsica086@gmail.com' });
  
  if (!user) {
    console.log('USER_NOT_FOUND_IN_BITEDASH');
    process.exit(0);
  }

  const result = await db.collection('stores').updateMany(
    {}, // all stores
    { $set: { owner: user._id } }
  );
  
  console.log(`SUCCESS: ${result.modifiedCount} stores assigned to ${user.email} (ID: ${user._id})`);
  process.exit(0);
});
