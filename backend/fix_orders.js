import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  const store = await db.collection('stores').findOne({});
  if (!store) {
    console.log('No stores exist');
    process.exit(0);
  }

  // Update ALL orders to point to this single store
  const result = await db.collection('orders').updateMany(
    {}, 
    { $set: { store: store._id } }
  );

  console.log(`Updated ${result.modifiedCount} orders to point to the correct store.`);
  process.exit(0);
});
