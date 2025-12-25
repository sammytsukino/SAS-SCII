import { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './GlyphPicker.css'

const GlyphPicker = ({ glyphs, value, onChange, controller }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      
      const trigger = dropdownRef.current?.querySelector('.glyph-picker-trigger')
      const dropdown = dropdownRef.current?.querySelector('.glyph-picker-dropdown')
      if (trigger && dropdown) {
        const rect = trigger.getBoundingClientRect()
        dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`
        dropdown.style.left = `${rect.left + window.scrollX}px`
      }
      
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  const handleGlyphSelect = (glyph) => {
    onChange(glyph)
    setIsOpen(false)
  }

  
  const inputElement = controller?.$input

  return (
    <div className="glyph-picker-wrapper" ref={dropdownRef}>
      <div
        className="glyph-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: inputElement?.offsetWidth || '100%',
          minHeight: inputElement?.offsetHeight || '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '1px solid #4a4a4a',
          borderRadius: '2px',
          background: '#3a3a3a',
          padding: '2px 4px',
          fontSize: '14px',
          fontFamily: 'monospace',
          userSelect: 'none'
        }}
      >
        {value || ' '}
      </div>
      {isOpen && (
        <div className="glyph-picker-dropdown">
          <div className="glyph-picker-label">Glyph collection</div>
          <div className="glyph-picker-grid">
            {glyphs.map((glyph, index) => (
              <button
                key={index}
                className={`glyph-picker-item ${value === glyph ? 'selected' : ''}`}
                onClick={() => handleGlyphSelect(glyph)}
                title={glyph === ' ' ? 'Space' : glyph}
              >
                {glyph === ' ' ? '·' : glyph}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default GlyphPicker

