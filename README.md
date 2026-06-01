# PDF to Image Converter

A fast, lightweight web application that converts PDF files into high-quality images. Upload your PDFs, customize the output format and quality, and download all pages as an easy-to-manage ZIP file—all without uploading anything to a server.

## Features

- **Local Processing** – Everything runs in your browser. No file uploads, no server-side processing, completely private.
- **Multiple Formats** – Convert to PNG, JPG, or WebP depending on your needs.
- **Adjustable Quality** – Choose from 5 quality levels (50%, 75%, 100%, 150%, 200%) to balance file size and clarity.
- **Batch Download** – Export all converted images as a single ZIP file for convenience.
- **Page Management** – Remove specific pages before downloading if you don't need them all.
- **Responsive Design** – Works smoothly on desktop, tablet, and mobile devices.
- **No Registration** – Completely free, no accounts, no limits.

## Tech Stack

- **React 19** – Modern UI framework
- **Vite** – Fast build tool and dev server
- **Tailwind CSS** – Utility-first styling
- **pdf.js** – PDF rendering and conversion
- **jszip** – ZIP file generation
- **Lucide React** – Clean icon library

## Getting Started

### Prerequisites

Make sure you have Node.js (v18 or later) and npm installed.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PdfToImage
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## Usage

1. **Upload a PDF** – Drag and drop your PDF file or click to browse your computer (max 100MB).
2. **Configure Options** – Select your preferred image format and quality level.
3. **Convert** – Click the convert button. Processing happens instantly in your browser.
4. **Preview** – Scroll through the converted pages using the preview slider.
5. **Download** – Download all images as a ZIP file or individual pages.

## Available Scripts

- `npm run dev` – Start the development server with hot reload
- `npm run build` – Create an optimized production build
- `npm run preview` – Preview the production build locally
- `npm run lint` – Run ESLint to check code quality

## How It Works

The converter uses **pdf.js** to render each page of your PDF to a canvas, then converts the canvas to your chosen image format. The rendering scale can be increased for higher quality, resulting in sharper images at the cost of larger file sizes.

- **Low Quality (50%)** – Smallest file sizes, suitable for quick previews
- **Medium Quality (75%)** – Good balance between size and clarity
- **High Quality (100%)** – Standard 2x rendering, default choice
- **Very High (150%)** – Larger files, noticeably sharper
- **Ultra High (200%)** – Maximum quality, best for detailed documents

All processing happens client-side, so even massive PDFs are converted without uploading to any server. This keeps your files private and speeds up the process.

## Project Structure

```
src/
├── components/
│   ├── Convertor.jsx      # Main conversion logic
│   ├── HowItWorks.jsx     # Feature overview
│   ├── FAQs.jsx           # Common questions
│   ├── Navbar.jsx         # Navigation
│   └── Footer.jsx         # Footer section
├── utils/                 # Utility functions
├── assets/                # Images and icons
├── App.jsx                # Main app component
├── App.css                # App styles
└── main.jsx               # Entry point
```

## Browser Support

Works on all modern browsers that support:
- ES6+
- Canvas API
- FileReader API
- Blob API

## Performance Tips

- Keep PDF files under 100MB for best conversion speed
- Use PNG for lossless quality, JPG for smaller file sizes, WebP for the best compression
- Higher quality settings produce larger images but with better clarity
- Local processing means no waiting for server responses just instant conversion

## License

This project is open source and available under the MIT License.

## Contributing

Found a bug or have a feature idea? Feel free to open an issue or submit a pull request!
