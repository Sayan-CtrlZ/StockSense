# StockSense: Modular Inventory Management System

StockSense is an enterprise-grade, modular Inventory Management System (IMS) engineered to digitize, synchronize, and audit inventory operations across multi-facility warehouses, supply chain hubs, and retail fulfillment centers.

Built on an atomic double-entry stock ledger architecture, StockSense eliminates stock drift, prevents negative stock situations, and provides real-time visibility through role-tailored dashboards, status-driven workflows, and interactive Kanban boards.

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [Role-Based Access Control and Credentials](#role-based-access-control-and-credentials)
- [System Architecture and Ledger Engine](#system-architecture-and-ledger-engine)
- [Key Modules and Capabilities](#key-modules-and-capabilities)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Installation and Setup Guide](#installation-and-setup-guide)
- [REST API Specification](#rest-api-specification)
- [Security and Data Integrity](#security-and-data-integrity)

---

## Executive Summary

Modern warehouse operations frequently suffer from inventory discrepancy due to decoupled receiving, picking, transferring, and adjustment records. StockSense solves this fundamental problem through:

1. **Atomic Dual-Ledger Invariants**: Every physical stock change produces an immutable audit record in the `StockLedger` and synchronizes the product location balance within an atomic transaction.
2. **Role-Driven Dashboards**: Dedicated operational views for **Warehouse Staff** (execution queues, immediate picking/receipt tasks) and **Inventory Managers** (holistic KPIs, low-stock warnings, warehouse and sub-location configuration).
3. **Dual-View Operational Boards**: Toggle seamlessly between tabular data and visual Kanban boards across Inbound Receipts, Outbound Deliveries, and Move History.
4. **Hierarchical Warehouse Topology**: Full support for multiple warehouses with unlimited sub-locations (e.g., `WH/Stock1`, `WH/Production`, `WH/Output`).

---

## Role-Based Access Control and Credentials

StockSense enforces strict Role-Based Access Control (RBAC) across both the REST API middleware and frontend route guards.

### Pre-Configured Test Credentials

| Role | Login ID | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Inventory Manager** | `manager` | `manager@stocksense.com` | `Password123!` | Full administrative access: Settings, Warehouses, Locations, Operational validation, Analytics KPIs |
| **Warehouse Staff** | `staffuser` | `staff@stocksense.com` | `Password123!` | Operational access: Receipts, Deliveries, Internal Transfers, Move History, Stock View |

### Role Permissions Matrix

| Module / Route | Inventory Manager | Warehouse Staff | Description |
| :--- | :---: | :---: | :--- |
| **Dashboard** | Full Manager View | Staff Execution Board | Manager sees company-wide KPIs and inventory valuation; Staff sees active tasks and pending queues |
| **Receipts** (`/operations/receipts`) | Read / Write / Validate | Read / Write / Validate | Inbound supplier shipments, receiving confirmation |
| **Deliveries** (`/operations/deliveries`) | Read / Write / Validate | Read / Write / Validate | Outbound customer shipments, stock reservation and fulfillment |
| **Transfers** (`/operations/transfers`) | Read / Write / Validate | Read / Write / Validate | Inter-warehouse and intra-warehouse sub-location transfers |
| **Adjustments** (`/operations/adjustments`) | Read / Write / Validate | Read / Write | Physical count discrepancy reporting and reconciliation |
| **Move History** (`/move-history`) | Read / Audit | Read / Audit | Immutable real-time audit ledger of all product movements |
| **Stock by Location** (`/stock-view`) | Read / Filter | Read / Filter | Multi-warehouse stock balances, per-location breakdown |
| **Warehouses** (`/settings/warehouses`) | Full Access | Restricted (Hidden) | Create and configure facilities, codes, addresses |
| **Locations** (`/settings/locations`) | Full Access | Restricted (Hidden) | Create and manage warehouse sub-locations (racks/bays) |

### Role-Based Authentication Flow

The Authentication interface supports role-based switching:
- **Login**: A dedicated role selector toggles between **Manager** and **Staff**. Selecting **Manager** pre-fills the hardcoded administrative credentials (`manager` / `Password123!`). Selecting **Staff** provides instant demo access with `staffuser` or permits custom staff credentials.
- **Sign Up**: New users can self-select their role upon registration. Sign-up includes rigorous credential validation (6-12 character unique login ID, password complexity check, duplicate email prevention).

---

## System Architecture and Ledger Engine

StockSense operates on an atomic, double-entry inventory ledger model inspired by financial accounting. Physical stock is never modified without an associated balance transfer log.

```
       +-------------------------------------------------------+
       |                  INBOUND RECEIPT                      |
       |  Vendor Delivery (+100) -> Destination: WH/Stock1    |
       +---------------------------+---------------------------+
                                   |
                                   v
             [StockLedger: +100 units (Direction: IN)]
                                   |
                                   v
       +-------------------------------------------------------+
       |                 INTERNAL TRANSFER                     |
       |     Source: WH/Stock1  ->  Destination: WH/Stock2     |
       |  Balance Shifted: Total company stock unchanged (0)   |
       +---------------------------+---------------------------+
                                   |
                                   v
       +-------------------------------------------------------+
       |                OUTBOUND DELIVERY ORDER                |
       |       Source: WH/Stock2  ->  Customer (-30)           |
       |  Stock Deducted: Ledger record generated (-30, OUT)   |
       +---------------------------+---------------------------+
                                   |
                                   v
       +-------------------------------------------------------+
       |                PHYSICAL RECOUNT DISCREPANCY           |
       |   Adjustment Logged: Recount delta applied to audit   |
       +-------------------------------------------------------+
```

### Invariant Rules Enforced:
1. **Receipt Validation**: Increases destination location stock and logs positive quantity delta to the ledger.
2. **Delivery Validation**: Asserts sufficient stock availability across location batches prior to decrementing balance. Prevents negative stock.
3. **Internal Transfer**: Relocates stock between locations without inflating global warehouse totals.
4. **Physical Adjustment**: Reconciles theoretical count against verified shelf count, recording discrepancies for loss prevention audits.

---

## Key Modules and Capabilities

### 1. Operations and Kanban Boards
- **Receipts**: Track vendor deliveries through `Draft -> Waiting -> Ready -> Done -> Canceled`. Includes dedicated Kanban view with automated column grouping.
- **Deliveries**: Fulfill outgoing customer orders with real-time reservation and validation. Kanban board categorizes orders by workflow stage.
- **Move History**: Complete historical ledger displaying all inbound, outbound, transfer, and adjustment operations. Features both a responsive data table and a 4-column direction Kanban board (`IN`, `OUT`, `INTERNAL`, `ADJUSTMENT`).

### 2. Stock and Hierarchy Management
- **Stock by Location**: Visualizes on-hand quantities, incoming stock, and safety thresholds aggregated across individual warehouses and sub-locations.
- **Decoupled Settings**:
  - `/settings/warehouses`: Manage main storage sites (code, physical address, active status).
  - `/settings/locations`: Create and organize bins, shelves, and racks linked to their parent warehouse.

### 3. Password Recovery Flow
- **OTP-Based Self-Service Reset**: Fully implemented 6-digit OTP delivery system with cryptographic expiration tokens and automated password reset validation.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with modern React Hooks and state management
- **Build Tool**: Vite (blazing fast HMR and optimized production bundles)
- **Styling**: Tailored Material Design System (Pure Vanilla CSS, high-contrast Material White Theme, zero external UI framework bloat)
- **Icons**: Lucide React
- **HTTP Client**: Axios with centralized interceptors, Bearer token injection, and response unwrapping

### Backend
- **Runtime**: Node.js (v18+ / v20+)
- **Framework**: Express.js
- **Database Engine**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt password hashing (salt rounds: 12)
- **Architecture**: Controller-Service-Repository pattern with asynchronous error wrappers

---

## Repository Structure

```
StockSense/
├── backend/                       # REST API Server
│   ├── config/                    # Database connection setup
│   ├── controllers/               # Route business logic
│   │   ├── authController.js      # Auth, login, signup, OTP reset
│   │   ├── receiptController.js   # Receipts list, kanban, validation
│   │   ├── deliveryController.js  # Deliveries list, kanban, validation
│   │   ├── transferController.js  # Inter-warehouse stock transfers
│   │   ├── adjustmentController.js# Physical count discrepancy adjustments
│   │   ├── ledgerController.js    # Move history and audit ledger
│   │   ├── inventoryController.js # Warehouses, locations, stock summaries
│   │   ├── productController.js   # Products and inventory items
│   │   └── dashboardController.js # Real-time role-based KPIs
│   ├── middleware/                # JWT guard and error handling
│   ├── routes/                    # Express route declarations
│   ├── utils/                     # Cryptographic tokens, OTP generator
│   ├── server.js                  # Entry point
│   └── package.json
│
├── database/                      # MongoDB Data Layer
│   ├── models/                    # Mongoose Data Schemas
│   │   ├── User.js                # Users and roles (manager/staff)
│   │   ├── Product.js             # Product catalog & stock
│   │   ├── Warehouse.js           # Warehouses and locations
│   │   ├── Receipt.js             # Inbound purchase orders
│   │   ├── DeliveryOrder.js       # Customer shipments
│   │   ├── InternalTransfer.js    # Location shifts
│   │   ├── StockAdjustment.js     # Inventory adjustments
│   │   ├── StockLedger.js         # Immutable audit records
│   │   └── Otp.js                 # Temporary OTP tokens
│   ├── seeds/                     # Database seeding engine
│   │   └── seed.js                # Initial mock dataset
│   └── services/                  # Transaction and stock balance services
│       └── stockService.js
│
├── frontend/                      # Single Page Application
│   ├── src/
│   │   ├── components/            # Reusable UI components (Navbar, Modal)
│   │   ├── pages/                 # Route page components
│   │   │   ├── AuthPage.jsx       # Role-based login and signup
│   │   │   ├── Dashboard.jsx      # Role-tailored dashboards
│   │   │   ├── Receipts.jsx       # Inbound operations & Kanban
│   │   │   ├── Deliveries.jsx     # Outbound fulfillment & Kanban
│   │   │   ├── MoveHistory.jsx    # Audit trail table & Kanban
│   │   │   ├── Transfers.jsx      # Internal stock transfers
│   │   │   ├── Adjustments.jsx    # Cycle counts and corrections
│   │   │   ├── StockView.jsx      # Location-based stock levels
│   │   │   ├── Warehouses.jsx     # Warehouse configurations
│   │   │   └── Locations.jsx      # Location configurations
│   │   ├── services/              # API clients and response handlers
│   │   ├── styles.css             # Unified Material White Design System
│   │   ├── App.jsx                # Router, auth provider, role guards
│   │   └── main.jsx               # React DOM entry point
│   └── vite.config.js
│
├── package.json                   # Root workspace orchestration
└── README.md                      # Comprehensive project documentation
```

---

## Installation and Setup Guide

### Prerequisites
- Node.js (v18.x or v20.x recommended)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or a cloud MongoDB Atlas URI
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Sayan-CtrlZ/StockSense.git
cd StockSense
```

### 2. Install Dependencies
Run npm install across the workspaces:
```bash
# Install root orchestration packages
npm install

# Install backend dependencies
npm --prefix backend install

# Install database dependencies
npm --prefix database install

# Install frontend dependencies
npm --prefix frontend install
```

### 3. Initialize and Seed the Database
Populate MongoDB with default warehouses, products, operational orders, and the pre-configured accounts:
```bash
npm run database:seed
```

### 4. Start the Application
You can run backend and frontend concurrently in development mode:

**Terminal 1 (Backend Server):**
```bash
npm run backend:dev
# Server will run at http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm --prefix frontend run dev
# Frontend will be live at http://localhost:5173
```

---

## REST API Specification

### Authentication (`/api/auth`)
| HTTP Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | Authenticate user using `loginId`/`email` and `password`. Returns JWT token. |
| `POST` | `/api/auth/signup` | Public | Register new user with designated role (`inventory_manager` or `warehouse_staff`). |
| `POST` | `/api/auth/logout` | Protected | Invalidate session cookies. |
| `GET` | `/api/auth/me` | Protected | Retrieve profile details of authenticated user. |
| `POST` | `/api/auth/forgot-password` | Public | Generate and dispatch 6-digit OTP to user email. |
| `POST` | `/api/auth/verify-otp` | Public | Validate OTP and return short-lived password reset token. |
| `POST` | `/api/auth/reset-password` | Public | Update password using verified reset token. |

### Operations and Stock Management
| Module | Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **Receipts** | `GET` | `/api/receipts` | Retrieve receipts with filter, search, and `view=kanban` support. |
| | `POST` | `/api/receipts` | Create an inbound purchase receipt. |
| | `POST` | `/api/receipts/:id/validate` | Validate receipt, increase location stock, and append to audit ledger. |
| **Deliveries** | `GET` | `/api/deliveries` | Retrieve delivery orders with search and `view=kanban` support. |
| | `POST` | `/api/deliveries` | Create an outbound customer delivery order. |
| | `POST` | `/api/deliveries/:id/validate` | Validate delivery, deduct stock, and append to audit ledger. |
| **Transfers** | `GET` | `/api/transfers` | List internal stock movements. |
| | `POST` | `/api/transfers` | Create transfer request between warehouse locations. |
| | `POST` | `/api/transfers/:id/validate` | Execute transfer, shift location balances, and record ledger entry. |
| **Adjustments**| `GET` | `/api/adjustments` | Retrieve physical cycle count adjustment records. |
| | `POST` | `/api/adjustments` | Submit discrepancy count with audit justification. |
| | `POST` | `/api/adjustments/:id/validate` | Reconcile system balance against physical count. |
| **Ledger** | `GET` | `/api/ledger` | Retrieve audit records with filtering and `view=kanban` direction grouping. |
| **Products** | `GET` | `/api/products` | Retrieve catalog with SKU, category, and threshold indicators. |
| **Warehouses** | `GET` | `/api/inventory/warehouses` | Retrieve all registered warehouses and nested sub-locations. |
| | `POST` | `/api/inventory/warehouses` | Register new storage facility (Manager role required). |
| **Locations** | `POST` | `/api/inventory/warehouses/:id/locations` | Register new sub-location within warehouse (Manager role required). |
| **Dashboard** | `GET` | `/api/dashboard/kpis` | Aggregate metrics, pending receipts/deliveries, and low-stock indicators. |

---

## Security and Data Integrity

- **Cryptographic Hashing**: All passwords hashed using `bcryptjs` with 12 salt rounds before storage. Plaintext passwords are never saved or returned.
- **Stateless Authorization**: Protected routes enforce JSON Web Tokens (`Bearer <token>`) validated via auth middleware.
- **Cross-Site Scripting (XSS) and Injection Defense**: Input normalization and query parameter sanitization prevent NoSQL injection vectors.
- **Concurrent Operations Safety**: Stock validation services execute synchronous checks to avoid race conditions during concurrent order processing.