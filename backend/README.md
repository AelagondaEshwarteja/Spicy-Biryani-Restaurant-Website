# Spicy Biryani – Backend (Express + MongoDB)

REST API for the Spicy Biryani website. Built with **Node.js, Express and Mongoose**, organised in the **MVC** pattern.

## Setup

```bash
npm install
cp .env.example .env     # Windows PowerShell: copy .env.example .env
npm run dev              # starts with nodemon (restarts when you save a file)
```

| Script | What it does |
|--------|--------------|
| `npm run dev` | Start the server with auto-restart (for development) |
| `npm start` | Start the server normally (for production) |
| `npm run seed` | **Reset** the menu to the default 26 dishes and reset the admin password from `.env` |

## Environment variables (`.env`)

| Name | Example | What it is for |
|------|---------|----------------|
| `PORT` | `5000` | Port the server runs on |
| `NODE_ENV` | `development` | In `production` error stack traces are hidden |
| `CLIENT_URL` | `https://my-other-site.com` | Extra frontend addresses allowed by CORS, comma separated. `http://localhost:5173` and the live Vercel site are always allowed (see `server.js`) |
| `MONGO_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/` | MongoDB connection string (local or Atlas) |
| `DB_NAME` | `spicy_biryani` | Name of the database inside MongoDB (default `spicy_biryani`) |
| `JWT_SECRET` | long random text | Used to sign login tokens. Keep it secret |
| `JWT_EXPIRES_IN` | `1d` | How long a login lasts |
| `ADMIN_EMAIL` | `admin@spicybiryani.com` | Admin login email |
| `ADMIN_PASSWORD` | your password | Admin login password (stored hashed in the database) |

> `.env` is in `.gitignore`, so your passwords are never pushed to GitHub. Only `.env.example` is shared.

## Folder structure (MVC)

```
backend/
├── server.js                 → creates the Express app, adds middleware and routes, starts the server
├── config/
│   └── db.js                 → connects to MongoDB
├── models/                   → M: what the data looks like
│   ├── MenuItem.js
│   ├── Order.js
│   ├── Admin.js              → hashes the password before saving
│   └── Message.js
├── controllers/              → C: what each API does
│   ├── menuController.js
│   ├── orderController.js
│   ├── authController.js
│   ├── messageController.js
│   └── nutritionController.js
├── routes/                   → connects URLs to controllers
├── middleware/
│   ├── authMiddleware.js     → protect(): checks the JWT token
│   └── errorMiddleware.js    → 404 handler + one place that formats every error
├── utils/
│   ├── billing.js            → subtotal + delivery + GST
│   ├── helpers.js            → order number, phone/email checks
│   └── nutritionTips.js      → simple rules that create meal tips
└── seed/
    ├── menuData.js           → the default menu
    └── seed.js               → puts the menu + admin into the database
```

(The "V" – the view – is the React frontend.)

### How a request flows

```
Browser → routes/orderRoutes.js → middleware (protect, only for admin routes)
        → controllers/orderController.js → models/Order.js → MongoDB
        → JSON response back to the browser
```

If anything fails, the controller calls `next(error)` and `errorMiddleware.js` sends a clean JSON error.

## API reference

All responses are JSON. Errors always look like `{ "message": "what went wrong" }`.
Admin routes need the header `Authorization: Bearer <token>`.

> **Tip:** opening an address in the browser always sends **GET**. Addresses that change data
> (like `PATCH /api/orders/:id/status` or `POST /api/auth/login`) answer **405** with a short
> explanation instead of "Route not found". Use the admin dashboard buttons or Postman with the right method.

### Menu

**`GET /api/menu`** – optional query: `category=biryani`, `veg=true`, `search=chicken`
```json
{ "count": 26, "items": [ { "_id": "...", "name": "Hyderabadi Chicken Dum Biryani", "price": 299, "category": "biryani", "isVeg": false, "nutrition": { "calories": 610, "protein": 32 } } ] }
```

**`GET /api/menu/:id`** → `{ "item": { ... } }`

**`POST /api/menu`** (admin) · **`PUT /api/menu/:id`** (admin) · **`DELETE /api/menu/:id`** (admin)
```json
// PUT body – send only what you want to change
{ "price": 319, "isAvailable": false }
```

### Orders

**`POST /api/orders`**
```json
{
  "customerName": "Ravi Kumar",
  "customerPhone": "9876543210",
  "customerEmail": "ravi@example.com",
  "deliveryAddress": "Flat 12, Main Road, Hanamkonda",
  "notes": "less spicy",
  "paymentMethod": "cod",
  "items": [ { "menuItemId": "<menu item _id>", "quantity": 2 } ]
}
```
Response `201`:
```json
{ "message": "Order placed successfully", "order": { "orderNumber": "SB-251127-4821", "subtotal": 598, "deliveryFee": 0, "gst": 30, "totalAmount": 628, "status": "pending" } }
```
Checks done: name, 10-digit Indian mobile, email format, address length, payment method, every item exists and is available, quantity 1–20.
**Prices always come from the database.**

**`GET /api/orders/track/:orderNumber?phone=9876543210`** → `{ "order": { ... } }` (404 if the phone doesn't match)

**`GET /api/orders?status=active&page=1&limit=50`** (admin)
`status` can be `all`, `active`, or any single status.
```json
{ "orders": [ ... ], "page": 1, "totalPages": 1, "total": 12 }
```

**`GET /api/orders/stats`** (admin)
```json
{ "stats": { "totalOrders": 12, "todayOrders": 5, "activeOrders": 3, "todayRevenue": 2841, "statusCounts": { "pending": 2, "delivered": 7 }, "unreadMessages": 1 } }
```

**`PATCH /api/orders/:id/status`** (admin) – body `{ "status": "preparing" }`
Statuses: `pending → confirmed → preparing → out_for_delivery → delivered`, or `cancelled`.

### Auth

**`POST /api/auth/login`** – body `{ "email": "...", "password": "..." }`
```json
{ "token": "eyJhbGciOi...", "admin": { "id": "...", "name": "Admin", "email": "admin@spicybiryani.com" } }
```
Wrong email **or** password gives the same `401 Wrong email or password`, so nobody can find out which emails exist.

**`GET /api/auth/me`** (admin) → `{ "admin": { ... } }`

### Messages (contact form)

| Method | URL | Body / result |
|--------|-----|---------------|
| POST | `/api/messages` | `{ name, email, phone?, message }` → `201` |
| GET | `/api/messages` (admin) | `{ "messages": [ ... ] }` newest first |
| PATCH | `/api/messages/:id/read` (admin) | marks as read |
| DELETE | `/api/messages/:id` (admin) | deletes it |

### Nutrition

**`POST /api/nutrition/analyze`** – body `{ "items": [ { "menuItemId": "...", "quantity": 1 } ] }`
```json
{ "totals": { "calories": 830, "protein": 39, "carbs": 110, "fat": 25, "fiber": 4 }, "dailyCaloriePercent": 42, "tips": [ { "type": "tip", "text": "Low on fibre. Add Dal Tadka..." } ] }
```

### Health check

**`GET /api/health`** → `{ "status": "ok" }` – useful for hosting services to see the server is alive.

## Security points

- Passwords hashed with **bcrypt** (10 salt rounds); the password field is never returned (`select: false`)
- Admin routes protected with **JWT** middleware
- **CORS** only allows the frontend URL from `.env`
- Request body limited to **100 kb**
- All inputs are checked; values are read as plain strings so objects can't be injected into MongoDB queries
- Search text is escaped before being used in a regex
- Prices and totals are always calculated on the server

## Speed points

- `compression` (gzip) on all responses
- Indexes: `orderNumber` (unique), `status + createdAt`, `category`
- `.lean()` and `.select()` so less data is read and sent
- `Promise.all` to run independent database queries at the same time
- `Cache-Control: public, max-age=60` on the menu
