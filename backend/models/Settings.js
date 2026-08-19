import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  siteTitle: { type: String, default: 'RoseDash Product Delivery' },
  adminHeaderText: { type: String, default: 'RoseDash Admin' },
  adminHeaderColor: { type: String, default: '' },
  faviconUrl: { type: String, default: '/favicon.ico' },
  logoUrl: { type: String, default: '' }, // If empty, UI falls back to text
  primaryColor: { type: String, default: '#f43f5e' } // Optional brand color
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
