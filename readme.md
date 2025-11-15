# ReadArabic Frontend (React)

A minimal React application for reading PDF files from Google Cloud Storage.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

## Features

- Clean, minimal UI
- Browse PDFs from the sidebar
- Read PDFs with page navigation
- Responsive design
- Collapsible sidebar

## Backend Requirement

Make sure the Flask backend is running on `http://localhost:5000` before starting the frontend.

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.