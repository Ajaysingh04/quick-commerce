# Deployment Setup Guide

This project is prepared for a standard production setup:

- Frontend: Vercel
- Backend: Render / Railway / any Node host
- Database: MongoDB Atlas
- Storage: Cloudinary
- Payments: Stripe / Razorpay
- Auth: Clerk

## 1) Frontend on Vercel

1. Import the `frontend` folder into Vercel.
2. Set the build command:
   - `npm install`
   - `npm run build`
3. Set output directory:
   - `dist`
4. Add environment variables:
   - `VITE_API_URL=https://your-backend-domain.com/api`
   - `VITE_SOCKET_URL=https://your-backend-domain.com`
   - `VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key`
5. Deploy.

## 2) Backend on Render

1. Create a new Web Service from the `backend` folder.
2. Build command:
   - `npm install`
3. Start command:
   - `npm start`
4. Add environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>`
   - `JWT_ACCESS_SECRET=your_access_secret`
   - `JWT_REFRESH_SECRET=your_refresh_secret`
   - `CLOUDINARY_CLOUD_NAME=your_cloud_name`
   - `CLOUDINARY_API_KEY=your_api_key`
   - `CLOUDINARY_API_SECRET=your_api_secret`
   - `CLIENT_URL=https://your-frontend-domain.com`
   - `FRONTEND_URL=https://your-frontend-domain.com`
   - `STRIPE_SECRET_KEY=your_stripe_key`
   - `RAZORPAY_KEY_ID=your_razorpay_key`
   - `RAZORPAY_KEY_SECRET=your_razorpay_secret`
   - `EMAIL_HOST=smtp.gmail.com`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=your_email`
   - `EMAIL_PASS=your_app_password`

## 3) MongoDB Atlas

1. Create a cluster.
2. Create a database user.
3. Whitelist your current IP and Render IPs.
4. Use the connection string in `MONGO_URI`.

## 4) Clerk Setup

1. Create a Clerk app.
2. Add your frontend domain to allowed origins.
3. Set the publishable key in frontend env.
4. Configure the Sign-in / Sign-up redirect URLs if needed.

## 5) Important Production Notes

- Do not keep `localhost` in production env files.
- Frontend must hit the deployed backend URL, not `http://localhost:5000`.
- Backend CORS must allow your deployed frontend domain.
- Keep `CLIENT_URL` and `FRONTEND_URL` aligned with the actual live frontend domain.
- For Socket.io, set `VITE_SOCKET_URL` to the backend production URL.

## 6) Recommended deployment order

1. Deploy MongoDB Atlas
2. Deploy backend on Render
3. Confirm backend health endpoint works
4. Deploy frontend on Vercel
5. Set all env variables again in Vercel
6. Test signup, login, partner onboarding, and admin approval flow

## 7) Default app URLs

Example:

- Frontend: `https://quick-commerce.vercel.app`
- Backend: `https://quick-commerce-backend.onrender.com`

Then env values would be:

- Frontend: `VITE_API_URL=https://quick-commerce-backend.onrender.com/api`
- Frontend: `VITE_SOCKET_URL=https://quick-commerce-backend.onrender.com`
- Backend: `CLIENT_URL=https://quick-commerce.vercel.app`
- Backend: `FRONTEND_URL=https://quick-commerce.vercel.app`
