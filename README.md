# 🏷️ BidSwift

### A Real-Time Online Auction & Bidding Platform

BidSwift is a full-stack web application that provides a secure and real-time platform for conducting online auctions. The system supports multiple user roles, item management, auction management, real-time bidding, wallet handling, order processing, billing, and administrative management.

The project was developed as a college full-stack application with a focus on backend architecture, concurrency handling, security, real-time communication, caching, and scalable request handling.

---

## ✨ Features

### 👤 User & Authentication

- User registration and login
- JWT-based authentication
- Password hashing using bcrypt
- Role-based authorization
- Protected API routes
- Multiple user roles:
  - Buyer
  - Seller
  - Auctioneer
  - Admin
- Profile management
- Password change functionality

### 🛍️ Item Management

#### Sellers

- Create items
- Upload multiple item images
- Cloudinary image storage
- Edit and delete items
- View personal listings
- Search items by name
- Filter items by category

#### Administrators

- View all items
- Search items by name
- Filter items by category
- Filter items by status
- Edit and delete items

### 🔨 Auction Management

- Create and schedule auctions
- Configure starting price and bid increments
- Set auction start and end times
- Auction status management
- Auctioneer-specific auction management
- Admin auction management
- Auction search and category filtering
- Auction details page

Supported auction states:

```text
Scheduled
Active
Completed
Cancelled
```

### 💰 Real-Time Bidding

BidSwift provides real-time auction bidding with:

- Minimum bid validation
- Bid increment validation
- Highest-bid tracking
- Bidder validation
- Self-bid restrictions
- Concurrent bid handling
- Transaction-based database operations
- Wallet balance reservation
- Outbid amount release
- Winner settlement
- Anti-sniping auction extension
- Real-time bid updates

### 💳 Wallet System

Buyers have an integrated wallet system that supports:

- Wallet creation
- Deposits
- Balance tracking
- Frozen funds
- Transaction history
- Bid amount reservation
- Automatic release of funds when outbid
- Winner payment settlement

### 📦 Orders & Bills

After an auction is completed:

1. The highest bidder is identified.
2. The required wallet amount is settled.
3. An order is created.
4. The seller can confirm the order.
5. A bill is generated.
6. The item is marked as sold.

The system also handles order confirmation expiry.

### ⚡ Redis Integration

Redis is used for performance and concurrency-related functionality.

Current uses include:

- Auction caching
- Cache invalidation
- Distributed coordination
- Auction-related locking/concurrency support
- Redis-backed Socket.IO communication

### 🔄 Real-Time Communication

BidSwift uses Socket.IO to provide live auction updates.

Real-time events include:

- New bid updates
- Auction status changes
- Auction information updates
- Anti-sniping time extensions

Socket.IO is configured with the Redis adapter so that real-time events can be synchronized across multiple backend instances.

### 🌐 Nginx

Nginx is used as a reverse proxy and load balancer.

The project supports multiple backend instances:

```text
                    ┌───────────────┐
                    │    Nginx      │
                    │ Reverse Proxy │
                    └───────┬───────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
          ┌──────▼──────┐       ┌──────▼──────┐
          │ Backend     │       │ Backend     │
          │ Instance 1  │       │ Instance 2  │
          │ :3000       │       │ :3001       │
          └──────┬──────┘       └──────┬──────┘
                 │                     │
                 └──────────┬──────────┘
                            │
                     ┌──────▼──────┐
                     │   MongoDB   │
                     │    Atlas    │
                     └─────────────┘
```

Nginx also provides API request rate limiting.

---

## 🏗️ Technology Stack

| Area | Technology |
|---|---|
| Frontend | React.js, HTML, CSS, JavaScript |
| Routing | React Router |
| Real-time Client | Socket.IO Client |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcrypt |
| Cache / Coordination | Redis |
| Real-time Communication | Socket.IO |
| Reverse Proxy | Nginx |
| Image Upload | Multer |
| Image Storage | Cloudinary |
| API Testing | Postman |
| Package Manager | npm |

The project uses **ES Modules (ESM)** throughout the JavaScript codebase.

---

## 🧩 System Architecture

```text
                         ┌─────────────────────┐
                         │      React.js       │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │
                              HTTP / WebSocket
                                    │
                         ┌──────────▼──────────┐
                         │       Nginx         │
                         │ Reverse Proxy /     │
                         │ Load Balancer       │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         │                     │
                  ┌──────▼──────┐      ┌──────▼──────┐
                  │ Node/Express│      │ Node/Express│
                  │ Backend     │      │ Backend     │
                  │ :3000       │      │ :3001       │
                  └──────┬──────┘      └──────┬──────┘
                         │                     │
              ┌──────────┼─────────────────────┤
              │          │                     │
       ┌──────▼─────┐ ┌──▼────────┐    ┌──────▼──────┐
       │ MongoDB    │ │   Redis   │    │ Cloudinary  │
       │ Atlas      │ │           │    │             │
       └────────────┘ └───────────┘    └─────────────┘
```

---

## 👥 User Roles

### Buyer

- Browse auctions
- Search auctions
- Filter auctions by category
- View auction details
- Place bids
- Manage wallet
- View bids
- View orders
- View bills
- Manage profile

### Seller

- Create items
- Upload item images
- Manage items
- Search and filter personal items
- Create auctions
- Manage orders
- Confirm orders
- Manage profile

### Auctioneer

- View assigned auctions
- Search auctions
- Filter auctions by category
- Manage auction lifecycle
- Monitor live auctions

### Admin

- Manage users
- Manage items
- Manage auctions
- Manage orders
- Manage bills
- View dashboard
- Search and filter items
- Search and filter auctions
- Filter items and auctions by status

---

## 📁 Project Structure

```text
BidSwift/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
│
├── docs/
│   └── BidSwift.postman_collection.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- Node.js
- npm
- MongoDB Atlas account
- Redis
- Nginx
- Git

### ⚙️ Backend Setup

Navigate to the backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

REDIS_URL=redis://localhost:6379

ORDER_CONFIRMATION_EXPIRY_HOURS=24

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Start the backend:

```bash
npm run dev
```

### 💻 Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🔐 Environment Variables

Never commit sensitive environment variables to GitHub.

The following should remain private:

```text
MongoDB credentials
JWT secrets
Cloudinary credentials
Redis credentials
API keys
```

Use `.env` files locally and include `.env` in `.gitignore`.

A safe example can be provided as:

```text
.env.example
```

without real credentials.

---

## 🧪 API Testing

The backend API was tested using Postman.

The Postman collection covers major application flows including:

- Authentication
- User management
- Items
- Auctions
- Bidding
- Wallet operations
- Orders
- Bills
- Administrative operations

The collection can be stored at:

```text
docs/BidSwift.postman_collection.json
```

---

## 🔄 Main Auction Flow

```text
Seller
   │
   ▼
Create Item
   │
   ▼
Create Auction
   │
   ▼
Auction Scheduled
   │
   ▼
Auction Active
   │
   ▼
Buyers Place Bids
   │
   ├───────────────┐
   │               │
   ▼               ▼
Wallet          Real-Time
Reservation     Bid Updates
   │               │
   └───────┬───────┘
           ▼
      Auction Ends
           │
           ▼
     Highest Bidder
           │
           ▼
    Winner Settlement
           │
           ▼
        Order
           │
           ▼
   Seller Confirmation
           │
           ▼
         Bill
           │
           ▼
      Item → Sold
```

---

## 🔒 Security Features

BidSwift implements several security mechanisms:

- JWT authentication
- Role-based authorization
- Password hashing with bcrypt
- Protected API endpoints
- Server-side user identity extraction
- Input validation
- Duplicate email handling
- Bid validation
- Wallet balance validation
- Concurrent bid protection
- API rate limiting
- Nginx reverse proxy
- Redis-based coordination
- Environment variable protection

---

## ⚡ Concurrency Handling

One of the important aspects of BidSwift is handling multiple users attempting to bid simultaneously.

The system uses database transactions and concurrency handling to ensure that:

- Invalid bids are rejected.
- Wallet balances remain consistent.
- Multiple bids do not incorrectly overwrite each other.
- The highest bid is correctly maintained.
- Outbid users receive their reserved funds back.
- The winning bidder's funds are correctly settled.

---

## 📡 Real-Time Auction Updates

When a new bid is placed, connected clients receive real-time updates through Socket.IO.

```text
Buyer A places bid
       │
       ▼
Backend
       │
       ├── Update MongoDB
       │
       ├── Update Redis
       │
       ▼
Socket.IO
       │
       ▼
Auction Room
       │
       ├── Buyer A
       ├── Buyer B
       └── Buyer C
```

This allows users to see auction changes without manually refreshing the page.

---

## 🛡️ Rate Limiting

Nginx is configured to limit excessive API requests.

This provides an additional layer of protection against:

- Excessive API requests
- Accidental request flooding
- Basic abuse scenarios

---

## 📸 Image Uploads

Item images follow this flow:

```text
React
  ↓
Multer
  ↓
Node/Express
  ↓
Cloudinary
  ↓
Image URL
  ↓
MongoDB
```

The database stores image URLs rather than the actual image files.

---

## 🎓 Project Purpose

BidSwift was developed as a college full-stack project to demonstrate practical implementation of:

- Full-stack web development
- REST APIs
- Authentication and authorization
- Database design
- Transactions
- Concurrency control
- Redis caching
- Real-time communication
- Reverse proxy and load balancing
- API rate limiting
- Cloud image storage
- Role-based application design

---

## 👨‍💻 Development

The project was developed collaboratively using Git and GitHub.

The application is intended primarily as an academic project and demonstration of full-stack development concepts.

---

## 📜 License

This project was created for academic and educational purposes.
