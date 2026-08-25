# Panskura Banamali College - BCA Department Event Portal 🎓

A modern, mobile-first, single-page event registration & money collection web application built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Razorpay**, **Google Sheets API**, and **Nodemailer**.

---

## 🌟 Key Features

- **No Authentication Required:** Fast, zero-friction registration without sign-up/login barriers.
- **Dynamic Pricing Engine:**
  - **1st Semester Freshers:** Exactly **₹100**
  - **2nd to 8th Semester:** Exactly **₹250**
  - Pricing is strictly validated on the backend server (`/api/create-order`) to prevent tampering.
- **Instant Razorpay Checkout Overlay:** Secure checkout modal supporting UPI (GPay, PhonePe, Paytm), NetBanking, Debit/Credit Cards, and Wallets.
- **Automated Post-Payment Pipeline:**
  1. **6-Digit Unique ID:** Generates an official random 6-digit numeric pass ID.
  2. **Google Sheets Sync:** Appends attendee data with `[Timestamp, 6-Digit ID, Name, Email, Phone, Age, Semester, Amount Paid, Payment ID, Status]`.
  3. **Invitation Email:** Dispatches an HTML invitation letter / entry pass with attendee details, payment confirmation, and 6-digit ID badge.
- **Live Fund Tracker:** Real-time collection gauge showing total money collected and attendance count directly from the Google Sheet ledger.
- **Student Helpdesk & Support Form:** Embedded contact section at the footer that routes queries to the committee admin inbox.

---

## 📁 Project Architecture

```
bca-pbc-event/
├── .env.example               # Environment variable reference
├── .env.local                 # Local environment keys
├── lib/
│   ├── types.ts               # TypeScript interfaces & types
│   ├── utils.ts               # Pricing formula, 6-digit generator & styling helpers
│   ├── razorpay.ts            # Razorpay server instance
│   ├── googleSheets.ts        # Google Sheets API integration & fallback store
│   └── email.ts               # Nodemailer HTML invitation & support sender
├── app/
│   ├── api/
│   │   ├── create-order/      # Razorpay order generation & pricing validation
│   │   ├── verify-payment/    # Signature verification, ID creation, Sheet sync & Email
│   │   ├── tracker/           # Live collection statistics API
│   │   └── contact/           # Student inquiry contact API
│   ├── globals.css            # Tailwind CSS styling and theme setup
│   ├── layout.tsx             # Root layout with Toast notification provider
│   └── page.tsx               # Main Single-Page Application
└── components/
    ├── Navbar.tsx             # Responsive header with live badge
    ├── HeroSection.tsx        # Event hero with highlights & quick register CTA
    ├── LiveTracker.tsx        # Real-time collection and student counter
    ├── RegistrationForm.tsx   # Dynamic pricing form & Razorpay integration
    ├── TicketModal.tsx        # Interactive post-payment ticket pass & confetti
    ├── EventDetails.tsx       # Event schedule, competition rules & food menu
    ├── ContactSection.tsx     # Student helpdesk contact form
    └── Footer.tsx             # Department footer & copyright
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/maitijit89/PBC-BCA-Dep-Event-Portal.git
cd bca-pbc-event
npm install
```

### 2. Configure Environment Variables (`.env.local`)

Copy `.env.example` to `.env.local` and add your credentials:

```bash
cp .env.example .env.local
```

```env
# 1. RAZORPAY KEYS (From https://dashboard.razorpay.com)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_ID=rzp_test_xxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxx

# 2. GOOGLE SHEETS API
# Service Account Email from Google Cloud Console
GOOGLE_SERVICE_ACCOUNT_EMAIL=bca-event@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_from_url
GOOGLE_SHEET_NAME=Sheet1

# Target collection goal in INR for the live tracker
NEXT_PUBLIC_COLLECTION_GOAL=30000

# 3. NODEMAILER / EMAIL (Gmail App Password or SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_character_app_password
SMTP_FROM="BCA Event Committee - PBC" <noreply@panskurbanamalicollege.edu.in>
ADMIN_EMAIL=admin@pbc-bca.edu.in
```

### 3. Google Sheet Setup

1. Create a Google Spreadsheet titled **"BCA Event Registrations 2026"**.
2. Set row 1 column headers:
   `Timestamp | 6-Digit ID | Name | Email | Phone | Age | Semester | Amount Paid | Payment ID | Status`
3. Share the Google Spreadsheet with your Service Account email with **Editor** role.
4. Copy the Spreadsheet ID from the URL (`https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`) into `GOOGLE_SHEET_ID`.

### 4. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧪 Testing in Development

- **Mock Payment Mode:** If Razorpay credentials are not yet supplied, the system operates in test simulation mode to test the complete user flow without errors.
- **Fallback In-Memory Store:** If Google Sheets service account is not yet connected, registrations are safely preserved in-memory so you can test immediately.
