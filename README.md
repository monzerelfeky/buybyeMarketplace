# Marketplace (MERN)

Marketplace web app with buyer/seller flows, listings, orders, cart, wishlist, and email notifications.

## Structure
- `server/` - Express + MongoDB API
- `src/` - React client
- `uploads/` - Local uploads (if enabled)

## Requirements
- Node.js 18+
- MongoDB

## Setup
1) Install dependencies
```
cd server
npm install
```
```
cd ..
npm install
```

2) Configure environment variables
- `server/.env` (see `server/.env.example` if present)
- Example keys:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
  - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
  - `GROQ_API_KEY`

3) Run the API
```
cd server
npm run dev
```

4) Run the client
```
cd ..
npm start
```

## API (high level)
Base URL: `http://localhost:5000`

- Auth: `/api/auth`
- Users & cart: `/api/users`
- Items: `/api/items`
- Orders: `/api/orders`
- Wishlist: `/api/wishlist`
- Flags: `/api/flags`
- Comments: `/api/comments`
- Uploads: `/api/upload`
- Sellers: `/api/sellers`
- Contact: `/api/contact`

## External services
- SMTP (emails)
- Cloudinary (image hosting)
- Groq (AI review summaries)
- Google OAuth (social login)

## Notes
- Role-based authorization is not enforced in routes by default; add middleware if needed.
- Static uploads are served from `/uploads`.
