import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  const user = await db.collection('users').findOne({ email: 'appsica086@gmail.com' });
  if (!user) {
    console.log('User not found');
    process.exit(0);
  }

  // Get one store to keep
  const storeToKeep = await db.collection('stores').findOne({});
  if (!storeToKeep) {
    console.log('No stores exist');
    process.exit(0);
  }

  // Ensure user owns it
  await db.collection('stores').updateOne(
    { _id: storeToKeep._id },
    { $set: { owner: user._id, name: "My Partner Store" } }
  );

  // Delete all others
  const result = await db.collection('stores').deleteMany({
    _id: { $ne: storeToKeep._id }
  });

  console.log(`Kept 1 store. Deleted ${result.deletedCount} other stores.`);
  process.exit(0);
});
