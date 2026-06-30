# ShopEasy — E-Commerce Website (Basic / Middle Level Project)

A simple e-commerce demo built with plain HTML, CSS, and JavaScript.
Data (users, cart) is stored in the browser's localStorage — no real
backend/database is required, so it can be deployed directly to any
free static hosting provider (GitHub Pages, Netlify, 000webhost, etc.)

## Features
- **Product Browsing**: Grid of products with images, name, category, and price.
- **Product Filtering**: Search by name, filter by category, sort by price (low/high).
- **Shopping Cart**: Add to cart, increase/decrease quantity, remove items, live cart count badge.
- **Checkout**: Simulated checkout form (name, address, demo card details) — no real payment gateway, but structured so a real one (Stripe/Razorpay) could be plugged in later.
- **User Authentication**: Basic register/login (stored in localStorage). Checkout requires login.
- **Responsive Design**: Works on mobile, tablet, and desktop.

## Why plain HTML/CSS/JS instead of React + Node + MongoDB?
The task mentions React, Node.js, and MongoDB as example technologies, but for a
**basic/demo-level** project (and to keep it a single static site you can host for
free with zero server setup), this version uses vanilla JavaScript with
localStorage acting as a mock database. This keeps it:
- Instantly runnable (just open `index.html`)
- Deployable to static hosts like GitHub Pages / Netlify in seconds
- Easy to upgrade later into a full MERN stack app if needed

## How to Run Locally
1. Unzip the folder.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox).

## How to Deploy (Free Hosting)
**GitHub Pages**
1. Create a new GitHub repo and push these files.
2. Go to Settings → Pages → set source to `main` branch / root.
3. Your site will be live at `https://<username>.github.io/<repo-name>/`.

**Netlify**
1. Go to netlify.com → "Add new site" → "Deploy manually".
2. Drag and drop this folder (or a zip of it).
3. Netlify gives you a live URL instantly.

**000webhost**
1. Create a free account, create a new site.
2. Use the File Manager to upload all files into the `public_html` folder.

## File Structure
```
ecommerce-site/
├── index.html    -> Page structure
├── style.css     -> Styling (responsive layout)
├── products.js   -> Sample product catalog data
├── script.js     -> App logic (auth, products, filtering, cart, checkout)
└── README.md     -> This file
```

## Notes
- Product images use placeholder images from picsum.photos (requires internet
  connection to load); replace with your own image URLs if needed.
- This is a demo project — payment is simulated, and passwords are stored in
  plain text in localStorage. Do not use this auth/payment logic in production.
