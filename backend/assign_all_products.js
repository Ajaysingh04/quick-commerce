import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  // Find the single store we kept
  const store = await db.collection('stores').findOne({});
  if (!store) {
    console.log('No stores exist');
    process.exit(0);
  }

  // Update ALL product items in the database to belong to this single store
  const result = await db.collection('products').updateMany(
    {}, 
    { $set: { store: store._id } }
  );

  console.log(`Updated ${result.modifiedCount} product items to belong to the store: ${store.name}`);
  process.exit(0);
});
