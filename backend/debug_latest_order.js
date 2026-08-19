import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/bitedash').then(async () => {
  const db = mongoose.connection.db;
  
  const store = await db.collection('stores').findOne({});
  const partnerUser = await db.collection('users').findOne({ email: 'appsica086@gmail.com' });
  
  console.log('Single DB Store ID:', store?._id);
  console.log('Partner User ID:', partnerUser?._id);
  
  const latestOrder = await db.collection('orders').find({}).sort({ _id: -1 }).limit(1).toArray();
  
  if (latestOrder.length > 0) {
    const order = latestOrder[0];
    console.log('Latest Order ID:', order._id);
    console.log('Latest Order Store ID:', order.store);
    console.log('Matches Single Store?', order.store?.toString() === store?._id?.toString());
  } else {
    console.log('No orders found.');
  }

  process.exit(0);
});
