# Postman collection

File:
- `backend/postman/MediStore.postman_collection.json`

## Import
1. Open Postman
2. Import -> select the JSON file above

## Variables
The collection defines these variables:
- `baseUrl` (default `http://localhost:5000`)
- `customerToken`, `sellerToken`, `adminToken`
- `medicineId`, `categoryId`, `orderId`

## Recommended flow
1. Run backend: `cd backend && npm run dev`
2. Create admin: `npm run seed:admin` then login in Postman and set `adminToken`
3. Auth -> Register (customer)
4. Auth -> Register (seller)
5. Categories -> POST /api/v1/categories (admin) (auto-sets `categoryId`)
6. Medicines -> POST /api/v1/medicines (seller) (auto-sets `medicineId`)
7. Cart (customer)
8. Orders (customer)
9. Orders (seller)
10. Reviews

Notes:
- Reviews creation requires the order status to be `DELIVERED`. Use admin endpoint to set an order to `DELIVERED` before posting a review.
- Admin endpoints require an admin token (admin cannot self-register per spec). Add your admin token to `adminToken`.

## Create an admin user
Run:
```bash
cd backend
npm run seed:admin
```

This creates (or updates) an admin using these env vars (defaults shown):
- `ADMIN_EMAIL=admin@medistore.local`
- `ADMIN_PASSWORD=admin1234`
- `ADMIN_NAME=Admin`

Then login using `POST /api/v1/auth/login` with that email/password and paste the returned token into Postman variable `adminToken`.
