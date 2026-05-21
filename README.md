# Aerosphere - Airport Management Database System

Aerosphere is an industry-level, fully synchronized, responsive **Airport Management Database System** featuring a real-time React administration client, modular MVC Node.js/Express backend server, and standard normalized MySQL database engine.

The system features a **configuration-driven schema architecture**. Adding columns, forms, validations, or lookup dropdown relationships only requires changing a central JS schema dictionary (`moduleConfigs.js`) and updating the database tables.

---

## 🚀 System Architecture

```
                  ┌───────────────────────────────────────────────┐
                  │              React Frontend Admin             │
                  │   - Configuration-driven Forms & Tables      │
                  │   - Real-time Sync Socket.io Client listener  │
                  └───────────────────────┬───────────────────────┘
                                          │
                        REST HTTP API     │   Socket.io
                        & JWT Headers     │   Broadcasts
                                          │
                  ┌───────────────────────▼───────────────────────┐
                  │         Node.js & Express MVC Server          │
                  │   - Dynamic REST Controllers / CRUD Router    │
                  │   - JWT Gateways & Action Logger              │
                  └───────────────────────┬───────────────────────┘
                                          │
                         Sequelize ORM    │
                         Queries          │
                                          │
                  ┌───────────────────────▼───────────────────────┐
                  │                 MySQL Engine                  │
                  │   - 6 Normalized Relational Tables            │
                  │   - Triggers, Procedures, and Active Views    │
                  └───────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack & Dependencies

### Frontend
- **Framework**: React.js (Vite compiler)
- **Styling**: Tailwind CSS (custom visual scrollbars and elegant borders)
- **Routing**: React Router DOM (protected pages, admin vs. staff boundaries)
- **API Client**: Axios (configured with interceptors to auto-attach authorization token)
- **Real-Time Client**: Socket.io-client
- **Visual Charts**: Chart.js & React-Chartjs-2
- **Icons**: Lucide React

### Backend
- **Framework**: Node.js & Express.js
- **Database Connector**: Sequelize ORM & MySQL2 client
- **Authentication**: JSON Web Tokens (JWT) & BcryptJS (password hashing)
- **Real-Time Engine**: Socket.io server
- **Environment config**: Dotenv

### Database System (MySQL)
- 6 highly normalized relational tables: `Users`, `Passengers`, `Flights`, `Tickets`, `Staff`, and `Airports`.
- Relational integrity constraints, foreign key mappings, and cascading updates/deletes.
- Stored Procedures, Triggers, Views, and Audit logs.

---

## 🗃️ Database & DBMS Features Implemented

Aerosphere leverages advanced relational database concepts:

### 1. Database Views
- **`vw_booking_details`**: Merges Ticket, Passenger, and Flight specifications to supply a clean table read for administrators.
- **`vw_flight_occupancy`**: Aggregates booking statistics, calculating load factors and financial returns generated per flight number. Used extensively in the stats dashboard.

### 2. Stored Procedures
- **`sp_get_passenger_bookings(in_passenger_id)`**: Retrieves booking history and active itinerary states for a passenger ID.
- **`sp_get_flight_revenue()`**: Triggers ranking of flights based on aggregate tickets price sums.

### 3. Database Triggers (Audit & Automation)
- **`before_ticket_insert`**: Automates input cleaning. Validates and auto-uppercases seat indices (e.g. `12a` ➔ `12A`) and sets the booking date to today if omitted.
- **`after_ticket_insert`**: Automatically writes transactions logging statements directly into the `audit_logs` table.
- **`after_ticket_delete`**: Logs cancellations, capturing refunds or seat releases inside the audit trail.

---

## 📁 Folder Structure

```
airport-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # Sequelize connection config
│   ├── controllers/
│   │   ├── authController.js     # JWT register & login handler
│   │   ├── crudController.js     # Generic controller (pagination, filters, search)
│   │   └── dashboardController.js # Handles views, stats & procedures triggers
│   ├── middleware/
│   │   └── authMiddleware.js     # JWT validator and Admin gatekeeper
│   ├── models/
│   │   ├── Airport.js            # Airport schema model
│   │   ├── Flight.js             # Flight schema model
│   │   ├── Passenger.js          # Passenger schema model
│   │   ├── Staff.js              # Staff schema model
│   │   ├── Ticket.js             # Ticket schema model
│   │   ├── User.js               # User accounts authentication model
│   │   └── index.js              # Foreign Key relationship mappings
│   ├── routes/
│   │   ├── apiRoutes.js          # REST routes & DBMS procedure triggers
│   │   └── authRoutes.js         # Register, Login & user profile endpoints
│   ├── scripts/
│   │   └── init-db.js            # Creates schema tables, views, triggers & seed
│   ├── .env                      # Connection properties config variables
│   ├── package.json              # Backend script entrypoints
│   └── server.js                 # Socket.io Express listener
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── DynamicForm.jsx   # Generates visual inputs from schema configs
    │   │   ├── DynamicTable.jsx  # Multi-search, exports data, pagination table
    │   │   ├── Layout.jsx        # Wraps sidebar & sockets update indicators
    │   │   └── Sidebar.jsx       # Dark-theme sidebar, connections state badge
    │   ├── config/
    │   │   └── moduleConfigs.js  # CENTRAL CONFIGURATION SCHEMA
    │   ├── context/
    │   │   ├── AuthContext.jsx   # Persistence token sessions provider
    │   │   ├── SocketContext.jsx # Hooks real-time web-socket listeners
    │   │   └── ThemeContext.jsx  # Toggles standard Light/Dark visual elements
    │   ├── pages/
    │   │   ├── Dashboard.jsx     # Financial lines & Seat occupancy visual boards
    │   │   ├── Login.jsx         # Sign in
    │   │   ├── ModuleManager.jsx # General manager wrapper linking CRUD actions
    │   │   └── Register.jsx      # System admin accounts creation
    │   ├── utils/
    │   │   ├── api.js            # Axios JWT headers attach interface
    │   │   └── exportUtils.js    # Direct table downloads and printable pages
    │   ├── App.jsx               # Protected routes path guard
    │   ├── index.css             # Base CSS and scrollbars styling layers
    │   └── main.jsx              # App node root renderer
```

---

## 🛠️ Step-by-Step Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MySQL Server](https://dev.mysql.com/downloads/installer/) running locally or accessible on your network.

### Step 1: Database Credentials Configuration
1. Open your MySQL client (e.g. Workbench, phpMyAdmin, or CLI) and ensure it is active.
2. In the `backend/.env` file, verify the configuration:
   ```env
   PORT=5000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASS=your_mysql_password_here
   DB_NAME=airport_management
   JWT_SECRET=airport_management_jwt_secret_key_123456
   NODE_ENV=development
   ```

### Step 2: Initialize Database & Seed Dummy Data
Open a terminal in the `backend/` folder and run the migration setup script. This script automatically:
- Creates the `airport_management` database.
- Registers relational models.
- Creates SQL triggers, procedures, and views.
- Seeds admin profiles, flights, passengers, and staff records.

```bash
cd backend
npm install
npm run db:init
```

### Step 3: Launch the Backend API & Socket Server
Start the Express server on port 5000:
```bash
npm run dev
```

### Step 4: Run the React Frontend Application
Open a new terminal window in the `frontend/` folder, install packages, and launch Vite's dev server:
```bash
cd frontend
npm install
npm run dev
```

The system dashboard will now be fully operational!
- Access: **`http://localhost:5173`** (or standard Vite active port)
- Administrative Demo Credentials:
  - Username: **`admin`**
  - Password: **`admin123`**

---

## 🔄 Dynamic Synchronization Demonstration
To verify system flexibility and active synchronization:
1. **Dynamic Update Verification**: Open two separate browser tabs at the dashboard. Go to Passengers in Tab 1, and add a passenger. The sync badge will blink, and Tab 2 will instantly reflect the new record via Socket.io without refreshing!
2. **Schema Modification Test**: Want to add a new column like `meal_preference` inside Passengers?
   - Open `backend/models/Passenger.js` and add `meal_preference: { type: DataTypes.STRING }`.
   - Open `frontend/src/config/moduleConfigs.js` and add:
     ```javascript
     {
       name: 'meal_preference',
       label: 'Meal Preference',
       type: 'select',
       options: ['None', 'Vegetarian', 'Vegan', 'Halal', 'Kosher'],
       showInTable: true,
       showInForm: true
     }
     ```
   - Re-run `npm run db:init` (or run an alter migration query).
   - Done! Both the frontend form inputs, selection options, tables, search index, and controllers dynamically process this new field automatically without rewriting components!

# airportproject
#   a i r p o r t p r o j e c t  
 