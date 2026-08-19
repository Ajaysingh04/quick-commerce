import mongoose from 'mongoose';
mongoose.connect('mongodb://localhost:27017/product-delivery').then(async () => {
  const db = mongoose.connection.db;
  const stores = await db.collection('stores').find({ owner: { $exists: true, $ne: null } }).toArray();
  if (stores.length === 0) {
    console.log('NO_OWNER_STORES');
  } else {
    for (const r of stores) {
      console.log('Store:', r.name);
      const products = await db.collection('products').find({ store: r._id }).toArray();
      console.log('Items:', products.map(f => f.name).join(', '));
    }
  }
  process.exit(0);
});
