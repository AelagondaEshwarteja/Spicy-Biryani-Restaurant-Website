# Spicy Biryani – Frontend (React + TypeScript + Tailwind)

The customer website and the admin dashboard. Built with **React 18, TypeScript, Vite, Tailwind CSS, React Router** and **lucide-react** icons.

## Setup

```bash
npm install
npm run dev        # http://localhost:5173
```

Start the backend first (see `../backend/README.md`). While developing, Vite forwards every `/api/...` request to `http://localhost:5000`, so no extra setup is needed.

| Script | What it does |
|--------|--------------|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Check the code with ESLint |
| `npm run typecheck` | Check TypeScript types |

### Environment variable

| Name | When you need it |
|------|------------------|
| `VITE_API_URL` | Only in production, when the backend is on another address, e.g. `https://spicy-biryani-api.onrender.com/api` |

## Folder structure

```
src/
├── main.tsx                → starts React
├── App.tsx                 → routes: "/" home, "/admin" dashboard (lazy loaded)
├── pages/
│   ├── HomePage.tsx        → puts all home sections together, decides which popup is open
│   └── AdminPage.tsx       → shows login or dashboard depending on the saved token
├── components/
│   ├── layout/             → Navbar, Footer
│   ├── home/               → Hero, MenuSection, MenuCard, About, Testimonials, Contact
│   ├── order/              → CartDrawer, CheckoutModal, OrderTrackingModal, OrderStatusSteps,
│   │                         NutritionModal, MealCheckModal, BillSummary
│   ├── admin/              → AdminLogin, AdminDashboard, OrdersPanel, MenuPanel, MessagesPanel
│   └── common/             → Modal, VegBadge, SpiceLevel, QuantityStepper (reused everywhere)
├── context/
│   ├── CartContext.ts      → the shape of the cart
│   └── CartProvider.tsx    → cart logic + saving to localStorage
├── hooks/
│   ├── useCart.ts          → const { items, addItem } = useCart()
│   └── useLockBodyScroll.ts→ stops the page scrolling behind popups
├── services/api.ts         → the ONLY file that talks to the backend
├── data/siteInfo.ts        → address, phone, hours, sample reviews, image links
├── types/index.ts          → TypeScript types (MenuItem, Order, ...)
└── utils/format.ts         → prices (₹1,299), dates, bill calculation, status labels
```

## Main ideas

**Talking to the backend** – components never call `fetch` themselves. They use functions from `services/api.ts`, e.g. `menuApi.getAll()` or `orderApi.create(order)`. That file adds the JSON headers and the admin token, and turns server errors into readable messages.

**Cart state** – the cart lives in a React Context so any component can use it with `useCart()`. Every change is also saved in `localStorage`, so the cart is still there after a refresh.

**Popups** – `HomePage` keeps one value, `popup`, which is `'cart'`, `'checkout'`, `'tracking'` or `'none'`. This makes sure only one popup is open at a time.

**Admin login** – after login the JWT token is saved in `localStorage`. When `/admin` opens, `AdminPage` checks the token with `GET /api/auth/me`. If the server ever answers `401`, the dashboard logs out automatically.

**Live updates** – simple polling with `setInterval`: the tracking popup refreshes every 20 s, the admin dashboard every 15 s. The timers are cleared when the component closes.

**Styling** – Tailwind CSS. Brand colours (`ink`, `saffron`, `chili`, `cream`) and fonts (Playfair Display + Poppins) are set in `tailwind.config.js`. Reusable classes like `.btn-primary`, `.input` and `.card` are in `src/index.css`.

## Performance

- Admin code is split into its own file with `React.lazy`, so customers don't download it
- React and React Router are in a separate cached file (`manualChunks` in `vite.config.ts`)
- Menu photos use `loading="lazy"` and small 500px versions
- Fonts and the hero photo are preloaded in `index.html`
- Menu filtering happens in the browser (no extra API calls while typing)
- Skeleton cards show while the menu is loading, with a "Try again" button if it fails
