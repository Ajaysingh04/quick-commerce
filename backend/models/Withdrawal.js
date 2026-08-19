import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  bankDetails: {
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountNumber: { type: String, required: true },
    ifscCode: { type: String, required: true }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);
export default Withdrawal;
