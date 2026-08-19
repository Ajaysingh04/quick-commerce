import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api.js';
import roseLogo from '../assets/RoshDash.png';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
 const [settings, setSettings] = useState({
 siteTitle: 'RoseDash',
 adminHeaderText: 'RoseDash Admin',
 adminHeaderColor: '',
 faviconUrl: '',
 logoUrl: roseLogo,
 primaryColor: '#f43f5e'
 });

 useEffect(() => {
 const fetchSettings = async () => {
 try {
 const res = await API.get('/settings');
 if (res.data) {
 setSettings(prev => ({
   ...prev,
   ...res.data,
   logoUrl: roseLogo, // FORCE our imported logo instead of whatever is in the DB
   siteTitle: 'RoseDash' // FORCE RoseDash instead of using backend Appsica Food Delivery
 }));
 
 // Apply globally
 if (res.data.primaryColor) {
 const hex = res.data.primaryColor.startsWith('#') ? res.data.primaryColor : `#${res.data.primaryColor}`;
 if (hex.length === 7) {
 const r = parseInt(hex.substring(1, 3), 16);
 const g = parseInt(hex.substring(3, 5), 16);
 const b = parseInt(hex.substring(5, 7), 16);
 
 const mix = (c1, c2, weight) => {
 const w = weight / 100;
 return [
 Math.round(c1[0] * w + c2[0] * (1 - w)),
 Math.round(c1[1] * w + c2[1] * (1 - w)),
 Math.round(c1[2] * w + c2[2] * (1 - w))
 ].join(' ');
 };

 const base = [r, g, b];
 const white = [255, 255, 255];
 const black = [0, 0, 0];

 document.documentElement.style.setProperty('--brand-50', mix(base, white, 10)); // 10% base, 90% white
 document.documentElement.style.setProperty('--brand-500', `${r} ${g} ${b}`);
 document.documentElement.style.setProperty('--brand-600', mix(base, black, 90)); // 90% base, 10% black
 document.documentElement.style.setProperty('--brand-700', mix(base, black, 80)); // 80% base, 20% black
 }
 }

 if (res.data.siteTitle) {
 document.title = res.data.siteTitle;
 } else {
 document.title = 'RoseDash';
 }
 if (res.data.faviconUrl) {
 let link = document.querySelector("link[rel~='icon']");
 if (!link) {
 link = document.createElement('link');
 link.rel = 'icon';
 document.head.appendChild(link);
 }
 link.href = res.data.faviconUrl;
 }
 }
 } catch (err) {
 console.error('SettingsContext: Error loading settings', err);
 }
 };
 fetchSettings();
 }, []);

 return (
 <SettingsContext.Provider value={{ settings, setSettings }}>
 {children}
 </SettingsContext.Provider>
 );
};
