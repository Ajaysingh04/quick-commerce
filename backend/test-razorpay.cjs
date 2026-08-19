const Razorpay = require('razorpay');

const instance = new Razorpay({
  key_id: 'rzp_test_TIs1FsoZoPKlhY',
  key_secret: 'nnWQN43n7WMwQQVOBpgv9S85',
});

instance.orders.create({
  amount: 50000,
  currency: "INR",
  receipt: "receipt#1"
}).then((response) => {
  console.log("Success:", response);
}).catch((error) => {
  console.error("Error:", error);
});
