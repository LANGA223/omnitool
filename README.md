# 🛠️ OmniTool — Privacy-First In-Browser Utility Hub

> **A free, open-source utility toolbox where 100% of operations run locally in your browser memory via JavaScript, HTML5 Canvas, and the Web Crypto API. Zero server uploads, zero logins, zero tracking.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Privacy: 100% Client-Side](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald.svg)](https://github.com/LANGA223/omnitool)
[![Offline Ready](https://img.shields.io/badge/Offline-Ready-blue.svg)](https://github.com/LANGA223/omnitool)
[![Built With: React & Vite](https://img.shields.io/badge/Stack-React%20%7C%20Tailwind%20%7C%20Vite-purple.svg)](https://vitejs.dev)

---

## 🛡️ Why OmniTool?

Most online converters and utility sites force you to upload sensitive contracts, tax documents, private family photos, and confidential API payloads to remote cloud servers. Many of these sites retain files, inject intrusive ads, or gate basic features behind paywalls.

**OmniTool changes that:**
- **0 Bytes Sent to Remote Servers:** Every single operation takes place directly on your CPU/GPU using native browser APIs.
- **Offline Capable:** Works seamlessly even when disconnected from Wi-Fi or in airplane mode.
- **No Sign-Up or Authentication:** Instant access to every utility with zero friction.
- **Inspectable & Trustless:** You can open your browser's Developer Tools Network tab at any time to verify that zero outgoing requests are made.

---

## 🧰 Included Utilities

| Category | Utility | Description | Tech Used |
| :--- | :--- | :--- | :--- |
| **Media** | 🖼️ **Background Remover** | Chroma-key color isolation, magic wand, and eraser brush to cut out backgrounds into transparent PNGs. | HTML5 Canvas API |
| **Media** | 🗜️ **Image Compressor** | Shrink JPG, PNG, and WebP files with interactive quality and resolution sliders and instant preview. | Canvas `toBlob` |
| **Media** | 📱 **Vector QR Code Generator** | High-res PNG and vector SVG QR code creation with custom colors and error correction. | `qrcode` |
| **Documents** | 📄 **Local PDF Merger** | Merge multiple sensitive PDFs, reorder documents, and inspect page counts without server uploads. | `pdf-lib` |
| **Security** | 🧼 **EXIF & Photo Sanitizer** | Strip hidden GPS coordinates, camera serial numbers, and timestamps before posting photos online. | Canvas Re-encoding |
| **Security** | 🔐 **Cryptographic Passwords** | Cryptographically secure passwords and memorable passphrases with entropy calculation. | `window.crypto` |
| **Security** | 🛡️ **File & Text Checksums** | Compute SHA-256, SHA-512, SHA-1, and MD5 hashes with automated checksum match validation. | Web Crypto API |
| **Developer** | 🔄 **JSON ↔ CSV Converter** | Client-side bidirectional parser with nested object flattening and interactive table preview. | Local Memory Parser |
| **Developer** | 🎨 **SVG Optimizer** | Strip editor namespaces (Illustrator, Inkscape, Figma), clean metadata, and minify SVG markup. | Regex AST Cleaner |
| **Developer** | 🔤 **Text & Typography Tools** | Live character/word counts, case converters (camelCase, snake_case), Base64, and line sorting. | String Utilities |
| **Finance** | 💰 **Freelance & Payout Fee Calc** | Reverse calculator for Stripe, PayPal, and Upwork to calculate exact invoice amounts needed. | Reverse Fee Math |

---

## 🔍 How to Verify Privacy (The DevTools Test)

You don't have to take our word for it. Test it yourself:

1. Open **OmniTool** in Chrome, Firefox, Safari, or Edge.
2. Press <kbd>F12</kbd> (or <kbd>Cmd+Option+I</kbd> on macOS) to open **Developer Tools**.
3. Select the **Network** tab and filter by `Fetch / XHR`.
4. Perform an image compression, hash a file, or merge PDFs.
5. **Notice:** Zero bytes are transferred. No tracking analytics, no beacons, no telemetry.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node 20 & 24)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/LANGA223/omnitool.git

# Navigate to directory
cd omnitool

# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Production Build

```bash
# Build optimized static bundle
npm run build

# Preview build locally
npm run preview
```

---

## 🏗️ Architecture

```
omnitool/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Sticky header with live privacy badge & dark mode
│   │   ├── PrivacyBanner.jsx   # Trust verification & DevTools walkthrough
│   │   ├── ToolCard.jsx        # Responsive dashboard card
│   │   └── CategoryTabs.jsx    # Instant search & category pill selector
│   ├── tools/
│   │   ├── BackgroundRemover.jsx
│   │   ├── ImageCompressor.jsx
│   │   ├── QrCodeGenerator.jsx
│   │   ├── JsonCsvConverter.jsx
│   │   ├── PasswordGenerator.jsx
│   │   ├── FeeCalculator.jsx
│   │   ├── TextTools.jsx
│   │   ├── PdfMerger.jsx
│   │   ├── ExifStripper.jsx
│   │   ├── HashCalculator.jsx
│   │   └── SvgOptimizer.jsx
│   ├── utils/
│   │   └── formatters.js       # Byte formatting, clipboard & blob download helpers
│   ├── App.jsx                 # Central router & state container
│   └── index.css               # Tailwind directives & custom checkers background
```

---

## 📄 License

MIT License © 2026 LANGA223. Feel free to fork, customize, or self-host!
