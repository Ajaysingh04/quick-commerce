import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  const user = await db.collection('users').findOne({ email: 'appsica086@gmail.com' });
  console.log('Partner User ID:', user?._id);

  const store = await db.collection('stores').findOne({});
  console.log('Store Owner ID:', store?.owner);
  
  const orders = await db.collection('orders').find({}).toArray();
  console.log('Total Orders:', orders.length);
  if (orders.length > 0) {
    console.log('Latest Order Store ID:', orders[orders.length-1].store);
    console.log('Is Latest Order Rest ID == Store ID?', orders[orders.length-1].store?.toString() === store?._id?.toString());
  }

  process.exit(0);
});
