import { useRef, useEffect } from 'react'
import './GlyphCollection.css'

const GlyphCollection = ({ glyphs, onGlyphSelect, selectedGlyph }) => {
  const containerRef = useRef(null)

  
  const allGlyphs = glyphs || [
    
    '.', ',', ':', ';', '+', '*', '?', '%', '$', '#', '@', '^', '&',
    '(', ')', '[', ']', '{', '}', '|', '/', '\\', '<', '>', '=', '-', '_', '~', '`', '"', "'",
    
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    
    '█', '▓', '▒', '░', '▄', '▀', '▌', '▐', '■', '□', '▪', '▫',
    
    '↑', '↓', '←', '→', '↖', '↗', '↘', '↙', '↔', '↕',
    
    '●', '○', '◆', '◇', '▲', '△', '▼', '▽', '★', '☆', '♦', '♠', '♣', '♥',
    
    '×', '÷', '±', '∞', '≈', '≠', '≤', '≥', '∑', '∏', '∫', '√',
    
    '♪', '♫', '☀', '☁', '☂', '☃', '☄', '★', '☆', '☎', '☏', '☐', '☑', '☒',
    ' ', '·', '•', '‣', '⁃', '⁌', '⁍', '⁎', '⁏', '⁐', '⁑', '⁒'
  ]

  const handleGlyphClick = (glyph) => {
    if (onGlyphSelect) {
      onGlyphSelect(glyph)
    }
  }

  return (
    <div className="glyph-collection" ref={containerRef}>
      <div className="glyph-collection-label">Glyph collection</div>
      <div className="glyph-grid">
        {allGlyphs.map((glyph, index) => (
          <button
            key={index}
            className={`glyph-item ${selectedGlyph === glyph ? 'selected' : ''}`}
            onClick={() => handleGlyphClick(glyph)}
            title={glyph === ' ' ? 'Space' : glyph}
          >
            {glyph === ' ' ? '·' : glyph}
          </button>
        ))}
      </div>
    </div>
  )
}

export default GlyphCollection

