import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'RoseDash Product Delivery' },
  adminHeaderText: { type: String, default: 'RoseDash Admin' },
  adminHeaderColor: { type: String, default: '' },
  faviconUrl: { type: String, default: '/favicon.ico' },
  logoUrl: { type: String, default: '' },
  primaryColor: { type: String, default: '#f43f5e' },
  contactEmail: { type: String, default: 'support@rosedash.com' },
  contactPhone: { type: String, default: '+1234567890' },
  contactAddress: { type: String, default: '123 Market St, City' },
  socialLinks: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  globalNotice: { type: String, default: '' },
  activeSeason: { type: String, default: 'none' }, // 'none', 'monsoon', 'winter', 'summer', 'diwali'
  festivalOffer: {
    isActive: { type: Boolean, default: true },
    festivalName: { type: String, default: 'Mega Sale' },
    title: { type: String, default: 'Up to 70% OFF' },
    description: { type: String, default: 'Stock up on your daily essentials.' },
    buttonText: { type: String, default: 'Shop the Sale' },
    imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500&h=400&fit=crop' }
  },
  customCharges: {
    type: [{
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, enum: ['fixed', 'percentage'], required: true },
      value: { type: Number, required: true },
      isActive: { type: Boolean, default: true },
      season: { type: String, default: 'all' } // 'all', or specific season
    }],
    default: [
      { id: 'tax-gst', name: 'GST', type: 'percentage', value: 5, isActive: true, season: 'all' }
    ]
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
