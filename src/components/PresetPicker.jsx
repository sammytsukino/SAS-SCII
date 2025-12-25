import { useEffect, useRef, useState } from 'react'
import './PresetPicker.css'

const PresetPicker = ({ presets, value, onChange, controller }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      
      const trigger = dropdownRef.current?.querySelector('.preset-picker-trigger')
      const dropdown = dropdownRef.current?.querySelector('.preset-picker-dropdown')
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

  const handlePresetSelect = (presetName) => {
    onChange(presetName)
    setIsOpen(false)
  }

  
  const inputElement = controller?.$input

  const presetNames = Object.keys(presets)

  return (
    <div className="preset-picker-wrapper" ref={dropdownRef}>
      <div
        className="preset-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: inputElement?.offsetWidth || '100%',
          minHeight: inputElement?.offsetHeight || '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          border: '1px solid #4a4a4a',
          borderRadius: '2px',
          background: '#3a3a3a',
          padding: '2px 8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          userSelect: 'none'
        }}
      >
        <span>{value || 'Select preset...'}</span>
        <span style={{ fontSize: '10px', opacity: 0.7 }}>▼</span>
      </div>
      {isOpen && (
        <div className="preset-picker-dropdown">
          <div className="preset-picker-label">Presets</div>
          <div className="preset-picker-list">
            {presetNames.map((presetName) => (
              <button
                key={presetName}
                className={`preset-picker-item ${value === presetName ? 'selected' : ''}`}
                onClick={() => handlePresetSelect(presetName)}
                title={presetName}
              >
                {presetName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PresetPicker

