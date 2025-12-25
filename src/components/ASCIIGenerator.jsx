import { useEffect, useRef, useState, useCallback } from 'react'
import { createRoot } from 'react-dom/client'
import GUI from 'lil-gui'
import * as THREE from 'three'
import GlyphPicker from './GlyphPicker'
import PresetPicker from './PresetPicker'
import './ASCIIGenerator.css'


const modelPresets = {
  torus: () => new THREE.TorusGeometry(1, 0.4, 16, 100),
  sphere: () => new THREE.SphereGeometry(1, 32, 32),
  pyramid: () => new THREE.ConeGeometry(1, 2, 4),
  cube: () => new THREE.BoxGeometry(1, 1, 1),
  cylinder: () => new THREE.CylinderGeometry(1, 1, 2, 32),
  octahedron: () => new THREE.OctahedronGeometry(1),
  tetrahedron: () => new THREE.TetrahedronGeometry(1),
  icosahedron: () => new THREE.IcosahedronGeometry(1),
}

const ASCIIGenerator = () => {
  const containerRef = useRef(null)
  const canvas3DRef = useRef(null)
  const inputDisplayCanvasRef = useRef(null)
  const outputCanvasRef = useRef(null)
  const guiRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const meshRef = useRef(null)
  const videoRef = useRef(null)
  const imageRef = useRef(null)
  const animationFrameRef = useRef(null)
  
  
  const settingsRef = useRef({
    
    framerate: 24,
    preset: 'Insta Post - 4:5 (1080x1350)',
    width: 1080,
    height: 1350,
    
    
    showInputCanvas: false,
    inputMode: '3D Model', 
    sourceObject: 'torus',
    motionMode: 'Motion',
    zoom: 1.0,
    motionSpeed: 1.0, 
    
    
    tilesPerRow: 40,
    gridLines: 0,
    gridLineWidth: 0,
    gridLineColor: '#ffffff',
    
    
    gridSizeAnimation: false,
    minSize: 22,
    maxSize: 35,
    speed: 0,
    
    
    glyphAnimation: true,
    animationSpeed: 3.0,
    minGlyphScale: 0,
    maxGlyphScale: 1.5,
    waveTiles: false,
    invertGrayscale: true,
    transparentBG: false,
    intensity: 1.5, 
    
    
    enableEdges: false,
    edgeThreshold: 118,
    edgeGlyph: '-',
    edgeColor: '#ff8847',
    edgeBG: '#000000',
    
    
    steps: [
      { name: 'Black', glyph: '■', glyphColor: '#ff0000', bgColor: '#8b0000', minGray: 0, maxGray: 42 },
      { name: 'Dark', glyph: '●', glyphColor: '#00ff00', bgColor: '#006400', minGray: 43, maxGray: 85 },
      { name: 'Medium', glyph: '◆', glyphColor: '#0000ff', bgColor: '#00008b', minGray: 86, maxGray: 128 },
      { name: 'Light', glyph: '▲', glyphColor: '#ffff00', bgColor: '#808000', minGray: 129, maxGray: 170 },
      { name: 'Very Light', glyph: 'O', glyphColor: '#ff00ff', bgColor: '#800080', minGray: 171, maxGray: 213 },
      { name: 'White', glyph: ' ', glyphColor: '#ffffff', bgColor: '#000000', minGray: 214, maxGray: 255 },
    ],
    
    
    glyphCollection: [
      
      '.', ',', ':', ';', '+', '*', '?', '%', '$', '#', '@', '^', '&',
      '(', ')', '[', ']', '{', '}', '|', '/', '\\', '<', '>', '=', '-', '_', '~', '`', '"', "'",
      
      '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
      'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      
      '▄', '▀', '▌', '▐', '■', '□', '▪', '▫',
      
      '↑', '↓', '←', '→', '↖', '↗', '↘', '↙', '↔', '↕',
      
      '●', '○', '◆', '◇', '▲', '△', '▼', '▽', '★', '☆', '♦', '♠', '♣', '♥',
      
      '◯', '◎', '◉', '◐', '◑', '✧', '✦', '✿', '❀', '✾', '°',
      
      '｡', '･',
      
      '×', '÷', '±', '∞', '≈', '≠', '≤', '≥', '∑', '∏', '∫', '√',
      
      '♪', '♫', '☀', '☁', '☂', '☃', '☄', '☎', '☏', '☐', '☑', '☒',
      ' ', '·', '•', '‣', '⁃', '⁌', '⁍', '⁎', '⁏', '⁐', '⁑', '⁒'
    ],
    
    selectedGlyphForStep: null
  })

  const [settings, setSettings] = useState(settingsRef.current)
  const isPausedRef = useRef(false)

  const updateSettings = useCallback(() => {
    const currentSettings = settingsRef.current
    setSettings({ ...currentSettings })
    
    
    imageDataCacheRef.current = null
    edgeMapCacheRef.current = null
    lastInputHashRef.current = ''
    
    
    if (meshRef.current && currentSettings.sourceObject) {
      const geometry = modelPresets[currentSettings.sourceObject]()
      if (meshRef.current.geometry) {
        meshRef.current.geometry.dispose()
      }
      meshRef.current.geometry = geometry
    }

    
    if (rendererRef.current) {
      rendererRef.current.setSize(currentSettings.width, currentSettings.height)
    }

    
    if (cameraRef.current) {
      cameraRef.current.aspect = currentSettings.width / currentSettings.height
      cameraRef.current.updateProjectionMatrix()
    }
  }, [])

  
  const imageDataCacheRef = useRef(null)
  const edgeMapCacheRef = useRef(null)
  const lastInputHashRef = useRef('')
  
  
  const stepControllersRef = useRef([])
  
  
  const presets = {
    'Cutesy Hearts & Stars': {
      steps: [
        { glyph: '♥', glyphColor: '#FF69B4', bgColor: '#FFB6C1' }, 
        { glyph: '★', glyphColor: '#FFD700', bgColor: '#FFF8DC' }, 
        { glyph: '☆', glyphColor: '#FFB6C1', bgColor: '#FFE4E1' }, 
        { glyph: '♡', glyphColor: '#FF1493', bgColor: '#FFC0CB' }, 
        { glyph: '•', glyphColor: '#FF69B4', bgColor: '#FFE4E1' }, 
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#FFF0F5' }, 
      ]
    },
    'Christmas Joy': {
      steps: [
        { glyph: '❄', glyphColor: '#FFFFFF', bgColor: '#E8F4F8' }, 
        { glyph: '★', glyphColor: '#FFD700', bgColor: '#FFA500' }, 
        { glyph: '●', glyphColor: '#FF0000', bgColor: '#8B0000' }, 
        { glyph: '◆', glyphColor: '#228B22', bgColor: '#006400' }, 
        { glyph: '·', glyphColor: '#FFD700', bgColor: '#FFA500' }, 
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#F0F8FF' }, 
      ]
    },
    'Matrix Digital': {
      steps: [
        { glyph: '0', glyphColor: '#00FF00', bgColor: '#001100' },
        { glyph: '1', glyphColor: '#00FF41', bgColor: '#002200' },
        { glyph: '|', glyphColor: '#39FF14', bgColor: '#003300' },
        { glyph: '/', glyphColor: '#7FFF00', bgColor: '#004400' },
        { glyph: '\\', glyphColor: '#ADFF2F', bgColor: '#005500' },
        { glyph: ' ', glyphColor: '#00FF00', bgColor: '#000000' },
      ]
    },
    'Vintage Dot Matrix': {
      steps: [
        { glyph: '■', glyphColor: '#8B4513', bgColor: '#654321' }, 
        { glyph: '□', glyphColor: '#A0522D', bgColor: '#8B4513' }, 
        { glyph: '●', glyphColor: '#CD853F', bgColor: '#A0522D' }, 
        { glyph: '·', glyphColor: '#DEB887', bgColor: '#CD853F' }, 
        { glyph: '.', glyphColor: '#F5DEB3', bgColor: '#DEB887' }, 
        { glyph: ' ', glyphColor: '#FFF8DC', bgColor: '#F5DEB3' }, 
      ]
    },
    'Bold Geometric': {
      steps: [
        { glyph: '■', glyphColor: '#FF0000', bgColor: '#8B0000' }, 
        { glyph: '●', glyphColor: '#0000FF', bgColor: '#00008B' }, 
        { glyph: '◆', glyphColor: '#FFFF00', bgColor: '#B8860B' }, 
        { glyph: '▲', glyphColor: '#00FF00', bgColor: '#006400' }, 
        { glyph: '■', glyphColor: '#FF00FF', bgColor: '#8B008B' }, 
        { glyph: '□', glyphColor: '#FFFFFF', bgColor: '#C0C0C0' }, 
      ]
    },
    'Minimalist Dots': {
      steps: [
        { glyph: '●', glyphColor: '#000000', bgColor: '#000000' },
        { glyph: '○', glyphColor: '#333333', bgColor: '#1A1A1A' },
        { glyph: '·', glyphColor: '#666666', bgColor: '#333333' },
        { glyph: '.', glyphColor: '#999999', bgColor: '#666666' },
        { glyph: ' ', glyphColor: '#CCCCCC', bgColor: '#999999' },
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#CCCCCC' },
      ]
    },
    'Retro Arcade': {
      steps: [
        { glyph: '■', glyphColor: '#FF00FF', bgColor: '#800080' }, 
        { glyph: '●', glyphColor: '#00FFFF', bgColor: '#008080' }, 
        { glyph: '◆', glyphColor: '#FFFF00', bgColor: '#808000' }, 
        { glyph: '▲', glyphColor: '#00FF00', bgColor: '#008000' }, 
        { glyph: '■', glyphColor: '#FF0000', bgColor: '#800000' }, 
        { glyph: '□', glyphColor: '#0000FF', bgColor: '#000080' }, 
      ]
    },
    'Lego Blocks': {
      steps: [
        { glyph: '■', glyphColor: '#FF0000', bgColor: '#FF6B6B' }, 
        { glyph: '●', glyphColor: '#0066FF', bgColor: '#4A90E2' }, 
        { glyph: '◆', glyphColor: '#FFD700', bgColor: '#FFE135' }, 
        { glyph: '▲', glyphColor: '#00CC00', bgColor: '#7ED321' }, 
        { glyph: '■', glyphColor: '#FF8C00', bgColor: '#FFA500' }, 
        { glyph: '□', glyphColor: '#FFFFFF', bgColor: '#F5F5F5' }, 
      ]
    },
    'Classic Terminal': {
      steps: [
        { glyph: '#', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: '@', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: '*', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: '.', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: ':', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: ' ', glyphColor: '#00FF00', bgColor: '#000000' },
      ]
    },
    'Ocean Waves': {
      steps: [
        { glyph: '~', glyphColor: '#000080', bgColor: '#000033' }, 
        { glyph: '≈', glyphColor: '#0000CD', bgColor: '#000066' }, 
        { glyph: '○', glyphColor: '#1E90FF', bgColor: '#0066CC' }, 
        { glyph: '·', glyphColor: '#00BFFF', bgColor: '#0099CC' }, 
        { glyph: '.', glyphColor: '#87CEEB', bgColor: '#5F9EA0' }, 
        { glyph: ' ', glyphColor: '#B0E0E6', bgColor: '#87CEFA' }, 
      ]
    },
    
    'Classic ASCII': {
      steps: [
        { glyph: '@', glyphColor: '#000000', bgColor: '#000000' },
        { glyph: '#', glyphColor: '#1A1A1A', bgColor: '#0D0D0D' },
        { glyph: '8', glyphColor: '#333333', bgColor: '#1A1A1A' },
        { glyph: '&', glyphColor: '#4D4D4D', bgColor: '#262626' },
        { glyph: '%', glyphColor: '#666666', bgColor: '#333333' },
        { glyph: '$', glyphColor: '#808080', bgColor: '#404040' },
        { glyph: '+', glyphColor: '#999999', bgColor: '#4D4D4D' },
        { glyph: '=', glyphColor: '#B3B3B3', bgColor: '#666666' },
        { glyph: '-', glyphColor: '#CCCCCC', bgColor: '#808080' },
        { glyph: '.', glyphColor: '#E6E6E6', bgColor: '#999999' },
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#B3B3B3' },
      ]
    },
    'Typewriter': {
      steps: [
        { glyph: 'M', glyphColor: '#000000', bgColor: '#1C1C1C' },
        { glyph: 'W', glyphColor: '#2A2A2A', bgColor: '#333333' },
        { glyph: 'N', glyphColor: '#444444', bgColor: '#4D4D4D' },
        { glyph: 'm', glyphColor: '#5E5E5E', bgColor: '#666666' },
        { glyph: 'o', glyphColor: '#787878', bgColor: '#808080' },
        { glyph: '*', glyphColor: '#929292', bgColor: '#999999' },
        { glyph: '.', glyphColor: '#ACACAC', bgColor: '#B3B3B3' },
        { glyph: "'", glyphColor: '#C6C6C6', bgColor: '#CCCCCC' },
        { glyph: ' ', glyphColor: '#E0E0E0', bgColor: '#E6E6E6' },
      ]
    },
    'Stipple Print': {
      steps: [
        { glyph: '#', glyphColor: '#000000', bgColor: '#1A1A1A' },
        { glyph: 'X', glyphColor: '#2D2D2D', bgColor: '#3A3A3A' },
        { glyph: 'x', glyphColor: '#5A5A5A', bgColor: '#6E6E6E' },
        { glyph: '+', glyphColor: '#8C8C8C', bgColor: '#A0A0A0' },
        { glyph: '.', glyphColor: '#B8B8B8', bgColor: '#CECECE' },
        { glyph: ' ', glyphColor: '#E8E8E8', bgColor: '#F0F0F0' },
      ]
    },
    
    'Neon Cyberpunk': {
      steps: [
        { glyph: '#', glyphColor: '#FF00FF', bgColor: '#4A004A' },
        { glyph: '@', glyphColor: '#FF00AA', bgColor: '#550055' },
        { glyph: '%', glyphColor: '#FF0055', bgColor: '#660066' },
        { glyph: '+', glyphColor: '#00FFFF', bgColor: '#005555' },
        { glyph: 'x', glyphColor: '#00FFAA', bgColor: '#004466' },
        { glyph: '.', glyphColor: '#00FF55', bgColor: '#003344' },
        { glyph: ' ', glyphColor: '#0088FF', bgColor: '#001122' },
      ]
    },
    'Fire & Flame': {
      steps: [
        { glyph: '#', glyphColor: '#FFFF00', bgColor: '#FF4500' },
        { glyph: 'X', glyphColor: '#FFD700', bgColor: '#FF6347' },
        { glyph: '+', glyphColor: '#FFA500', bgColor: '#FF7F50' },
        { glyph: 'x', glyphColor: '#FF8C00', bgColor: '#FFA07A' },
        { glyph: '*', glyphColor: '#FF6347', bgColor: '#FFB6C1' },
        { glyph: '.', glyphColor: '#FF4500', bgColor: '#FFD7BE' },
        { glyph: ' ', glyphColor: '#8B0000', bgColor: '#FFE4B5' },
      ]
    },
    'Forest Canopy': {
      steps: [
        { glyph: '@', glyphColor: '#013220', bgColor: '#001a0f' },
        { glyph: '&', glyphColor: '#0a5f38', bgColor: '#024d2a' },
        { glyph: '%', glyphColor: '#16814f', bgColor: '#0d6842' },
        { glyph: '*', glyphColor: '#34a853', bgColor: '#228b5a' },
        { glyph: '+', glyphColor: '#52c674', bgColor: '#3da862' },
        { glyph: '.', glyphColor: '#7de896', bgColor: '#60d47d' },
        { glyph: ' ', glyphColor: '#a8f5ba', bgColor: '#8ff0a5' },
      ]
    },
    'Desert Dunes': {
      steps: [
        { glyph: '#', glyphColor: '#8B4513', bgColor: '#654321' },
        { glyph: 'X', glyphColor: '#A0522D', bgColor: '#7B3F00' },
        { glyph: '+', glyphColor: '#CD853F', bgColor: '#996515' },
        { glyph: 'x', glyphColor: '#DEB887', bgColor: '#C19A6B' },
        { glyph: '~', glyphColor: '#F5DEB3', bgColor: '#D2B48C' },
        { glyph: '.', glyphColor: '#FAEBD7', bgColor: '#EEE8AA' },
        { glyph: ' ', glyphColor: '#FFF8DC', bgColor: '#FFEBCD' },
      ]
    },
    'Starry Night': {
      steps: [
        { glyph: '*', glyphColor: '#FFFFFF', bgColor: '#000033' },
        { glyph: '+', glyphColor: '#FFE4B5', bgColor: '#000066' },
        { glyph: 'x', glyphColor: '#FFD700', bgColor: '#000099' },
        { glyph: '.', glyphColor: '#FFA500', bgColor: '#0000CC' },
        { glyph: "'", glyphColor: '#87CEEB', bgColor: '#191970' },
        { glyph: '.', glyphColor: '#4169E1', bgColor: '#0C2340' },
        { glyph: ' ', glyphColor: '#000080', bgColor: '#000000' },
      ]
    },
    'Glitch Art': {
      steps: [
        { glyph: '#', glyphColor: '#FF0000', bgColor: '#00FFFF' },
        { glyph: '@', glyphColor: '#00FF00', bgColor: '#FF00FF' },
        { glyph: '%', glyphColor: '#0000FF', bgColor: '#FFFF00' },
        { glyph: '&', glyphColor: '#FFFF00', bgColor: '#0000FF' },
        { glyph: 'x', glyphColor: '#FF00FF', bgColor: '#00FF00' },
        { glyph: '.', glyphColor: '#00FFFF', bgColor: '#FF0000' },
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#000000' },
      ]
    },
    'Watercolor': {
      steps: [
        { glyph: 'o', glyphColor: '#4A90E2', bgColor: '#A8D8F0' },
        { glyph: 'O', glyphColor: '#7B68EE', bgColor: '#B8B0F0' },
        { glyph: '0', glyphColor: '#DA70D6', bgColor: '#E6A8E0' },
        { glyph: '+', glyphColor: '#F8B4D9', bgColor: '#FDD7EA' },
        { glyph: '.', glyphColor: '#FFD1DC', bgColor: '#FFE4E9' },
        { glyph: ' ', glyphColor: '#FFF0F5', bgColor: '#FFFAFA' },
      ]
    },
    'Binary Code': {
      steps: [
        { glyph: '1', glyphColor: '#00FF00', bgColor: '#000000' },
        { glyph: '0', glyphColor: '#00DD00', bgColor: '#001100' },
        { glyph: '1', glyphColor: '#00BB00', bgColor: '#002200' },
        { glyph: '0', glyphColor: '#009900', bgColor: '#003300' },
        { glyph: '1', glyphColor: '#007700', bgColor: '#004400' },
        { glyph: ' ', glyphColor: '#005500', bgColor: '#005500' },
      ]
    },
    'Cave Shadows': {
      steps: [
        { glyph: '#', glyphColor: '#1a1a1a', bgColor: '#000000' },
        { glyph: 'X', glyphColor: '#2d2d2d', bgColor: '#1a1a1a' },
        { glyph: 'x', glyphColor: '#404040', bgColor: '#2d2d2d' },
        { glyph: '+', glyphColor: '#595959', bgColor: '#404040' },
        { glyph: '-', glyphColor: '#737373', bgColor: '#595959' },
        { glyph: '.', glyphColor: '#8c8c8c', bgColor: '#737373' },
        { glyph: ' ', glyphColor: '#a6a6a6', bgColor: '#8c8c8c' },
      ]
    },
    'Ocean Depths': {
      steps: [
        { glyph: '~', glyphColor: '#000080', bgColor: '#000033' },
        { glyph: '=', glyphColor: '#0000CD', bgColor: '#000066' },
        { glyph: '-', glyphColor: '#1E90FF', bgColor: '#0066CC' },
        { glyph: '.', glyphColor: '#00BFFF', bgColor: '#0099CC' },
        { glyph: "'", glyphColor: '#87CEEB', bgColor: '#5F9EA0' },
        { glyph: ' ', glyphColor: '#B0E0E6', bgColor: '#87CEFA' },
      ]
    },
    'Kaomoji Cute': {
      steps: [
        { glyph: '●', glyphColor: '#FF69B4', bgColor: '#FFB6D9' },
        { glyph: '○', glyphColor: '#FF85C1', bgColor: '#FFC5E0' },
        { glyph: '◯', glyphColor: '#FFA0CE', bgColor: '#FFD4E7' },
        { glyph: '•', glyphColor: '#FFBBDB', bgColor: '#FFE3EE' },
        { glyph: '｡', glyphColor: '#FFD6E8', bgColor: '#FFF0F5' },
        { glyph: ' ', glyphColor: '#FFF0F5', bgColor: '#FFFAFA' },
      ]
    },
    'Kawaii Stars': {
      steps: [
        { glyph: '★', glyphColor: '#FFD700', bgColor: '#FFF8DC' },
        { glyph: '☆', glyphColor: '#FFE135', bgColor: '#FFFACD' },
        { glyph: '✧', glyphColor: '#FFEC8B', bgColor: '#FFFAF0' },
        { glyph: '✦', glyphColor: '#FFF68F', bgColor: '#FFFFF0' },
        { glyph: '･', glyphColor: '#FFFACD', bgColor: '#FFFEF7' },
        { glyph: ' ', glyphColor: '#FFFFF0', bgColor: '#FFFFFF' },
      ]
    },
    'Manga Tone': {
      steps: [
        { glyph: '■', glyphColor: '#000000', bgColor: '#1A1A1A' },
        { glyph: '◆', glyphColor: '#2D2D2D', bgColor: '#3A3A3A' },
        { glyph: '◇', glyphColor: '#5A5A5A', bgColor: '#6E6E6E' },
        { glyph: '◎', glyphColor: '#8C8C8C', bgColor: '#A0A0A0' },
        { glyph: '○', glyphColor: '#B8B8B8', bgColor: '#CECECE' },
        { glyph: ' ', glyphColor: '#E8E8E8', bgColor: '#F0F0F0' },
      ]
    },
    'Sparkle Dreams': {
      steps: [
        { glyph: '✦', glyphColor: '#FFD700', bgColor: '#FFF8DC' },
        { glyph: '✧', glyphColor: '#FFB6C1', bgColor: '#FFE4E9' },
        { glyph: '･', glyphColor: '#DDA0DD', bgColor: '#F0E6FF' },
        { glyph: '｡', glyphColor: '#E6E6FA', bgColor: '#F8F8FF' },
        { glyph: '°', glyphColor: '#F0F8FF', bgColor: '#FFFAFA' },
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#FFFFFF' },
      ]
    },
    'Pixel Hearts': {
      steps: [
        { glyph: '♥', glyphColor: '#FF1493', bgColor: '#8B0A50' },
        { glyph: '♡', glyphColor: '#FF69B4', bgColor: '#C71585' },
        { glyph: '●', glyphColor: '#FFB6C1', bgColor: '#FF69B4' },
        { glyph: '○', glyphColor: '#FFC0CB', bgColor: '#FFB6C1' },
        { glyph: '･', glyphColor: '#FFD1DC', bgColor: '#FFC0CB' },
        { glyph: ' ', glyphColor: '#FFE4E9', bgColor: '#FFD1DC' },
      ]
    },
    'Zen Garden': {
      steps: [
        { glyph: '●', glyphColor: '#2F4F4F', bgColor: '#1C2833' },
        { glyph: '◎', glyphColor: '#556B2F', bgColor: '#2C3E2E' },
        { glyph: '○', glyphColor: '#6B8E23', bgColor: '#4A5D3F' },
        { glyph: '◯', glyphColor: '#8FBC8F', bgColor: '#7A9D7A' },
        { glyph: '｡', glyphColor: '#B8D4B8', bgColor: '#A8C8A8' },
        { glyph: ' ', glyphColor: '#E8F5E8', bgColor: '#D4E8D4' },
      ]
    },
    'Bubble Pop': {
      steps: [
        { glyph: '●', glyphColor: '#FF1493', bgColor: '#FFB6D9' },
        { glyph: '◉', glyphColor: '#00CED1', bgColor: '#AFEEEE' },
        { glyph: '◎', glyphColor: '#FFD700', bgColor: '#FFFACD' },
        { glyph: '○', glyphColor: '#FF69B4', bgColor: '#FFD1DC' },
        { glyph: '◯', glyphColor: '#87CEEB', bgColor: '#E0F6FF' },
        { glyph: ' ', glyphColor: '#FFF0F5', bgColor: '#FFFAFA' },
      ]
    },
    'Moonlight': {
      steps: [
        { glyph: '◐', glyphColor: '#F0E68C', bgColor: '#191970' },
        { glyph: '◑', glyphColor: '#FFFACD', bgColor: '#2C3E7A' },
        { glyph: '◯', glyphColor: '#FFF8DC', bgColor: '#4169E1' },
        { glyph: '○', glyphColor: '#FFFFF0', bgColor: '#6495ED' },
        { glyph: '･', glyphColor: '#E6F2FF', bgColor: '#87CEEB' },
        { glyph: ' ', glyphColor: '#B0C4DE', bgColor: '#ADD8E6' },
      ]
    },
    'Raindrop': {
      steps: [
        { glyph: '●', glyphColor: '#00008B', bgColor: '#000033' },
        { glyph: '○', glyphColor: '#0000CD', bgColor: '#191970' },
        { glyph: '◯', glyphColor: '#4169E1', bgColor: '#1E3A8A' },
        { glyph: '｡', glyphColor: '#87CEEB', bgColor: '#4682B4' },
        { glyph: '･', glyphColor: '#B0E0E6', bgColor: '#87CEEB' },
        { glyph: ' ', glyphColor: '#E0F6FF', bgColor: '#B0E0E6' },
      ]
    },
    'Sakura Petals': {
      steps: [
        { glyph: '✿', glyphColor: '#FF1493', bgColor: '#8B0A50' },
        { glyph: '❀', glyphColor: '#FF69B4', bgColor: '#C71585' },
        { glyph: '✾', glyphColor: '#FFB6C1', bgColor: '#FF69B4' },
        { glyph: '○', glyphColor: '#FFC0CB', bgColor: '#FFB6C1' },
        { glyph: '･', glyphColor: '#FFE4E9', bgColor: '#FFD1DC' },
        { glyph: ' ', glyphColor: '#FFF0F5', bgColor: '#FFE4E9' },
      ]
    },
    'Retro Game': {
      steps: [
        { glyph: '■', glyphColor: '#FF0000', bgColor: '#8B0000' },
        { glyph: '●', glyphColor: '#00FF00', bgColor: '#006400' },
        { glyph: '◆', glyphColor: '#0000FF', bgColor: '#00008B' },
        { glyph: '▲', glyphColor: '#FFFF00', bgColor: '#808000' },
        { glyph: '○', glyphColor: '#FF00FF', bgColor: '#800080' },
        { glyph: ' ', glyphColor: '#FFFFFF', bgColor: '#000000' },
      ]
    },
    'Soft Pastel': {
      steps: [
        { glyph: '◆', glyphColor: '#FFB3E6', bgColor: '#FFD9F2' },
        { glyph: '●', glyphColor: '#C1E1FF', bgColor: '#E0F0FF' },
        { glyph: '○', glyphColor: '#FFFACD', bgColor: '#FFFEF0' },
        { glyph: '◇', glyphColor: '#E6F3E6', bgColor: '#F5FFF5' },
        { glyph: '･', glyphColor: '#FFE6F0', bgColor: '#FFF8FC' },
        { glyph: ' ', glyphColor: '#FFFEF7', bgColor: '#FFFFFF' },
      ]
    }
  }

  const updateOutputCanvas = useCallback((time) => {
    const currentSettings = settingsRef.current
    const outputCanvas = outputCanvasRef.current
    if (!outputCanvas || !currentSettings) return

    const ctx = outputCanvas.getContext('2d')
    
    
    if (outputCanvas.width !== currentSettings.width || outputCanvas.height !== currentSettings.height) {
      outputCanvas.width = currentSettings.width
      outputCanvas.height = currentSettings.height
    }

    
    
    if (currentSettings.transparentBG || (currentSettings.showInputCanvas && !currentSettings.transparentBG)) {
      ctx.clearRect(0, 0, outputCanvas.width, outputCanvas.height)
    } else {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, outputCanvas.width, outputCanvas.height)
    }

    
    let imageData
    const inputHash = `${currentSettings.inputMode}-${currentSettings.width}-${currentSettings.height}-${currentSettings.inputMode === 'Image' ? imageRef.current?.src : ''}-${currentSettings.inputMode === 'Video' ? videoRef.current?.currentTime : ''}`

    
    if (currentSettings.inputMode === 'Image' && imageRef.current) {
      if (imageDataCacheRef.current && lastInputHashRef.current === inputHash) {
        imageData = imageDataCacheRef.current
      } else {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = currentSettings.width
        tempCanvas.height = currentSettings.height
        const tempCtx = tempCanvas.getContext('2d')
        tempCtx.drawImage(imageRef.current, 0, 0, currentSettings.width, currentSettings.height)
        imageData = tempCtx.getImageData(0, 0, currentSettings.width, currentSettings.height)
        imageDataCacheRef.current = imageData
        lastInputHashRef.current = inputHash
        edgeMapCacheRef.current = null 
      }
    } else if (currentSettings.inputMode === 'Video' && videoRef.current) {
      
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = currentSettings.width
      tempCanvas.height = currentSettings.height
      const tempCtx = tempCanvas.getContext('2d')
      tempCtx.drawImage(videoRef.current, 0, 0, currentSettings.width, currentSettings.height)
      imageData = tempCtx.getImageData(0, 0, currentSettings.width, currentSettings.height)
      edgeMapCacheRef.current = null 
    } else {
      
      if (canvas3DRef.current && rendererRef.current) {
        const gl = rendererRef.current.getContext()
        const pixels = new Uint8Array(currentSettings.width * currentSettings.height * 4)
        gl.readPixels(0, 0, currentSettings.width, currentSettings.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
        
        
        const flippedPixels = new Uint8Array(pixels.length)
        for (let y = 0; y < currentSettings.height; y++) {
          const srcY = currentSettings.height - 1 - y
          for (let x = 0; x < currentSettings.width; x++) {
            const srcIdx = (srcY * currentSettings.width + x) * 4
            const dstIdx = (y * currentSettings.width + x) * 4
            flippedPixels[dstIdx] = pixels[srcIdx]
            flippedPixels[dstIdx + 1] = pixels[srcIdx + 1]
            flippedPixels[dstIdx + 2] = pixels[srcIdx + 2]
            flippedPixels[dstIdx + 3] = pixels[srcIdx + 3]
          }
        }
        
        imageData = new ImageData(
          new Uint8ClampedArray(flippedPixels),
          currentSettings.width,
          currentSettings.height
        )
        edgeMapCacheRef.current = null 
      } else {
        return
      }
    }

    if (!imageData) return

    
    const baseTileWidth = currentSettings.width / currentSettings.tilesPerRow
    const baseTileHeight = baseTileWidth
    
    
    let tileWidth = baseTileWidth
    let tileHeight = baseTileHeight
    
    if (currentSettings.gridSizeAnimation && currentSettings.speed > 0) {
      const motionSpeed = currentSettings.motionSpeed || 1.0
      const animValue = (Math.sin(time * currentSettings.speed * 10 * motionSpeed) + 1) / 2
      const sizeRange = currentSettings.maxSize - currentSettings.minSize
      const animatedSize = currentSettings.minSize + sizeRange * animValue
      tileWidth = animatedSize
      tileHeight = animatedSize
    }
    
    const tilesPerCol = Math.ceil(currentSettings.height / baseTileHeight)

    
    let edgeMap = null
    if (currentSettings.enableEdges) {
      const edgeCacheKey = `${inputHash}-${currentSettings.edgeThreshold}`
      
      
      if (edgeMapCacheRef.current && currentSettings.inputMode === 'Image' && lastInputHashRef.current === inputHash) {
        edgeMap = edgeMapCacheRef.current
      } else {
        edgeMap = new Uint8Array(currentSettings.width * currentSettings.height)
        
        
        
        const grayCache = new Uint8Array(currentSettings.width * currentSettings.height)
        for (let y = 0; y < currentSettings.height; y++) {
          for (let x = 0; x < currentSettings.width; x++) {
            const idx = (y * currentSettings.width + x) * 4
            const r = imageData.data[idx]
            const g = imageData.data[idx + 1]
            const b = imageData.data[idx + 2]
            grayCache[y * currentSettings.width + x] = (r * 0.299 + g * 0.587 + b * 0.114)
          }
        }
        
        
        for (let y = 1; y < currentSettings.height - 1; y++) {
          for (let x = 1; x < currentSettings.width - 1; x++) {
            const getGray = (px, py) => grayCache[py * currentSettings.width + px]
            
            
            const gx = 
              -1 * getGray(x - 1, y - 1) + 1 * getGray(x + 1, y - 1) +
              -2 * getGray(x - 1, y)     + 2 * getGray(x + 1, y) +
              -1 * getGray(x - 1, y + 1) + 1 * getGray(x + 1, y + 1)
            
            const gy = 
              -1 * getGray(x - 1, y - 1) - 2 * getGray(x, y - 1) - 1 * getGray(x + 1, y - 1) +
               1 * getGray(x - 1, y + 1) + 2 * getGray(x, y + 1) + 1 * getGray(x + 1, y + 1)
            
            
            const magnitude = Math.sqrt(gx * gx + gy * gy)
            edgeMap[y * currentSettings.width + x] = Math.min(255, magnitude)
          }
        }
        
        
        if (currentSettings.inputMode === 'Image') {
          edgeMapCacheRef.current = edgeMap
        }
      }
    }

    
    for (let ty = 0; ty < tilesPerCol; ty++) {
      for (let tx = 0; tx < currentSettings.tilesPerRow; tx++) {
        
        
        let x, y, drawWidth, drawHeight
        if (currentSettings.gridLines > 0) {
          
          x = tx * baseTileWidth + (baseTileWidth - tileWidth) / 2
          y = ty * baseTileHeight + (baseTileHeight - tileHeight) / 2
          drawWidth = tileWidth
          drawHeight = tileHeight
        } else {
          
          x = Math.floor(tx * baseTileWidth)
          y = Math.floor(ty * baseTileHeight)
          
          
          const nextX = tx === currentSettings.tilesPerRow - 1 
            ? currentSettings.width 
            : Math.floor((tx + 1) * baseTileWidth)
          const nextY = ty === tilesPerCol - 1 
            ? currentSettings.height 
            : Math.floor((ty + 1) * baseTileHeight)
          
          
          drawWidth = nextX - x
          drawHeight = nextY - y
        }

        
        let hasEdge = false
        let maxEdgeStrength = 0
        
        if (currentSettings.enableEdges && edgeMap) {
          const sampleSize = Math.max(1, Math.floor(baseTileWidth / 4))
          for (let sy = 0; sy < baseTileHeight; sy += sampleSize) {
            for (let sx = 0; sx < baseTileWidth; sx += sampleSize) {
              const px = Math.floor(tx * baseTileWidth + sx)
              const py = Math.floor(ty * baseTileHeight + sy)
              
              if (px < currentSettings.width && py < currentSettings.height) {
                const edgeStrength = edgeMap[py * currentSettings.width + px]
                if (edgeStrength > currentSettings.edgeThreshold) {
                  hasEdge = true
                  maxEdgeStrength = Math.max(maxEdgeStrength, edgeStrength)
                }
              }
            }
          }
        }

        
        
        let totalGray = 0
        let sampleCount = 0

        
        const sampleSize = Math.max(2, Math.floor(baseTileWidth / 3))
        const startX = Math.floor(tx * baseTileWidth)
        const startY = Math.floor(ty * baseTileHeight)
        const endX = Math.min(startX + baseTileWidth, currentSettings.width)
        const endY = Math.min(startY + baseTileHeight, currentSettings.height)
        
        for (let py = startY; py < endY; py += sampleSize) {
          for (let px = startX; px < endX; px += sampleSize) {
            if (px < currentSettings.width && py < currentSettings.height) {
              const idx = (py * currentSettings.width + px) * 4
              const r = imageData.data[idx]
              const g = imageData.data[idx + 1]
              const b = imageData.data[idx + 2]
              
              
              const gray = (r * 0.299 + g * 0.587 + b * 0.114)
              totalGray += gray
              sampleCount++
            }
          }
        }

        const avgGray = sampleCount > 0 ? totalGray / sampleCount : 128
        let normalizedGray = currentSettings.invertGrayscale ? 255 - avgGray : avgGray
        
        
        if (currentSettings.intensity !== 1.0) {
          
          const centered = normalizedGray - 128
          const intensified = centered * currentSettings.intensity
          normalizedGray = Math.max(0, Math.min(255, 128 + intensified))
        }

        
        if (hasEdge && currentSettings.enableEdges) {
          
          ctx.fillStyle = currentSettings.edgeBG
          ctx.fillRect(x, y, drawWidth, drawHeight)

          
          if (currentSettings.gridLines > 0 && currentSettings.gridLineWidth > 0) {
            
            let r, g, b
            if (currentSettings.gridLineColor.startsWith('#')) {
              r = parseInt(currentSettings.gridLineColor.slice(1, 3), 16)
              g = parseInt(currentSettings.gridLineColor.slice(3, 5), 16)
              b = parseInt(currentSettings.gridLineColor.slice(5, 7), 16)
            } else {
              r = g = b = 255 
            }
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentSettings.gridLines})`
            ctx.lineWidth = currentSettings.gridLineWidth
            ctx.strokeRect(x, y, drawWidth, drawHeight)
          }

          
          ctx.fillStyle = currentSettings.edgeColor
          ctx.font = `${drawHeight}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            currentSettings.edgeGlyph,
            x + drawWidth / 2,
            y + drawHeight / 2
          )
          continue
        }

        
        let step = currentSettings.steps.find(s => 
          normalizedGray >= s.minGray && normalizedGray <= s.maxGray
        )
        
        if (!step) {
          
          step = currentSettings.steps.reduce((closest, s) => {
            const dist = Math.abs((s.minGray + s.maxGray) / 2 - normalizedGray)
            const closestDist = Math.abs((closest.minGray + closest.maxGray) / 2 - normalizedGray)
            return dist < closestDist ? s : closest
          })
        }

        
        let glyphScale = 1
        if (currentSettings.glyphAnimation) {
          const motionSpeed = currentSettings.motionSpeed || 1.0
          let wave = Math.sin(time * currentSettings.animationSpeed * 10 * motionSpeed + (tx + ty) * 0.1)
          if (currentSettings.waveTiles) {
            
            wave = Math.sin(time * currentSettings.animationSpeed * 10 * motionSpeed + (tx + ty) * 0.5) * 
                   Math.cos(time * currentSettings.animationSpeed * 5 * motionSpeed + (tx - ty) * 0.3)
          }
          glyphScale = currentSettings.minGlyphScale + (currentSettings.maxGlyphScale - currentSettings.minGlyphScale) * (wave + 1) / 2
        }

        
        
        if (currentSettings.showInputCanvas && !currentSettings.transparentBG) {
          
          const bgColor = step.bgColor
          if (bgColor.startsWith('#')) {
            
            ctx.fillStyle = bgColor + 'CC' 
          } else {
            ctx.fillStyle = bgColor
          }
        } else {
          ctx.fillStyle = step.bgColor
        }
        ctx.fillRect(x, y, drawWidth, drawHeight)

        
        if (currentSettings.gridLines > 0 && currentSettings.gridLineWidth > 0) {
          
          let r, g, b
          if (currentSettings.gridLineColor.startsWith('#')) {
            r = parseInt(currentSettings.gridLineColor.slice(1, 3), 16)
            g = parseInt(currentSettings.gridLineColor.slice(3, 5), 16)
            b = parseInt(currentSettings.gridLineColor.slice(5, 7), 16)
          } else {
            r = g = b = 255 
          }
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${currentSettings.gridLines})`
          ctx.lineWidth = currentSettings.gridLineWidth
          ctx.strokeRect(x, y, drawWidth, drawHeight)
        }

        
        ctx.fillStyle = step.glyphColor
        ctx.font = `${drawHeight * glyphScale}px monospace`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          step.glyph,
          x + drawWidth / 2,
          y + drawHeight / 2
        )
      }
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current || !canvas3DRef.current) return

    const currentSettings = settingsRef.current

    
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000000)
    
    const camera = new THREE.PerspectiveCamera(
      75,
      currentSettings.width / currentSettings.height,
      0.1,
      1000
    )
    camera.position.z = 3
    
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas3DRef.current,
      antialias: true,
      preserveDrawingBuffer: true
    })
    renderer.setSize(currentSettings.width, currentSettings.height)
    
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    
    const geometry = modelPresets[currentSettings.sourceObject]()
    const material = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      flatShading: true
    })
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)
    
    meshRef.current = mesh

    
    const gui = new GUI({ container: containerRef.current })
    guiRef.current = gui

    
    const canvasFolder = gui.addFolder('1. Canvas - Settings')
    canvasFolder.add(currentSettings, 'framerate', 1, 60).onChange(updateSettings)
    canvasFolder.add(currentSettings, 'preset', [
      'Landscape (1920x1080)',
      'Insta Post - 4:5 (1080x1350)',
      'Square (1080x1080)',
      'Story (1080x1920)',
      'Custom'
    ]).onChange((value) => {
      if (value === 'Landscape (1920x1080)') {
        currentSettings.width = 1920
        currentSettings.height = 1080
        currentSettings.preset = value
        updateSettings()
      } else if (value === 'Insta Post - 4:5 (1080x1350)') {
        currentSettings.width = 1080
        currentSettings.height = 1350
        currentSettings.preset = value
        updateSettings()
      } else if (value === 'Square (1080x1080)') {
        currentSettings.width = 1080
        currentSettings.height = 1080
        currentSettings.preset = value
        updateSettings()
      } else if (value === 'Story (1080x1920)') {
        currentSettings.width = 1080
        currentSettings.height = 1920
        currentSettings.preset = value
        updateSettings()
      }
    })
    canvasFolder.add(currentSettings, 'width', 100, 2000).onChange(updateSettings)
    canvasFolder.add(currentSettings, 'height', 100, 2000).onChange(updateSettings)

    
    const inputFolder = gui.addFolder('2. Input')
    inputFolder.add(currentSettings, 'showInputCanvas').onChange(() => {
      updateSettings()
      setSettings({ ...currentSettings })
    })
    inputFolder.add(currentSettings, 'inputMode', ['3D Model', 'Image', 'Video']).onChange(updateSettings)
    inputFolder.add(currentSettings, 'sourceObject', Object.keys(modelPresets)).onChange(() => {
      
      if (meshRef.current) {
        const geometry = modelPresets[currentSettings.sourceObject]()
        if (meshRef.current.geometry) {
          meshRef.current.geometry.dispose()
        }
        meshRef.current.geometry = geometry
      }
      updateSettings()
    })
    inputFolder.add(currentSettings, 'motionMode', ['Motion', 'Static']).onChange(updateSettings)
    inputFolder.add(currentSettings, 'zoom', 0.1, 5).onChange(updateSettings)
    inputFolder.add(currentSettings, 'motionSpeed', 0, 5).name('Animation Speed').onChange(updateSettings)
    
    const uploadObjBtn = { upload: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.obj'
      input.onchange = (e) => {
        
        console.log('OBJ upload not implemented in this example')
      }
      input.click()
    }}
    inputFolder.add(uploadObjBtn, 'upload').name('Upload .obj')
    
    const uploadImageBtn = { upload: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
              imageRef.current = img
              currentSettings.inputMode = 'Image'
              updateSettings()
            }
            img.src = event.target.result
          }
          reader.readAsDataURL(file)
        }
      }
      input.click()
    }}
    inputFolder.add(uploadImageBtn, 'upload').name('Upload Image')
    
    const uploadVideoBtn = { upload: () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'video/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          const video = document.createElement('video')
          video.src = URL.createObjectURL(file)
          video.loop = true
          video.muted = true
          video.play()
          videoRef.current = video
          currentSettings.inputMode = 'Video'
          updateSettings()
        }
      }
      input.click()
    }}
    inputFolder.add(uploadVideoBtn, 'upload').name('Upload Video')

    
    const controlsFolder = gui.addFolder('Controls')
    const pauseResumeBtn = { toggle: () => {
      isPausedRef.current = !isPausedRef.current
      pauseResumeController.name(isPausedRef.current ? '▶ Resume' : '⏸ Pause')
      pauseResumeController.updateDisplay()
      
      if (videoRef.current) {
        if (isPausedRef.current) {
          videoRef.current.pause()
        } else {
          videoRef.current.play()
        }
      }
    }}
    const pauseResumeController = controlsFolder.add(pauseResumeBtn, 'toggle').name('⏸ Pause')
    
    const downloadBtn = { download: () => {
      const canvas = outputCanvasRef.current
      if (!canvas) return
      
      canvas.toBlob((blob) => {
        if (!blob) return
        
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `ascii-art-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }, 'image/png')
    }}
    controlsFolder.add(downloadBtn, 'download').name('💾 Download')

    
    const outputFolder = gui.addFolder('3. Output - ASCII')
    outputFolder.add(currentSettings, 'tilesPerRow', 10, 200).onChange(updateSettings)
    outputFolder.add(currentSettings, 'gridLines', 0, 1).onChange(updateSettings)
    outputFolder.add(currentSettings, 'gridLineWidth', 0, 10).name('Grid Line Width').onChange(updateSettings)
    outputFolder.addColor(currentSettings, 'gridLineColor').name('Grid Line Color').onChange(updateSettings)

    
    const gridAnimFolder = outputFolder.addFolder('Grid Size Animation')
    gridAnimFolder.add(currentSettings, 'gridSizeAnimation').onChange(updateSettings)
    gridAnimFolder.add(currentSettings, 'minSize', 5, 100).onChange(updateSettings)
    gridAnimFolder.add(currentSettings, 'maxSize', 5, 100).onChange(updateSettings)
    gridAnimFolder.add(currentSettings, 'speed', 0, 1).onChange(updateSettings)

    
    const glyphAnimFolder = outputFolder.addFolder('Glyph Wave Animation')
    glyphAnimFolder.add(currentSettings, 'glyphAnimation').onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'animationSpeed', 0, 1).onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'minGlyphScale', 0, 2).onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'maxGlyphScale', 0, 2).onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'waveTiles').onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'invertGrayscale').onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'transparentBG').onChange(updateSettings)
    glyphAnimFolder.add(currentSettings, 'intensity', 0, 2).name('Intensity').onChange(updateSettings)

    
    const edgeFolder = outputFolder.addFolder('Edge Settings')
    edgeFolder.add(currentSettings, 'enableEdges').onChange(updateSettings)
    edgeFolder.add(currentSettings, 'edgeThreshold', 0, 255).onChange(updateSettings)
    
    
    const edgeGlyphController = edgeFolder.add(currentSettings, 'edgeGlyph').onChange(updateSettings)
    setTimeout(() => {
      const inputWrapper = edgeGlyphController.$input?.parentElement
      if (inputWrapper && !inputWrapper.querySelector('.glyph-picker-wrapper')) {
        const pickerContainer = document.createElement('div')
        pickerContainer.style.width = '100%'
        pickerContainer.style.position = 'relative'
        inputWrapper.appendChild(pickerContainer)
        
        
        edgeGlyphController.$input.style.position = 'absolute'
        edgeGlyphController.$input.style.opacity = '0'
        edgeGlyphController.$input.style.pointerEvents = 'none'
        edgeGlyphController.$input.style.width = '1px'
        edgeGlyphController.$input.style.height = '1px'
        
        
        const updateEdgeGlyphPicker = () => {
          if (pickerContainer._reactRoot) {
            pickerContainer._reactRoot.render(
              <GlyphPicker
                glyphs={currentSettings.glyphCollection}
                value={currentSettings.edgeGlyph}
                onChange={(glyph) => {
                  currentSettings.edgeGlyph = glyph
                  edgeGlyphController.updateDisplay()
                  updateSettings()
                }}
                controller={edgeGlyphController}
              />
            )
          }
        }
        
        
        const root = createRoot(pickerContainer)
        root.render(
          <GlyphPicker
            glyphs={currentSettings.glyphCollection}
            value={currentSettings.edgeGlyph}
            onChange={(glyph) => {
              currentSettings.edgeGlyph = glyph
              edgeGlyphController.updateDisplay()
              updateSettings()
            }}
            controller={edgeGlyphController}
          />
        )
        
        
        pickerContainer._reactRoot = root
        pickerContainer._updateGlyphPicker = updateEdgeGlyphPicker
        edgeGlyphController._pickerUpdate = updateEdgeGlyphPicker
      }
    }, 200)
    
    edgeFolder.addColor(currentSettings, 'edgeColor').onChange(updateSettings)
    edgeFolder.addColor(currentSettings, 'edgeBG').onChange(updateSettings)

    
    const presetFolder = outputFolder.addFolder('Presets')
    const applyPreset = (presetName) => {
      const preset = presets[presetName]
      if (!preset) return
      
      currentSettings.steps.forEach((step, index) => {
        if (preset.steps[index]) {
          step.glyph = preset.steps[index].glyph
          step.glyphColor = preset.steps[index].glyphColor
          step.bgColor = preset.steps[index].bgColor
          
          
          const controllers = stepControllersRef.current[index]
          if (controllers) {
            controllers.glyphController?.updateDisplay()
            controllers.glyphColorController?.updateDisplay()
            controllers.bgColorController?.updateDisplay()
            if (controllers.glyphController?._pickerUpdate) {
              controllers.glyphController._pickerUpdate()
            }
          }
        }
      })
      updateSettings()
    }
    
    
    const presetControllerObj = { selectedPreset: 'Select preset...' }
    const presetController = presetFolder.add(presetControllerObj, 'selectedPreset').onChange((presetName) => {
      if (presetName && presetName !== 'Select preset...') {
        applyPreset(presetName)
      }
    })
    
    
    setTimeout(() => {
      const inputWrapper = presetController.$input?.parentElement
      if (inputWrapper && !inputWrapper.querySelector('.preset-picker-wrapper')) {
        const pickerContainer = document.createElement('div')
        pickerContainer.style.width = '100%'
        pickerContainer.style.position = 'relative'
        inputWrapper.appendChild(pickerContainer)
        
        
        presetController.$input.style.position = 'absolute'
        presetController.$input.style.opacity = '0'
        presetController.$input.style.pointerEvents = 'none'
        presetController.$input.style.width = '1px'
        presetController.$input.style.height = '1px'
        
        
        const root = createRoot(pickerContainer)
        root.render(
          <PresetPicker
            presets={presets}
            value={presetControllerObj.selectedPreset}
            onChange={(presetName) => {
              presetControllerObj.selectedPreset = presetName
              presetController.updateDisplay()
              applyPreset(presetName)
            }}
            controller={presetController}
          />
        )
        
        
        pickerContainer._reactRoot = root
      }
    }, 200)

    
    currentSettings.steps.forEach((step, index) => {
      const stepFolder = outputFolder.addFolder(`Step ${index + 1}: ${step.name}`)
      
      
      const glyphController = stepFolder.add(step, 'glyph').onChange(() => {
        updateSettings()
      })
      
      
      setTimeout(() => {
        const inputWrapper = glyphController.$input.parentElement
        if (inputWrapper && !inputWrapper.querySelector('.glyph-picker-wrapper')) {
          const pickerContainer = document.createElement('div')
          pickerContainer.style.width = '100%'
          pickerContainer.style.position = 'relative'
          inputWrapper.appendChild(pickerContainer)
          
          
          glyphController.$input.style.position = 'absolute'
          glyphController.$input.style.opacity = '0'
          glyphController.$input.style.pointerEvents = 'none'
          glyphController.$input.style.width = '1px'
          glyphController.$input.style.height = '1px'
          
          
          const updateGlyphPicker = () => {
            if (pickerContainer._reactRoot) {
              pickerContainer._reactRoot.render(
                <GlyphPicker
                  glyphs={currentSettings.glyphCollection}
                  value={step.glyph}
                  onChange={(glyph) => {
                    step.glyph = glyph
                    glyphController.updateDisplay()
                    updateSettings()
                  }}
                  controller={glyphController}
                />
              )
            }
          }
          
          
          const root = createRoot(pickerContainer)
          root.render(
            <GlyphPicker
              glyphs={currentSettings.glyphCollection}
              value={step.glyph}
              onChange={(glyph) => {
                step.glyph = glyph
                glyphController.updateDisplay()
                updateSettings()
              }}
              controller={glyphController}
            />
          )
          
          
          pickerContainer._reactRoot = root
          pickerContainer._updateGlyphPicker = updateGlyphPicker
          
          
          glyphController._pickerUpdate = updateGlyphPicker
        }
      }, 200)
      
      
      const glyphColorController = stepFolder.addColor(step, 'glyphColor').onChange(() => updateSettings())
      const bgColorController = stepFolder.addColor(step, 'bgColor').onChange(() => updateSettings())
      stepFolder.add(step, 'minGray', 0, 255).onChange(() => updateSettings())
      stepFolder.add(step, 'maxGray', 0, 255).onChange(() => updateSettings())
      
      
      if (!stepControllersRef.current[index]) {
        stepControllersRef.current[index] = {}
      }
      stepControllersRef.current[index].glyphController = glyphController
      stepControllersRef.current[index].glyphColorController = glyphColorController
      stepControllersRef.current[index].bgColorController = bgColorController
      
      const randomizeBtn = { randomize: () => {
        const glyphs = currentSettings.glyphCollection
        step.glyph = glyphs[Math.floor(Math.random() * glyphs.length)]
        step.glyphColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
        step.bgColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
        
        
        glyphController.updateDisplay()
        
        
        glyphColorController.updateDisplay()
        bgColorController.updateDisplay()
        
        
        if (glyphController._pickerUpdate) {
          glyphController._pickerUpdate()
        }
        
        updateSettings()
      }}
      stepFolder.add(randomizeBtn, 'randomize').name('Randomize')
    })

    
    let time = 0
    let lastFrameTime = 0
    
    const animate = (currentTime) => {
      if (isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
      
      const currentSettings = settingsRef.current
      const targetFrameTime = 1000 / (currentSettings.framerate || 24) 
      
      
      const elapsed = currentTime - lastFrameTime
      if (elapsed < targetFrameTime) {
        return
      }
      lastFrameTime = currentTime - (elapsed % targetFrameTime)
      
      const speed = currentSettings.motionSpeed || 1.0
      time += 0.01 * speed

      
      if (currentSettings.inputMode === '3D Model' && currentSettings.motionMode === 'Motion' && meshRef.current) {
        meshRef.current.rotation.x += 0.005 * speed
        meshRef.current.rotation.y += 0.01 * speed
      }

      
      if (cameraRef.current) {
        cameraRef.current.position.z = 3 / currentSettings.zoom
      }

      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }

      
      if (currentSettings.showInputCanvas && inputDisplayCanvasRef.current) {
        const inputCanvas = inputDisplayCanvasRef.current
        const ctx = inputCanvas.getContext('2d')
        
        
        if (inputCanvas.width !== currentSettings.width || inputCanvas.height !== currentSettings.height) {
          inputCanvas.width = currentSettings.width
          inputCanvas.height = currentSettings.height
        }
        
        if (currentSettings.inputMode === 'Image' && imageRef.current) {
          ctx.clearRect(0, 0, inputCanvas.width, inputCanvas.height)
          ctx.drawImage(imageRef.current, 0, 0, inputCanvas.width, inputCanvas.height)
        } else if (currentSettings.inputMode === 'Video' && videoRef.current) {
          ctx.clearRect(0, 0, inputCanvas.width, inputCanvas.height)
          ctx.drawImage(videoRef.current, 0, 0, inputCanvas.width, inputCanvas.height)
        }
      }

      
      updateOutputCanvas(time)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      gui.destroy()
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
    
  }, [])

  const currentSettings = settingsRef.current
  const showInput = currentSettings?.showInputCanvas || false
  const is3DModel = currentSettings?.inputMode === '3D Model'

  return (
    <div className="ascii-generator">
      <div className="gui-container" ref={containerRef}></div>
      <div className="canvas-container">
        {/* 3D Model input canvas */}
        <canvas
          ref={canvas3DRef}
          className="input-canvas"
          style={{ 
            display: showInput && is3DModel ? 'block' : 'none',
            opacity: showInput ? 1 : 0
          }}
        />
        {/* Image/Video input display canvas */}
        <canvas
          ref={inputDisplayCanvasRef}
          className="input-display-canvas"
          style={{ 
            display: showInput && !is3DModel ? 'block' : 'none',
            opacity: showInput ? 1 : 0
          }}
        />
        <canvas
          ref={outputCanvasRef}
          className="output-canvas"
          style={{
            opacity: showInput ? 0.5 : 1
          }}
        />
      </div>
    </div>
  )
}

export default ASCIIGenerator

