# CreativeNode Studio - Digital Branding Solution

CreativeNode Studio is a professional digital branding and poster design platform. Built with modern web technologies, it features an interactive 3D environment, a powerful CRM for managing design leads, and seamless cloud integration for asset management.

## 🚀 Features

- **Interactive 3D Loading Experience**: A stunning, hardware-accelerated 3D loading screen built with React Three Fiber, featuring dynamic vector paths and lighting that simulates an Illustrator workspace.
- **Digital Asset Management**: Upload and manage poster designs and branding assets directly to Amazon S3 via `multer-s3`.
- **CRM & Lead Management**: A built-in CRM panel for tracking client leads, custom posters, and website inquiries.
- **AI-Powered Inspiration**: Integration with Google Gemini AI to generate daily modernist and brutalist poster design trends and creative briefs.
- **Robust Backend**: Powered by an Express.js server, securely storing system audit logs, CRM data, and custom poster configurations in Neon PostgreSQL.
- **Fluid UI Animations**: Smooth component transitions and overlay animations handled by Framer Motion.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Framer Motion
- **3D Graphics**: Three.js, `@react-three/fiber`, `@react-three/drei`
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (hosted on Neon)
- **Cloud Storage**: Amazon S3 (for image and asset uploads)
- **AI Integration**: Google Gemini API `@google/genai`

## ⚙️ Quick Start

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL Database (Neon DB)
- AWS Account (for S3 Buckets)
- Gemini API Key

### 1. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/puspharajm/creativenode-new.git
cd creativenode-new
npm install
```

### 2. Environment Configuration
Create a `.env` file in the root of your project and configure the following variables:
```env
NEON_URL=postgresql://user:password@host/db?sslmode=require
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=ap-south-1
S3_BUCKET_NAME=your-bucket-name
AWS_S3_ACCESS_POINT_ALIAS=your-s3-alias (Optional)
PORT=3000
GEMINI_API_KEY=your-gemini-api-key
```

### 3. Running the App
Start the development server (which concurrently runs the Vite frontend and Express backend):
```bash
npm run dev
```

Your app will be live at `http://localhost:5173` (Frontend) and the API will be served on `http://localhost:3000` (Backend).

## 🗄️ Database Initialization
The Express server automatically initializes the necessary PostgreSQL tables (`uploaded_files`, `users`, `creativenode_leads`, `custom_posters`, and `system_audit_logs`) upon startup if they don't exist.

## 📄 License
This project is for private use by CreativeNode Studio.
