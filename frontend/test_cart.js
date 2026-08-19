import { store } from './frontend/src/store/index.js';
import { addToCart } from './frontend/src/store/cartSlice.js';

try {
  console.log("Initial state:", store.getState().cart);
  
  store.dispatch(addToCart({
    item: { id: 'p1', name: 'Test', price: 100 },
    store: { id: 's1', name: 'Store 1' }
  }));
  
  console.log("After add:", store.getState().cart);
  
  store.dispatch(addToCart({
    item: { id: 'p2', name: 'Test 2', price: 200 },
    store: { id: 's1', name: 'Store 1' }
  }));
  
  console.log("After add 2:", store.getState().cart);
  
  store.dispatch(addToCart({
    item: { id: 'p3', name: 'Test 3', price: 300 },
    store: { id: 's2', name: 'Store 2' }
  }));
  
  console.log("After add 3 (conflict):", store.getState().cart);
  
  console.log("Success!");
} catch (e) {
  console.error("Error:", e);
}
