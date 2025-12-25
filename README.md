# SAS-SCII

A web application for generating ASCII art from 3D models, images, and videos. Built with React, Three.js, and lil-gui.

## Features

- **Multiple Input Sources:**
  - 3D Model presets (torus, sphere, pyramid, cube, cylinder, octahedron, tetrahedron, icosahedron)
  - Image upload support
  - Video upload support
  
- **Pixel-by-Pixel Analysis:**
  - Analyzes grayscale values pixel by pixel
  - Maps gray values to customizable glyphs and colors
  
- **Customizable Output:**
  - Multiple steps (Black, Dark, Medium, Light, Very Light, White) for different gray value ranges
  - Custom glyphs and colors for each step
  - Grid size and animation controls
  - Glyph wave animation
  - Invert grayscale option
  - Transparent background option

- **UI Controls:**
  - Full lil-gui interface with collapsible sections
  - Real-time preview
  - Canvas size presets (Instagram Post, Square, Story, Custom)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

## Usage

1. **Select Input Mode:**
   - Choose between "3D Model", "Image", or "Video" in the Input section
   - For 3D models, select a preset shape (torus, sphere, etc.)
   - Upload images or videos using the upload buttons

2. **Configure Canvas:**
   - Adjust width and height, or use a preset
   - Set framerate

3. **Customize ASCII Output:**
   - Set tiles per row (controls resolution)
   - Adjust grid lines opacity
   - Configure glyph wave animation
   - Set up color and glyph mappings for each gray value range

4. **Fine-tune Steps:**
   - Each step (Black, Dark, Medium, etc.) represents a gray value range
   - Set the glyph character, glyph color, and background color for each step
   - Adjust min/max gray values to control the mapping
   - Use the "Randomize" button to generate random combinations

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── ASCIIGenerator.jsx    # Main component
│   │   └── ASCIIGenerator.css    # Component styles
│   ├── App.jsx                    # App component
│   ├── App.css                    # App styles
│   ├── main.jsx                   # Entry point
│   └── index.css                  # Global styles
├── index.html                     # HTML template
├── package.json                   # Dependencies
└── vite.config.js                 # Vite configuration
```

## Technologies

- **React** - UI framework
- **Three.js** - 3D rendering
- **lil-gui** - UI controls
- **Vite** - Build tool and dev server

## License

MIT

