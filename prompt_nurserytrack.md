# NurseryTrack — AI Studio Technical Specification Prompt

---

## 1. Project Overview

You are an expert full-stack developer. Your task is to create a cross-platform mobile application called **"NurseryTrack"** for managing a plant nursery. The app is designed to allow nursery staff and owners to track plant inventory through a batch system, log actions like sales and transplanting, and generate business reports. The core feature is tracking *batches* (groups) of plants of the same variety, started at different times and grown in different containers.

---

## 2. User Roles

- **Administrator (Admin):**
  - Full access to all features.
  - Can view financial reports, manage users, and edit core business data (catalogs).
- **Worker (Працівник):**
  - Access to daily operational tasks: viewing inventory, adding new batches, logging actions (sales, transplanting).
  - *No* access to financial reports or user/catalog management.

---

## 3. Technology Stack

- **Frontend:** React Native
- **Backend/Database:** Firebase
  - Firestore (for real-time, offline-first database)
  - Firebase Authentication (for user management)
  - Firebase Storage (for batch photos)
- **Core Libraries:**
  - React Navigation (app routing)
  - QR code scanner/generator library
  - Charting library (for reports and analytics)

---

## 4. Data Model (Firestore Collections)

### `users`
- `uid`: string (from Firebase Auth)
- `email`: string
- `name`: string
- `role`: string (either 'admin' or 'worker')

### `varieties` (Довідник сортів)
- `varietyId`: string (auto-generated)
- `name`: string
- `latinName`: string (optional)
- `defaultPhotoUrl`: string (optional)

### `batches` (Основна колекція)
- `batchId`: string (auto-generated)
- `varietyId`: string (refers to `varieties`)
- `quantity`: number
- `status`: string ('укорінення', 'дорощування', 'на продаж', 'продано')
- `containerSize`: string (e.g., 'P9', 'C2', 'C5')
- `location`: string (e.g., 'Теплиця 1, ряд А')
- `price`: number (optional)
- `dateRooted`: timestamp (optional)
- `dateAdded`: timestamp
- `notes`: string (optional)
- `photos`: array of strings (URLs to Firebase Storage)
- `qrCodeValue`: string (unique value for QR, e.g., `batchId`)

### `actionLogs` (Історія дій)
- `logId`: string (auto-generated)
- `batchId`: string (refers to `batches`)
- `userId`: string (refers to `users`)
- `actionType`: string ('CREATE', 'SALE', 'TRANSPLANT', 'WRITE_OFF', 'UPDATE_INFO', 'ADD_PHOTO')
- `details`: object/map (e.g., `{ "quantity": 5, "price": 150 }`)
- `timestamp`: timestamp

---

## 5. Screens & Functionality

### **Login Screen**
- **Purpose:** User authentication
- **Functionality:** Email/password login (Firebase Auth), "Forgot Password" link

---

### **Bottom Navigation Bar**
- **Purpose:** Primary navigation (always visible)
- **Tabs:** Головна, Інвентар, [+] Додати, Звіти, Профіль
- **Special:** Central `[+]` opens a modal for quick actions

---

### 1. Головна панель (Dashboard)
- **Overview:** Displays stats (e.g., total plants, ready for sale) aggregated from `batches`
- **Recent Activity:** Shows latest entries from `actionLogs`
- **Access:** Both roles

---

### 2. Інвентар (Inventory) — 3-Level Navigation

#### Level 1: List of Varieties
- **Purpose:** Browse all plant types
- **Data:** Aggregate `quantity` across all `batches` for each variety
- **Features:** Search/filter; tap to Level 2

#### Level 2: List of Batches for Variety
- **Purpose:** View all batches for a selected variety
- **Data:** Query `batches` by `varietyId`
- **Features:** Tap to Level 3

#### Level 3: Batch Details
- **Purpose:** View/manage a specific batch
- **Data:** Single `batches` document + related `actionLogs`
- **Features:**
  - Display all batch details
  - Photo gallery
  - Action history
  - Action buttons: 'Sell', 'Transplant', etc. (creates `actionLogs` & updates `batches`)
  - QR code: Generate/display from `qrCodeValue`
  - Photo upload: Camera integration, store in Firebase Storage, update `photos` array
  - Edit batch details (Admin only)

---

### 3. [+] Add Action (Modal)
- **Purpose:** Quick entry for key workflows
- **Buttons:**
  - "Add New Batch" — form to create new `batches` doc
  - "Log Action" — open QR scanner, identify batch, log sale/transplant/etc.

---

### 4. Звіти (Reports)
- **Purpose:** Business intelligence
- **Data:** Query/process data from `actionLogs`, `batches`
- **Features:** Generate sales, inventory, write-off reports; filter by date; display charts/tables
- **Access:** Admin only for financial data

---

### 5. Профіль (Profile)
- **Purpose:** User settings/admin
- **Features:**
  - Display user info
  - Logout
  - (Admin only) User management (invite/edit/delete)
  - (Admin only) Catalog management (CRUD for `varieties`, containers, locations, etc.)

---

## 6. Non-Functional Requirements

- **UI/UX:** Modern, dark-themed, clean and intuitive interface
- **Offline Support:** Use Firestore's offline persistence; auto-sync when online
- **Performance:** Fast, responsive, especially QR scanning and data entry
- **Security:** Firestore security rules must enforce role-based permissions

---

*This prompt provides all the technical and functional requirements for generating the complete codebase for the "NurseryTrack" app in AI Studio or a similar AI-powered development environment.*