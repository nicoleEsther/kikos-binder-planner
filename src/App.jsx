import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'
import CardSearch from './components/CardSearch'
import BinderGrid from './components/BinderGrid'

const GRID_SIZES = [
  { label: '2×2', cols: 2, total: 4 },
  { label: '3×3', cols: 3, total: 9 },
  { label: '4×4', cols: 4, total: 16 },
]

function App() {
  const [slots, setSlots] = useState(Array(9).fill(null))
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [gridSize, setGridSize] = useState(GRID_SIZES[1])
  const gridRef = useRef(null)

  const handleGridSizeChange = (size) => {
    setGridSize(size)
    setSlots(Array(size.total).fill(null))
    setSelectedSlot(null)
  }

  const handleSlotClick = (index) => setSelectedSlot(index)

  const handleCardSelect = (card) => {
    if (selectedSlot === null) return
    const newSlots = [...slots]
    newSlots[selectedSlot] = card
    setSlots(newSlots)
    setSelectedSlot(null)
  }

  const handleSlotClear = (index) => {
    const newSlots = [...slots]
    newSlots[index] = null
    setSlots(newSlots)
  }

  const handleCardDrop = (card, index) => {
    const newSlots = [...slots]
    newSlots[index] = card
    setSlots(newSlots)
    setSelectedSlot(null)
  }

  const handleCardMove = (fromIndex, toIndex) => {
    const newSlots = [...slots]
    const temp = newSlots[toIndex]
    newSlots[toIndex] = newSlots[fromIndex]
    newSlots[fromIndex] = temp
    setSlots(newSlots)
  }

  const exportAsPNG = async () => {
    if (!gridRef.current) return
    const canvas = await html2canvas(gridRef.current, {
      backgroundColor: '#fff0f5',
      useCORS: true,
      allowTaint: true,
      logging: false,
    })
    const link = document.createElement('a')
    link.download = 'my-binder-layout.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  return (
    <div className="min-h-screen bg-pink-50 py-10 px-8">
      <h1 className="text-4xl font-bold text-pink-400 text-center mb-2">🌸 Kiko's Binder Planner</h1>
      <p className="text-center text-pink-300 mb-6">
        {selectedSlot !== null ? `Slot ${selectedSlot + 1} selected — now search a card!` : 'Click a slot to select it, then search a card 🌸'}
      </p>

      {/* Grid Size Selector */}
      <div className="flex justify-center gap-3 mb-8">
        {GRID_SIZES.map(size => (
          <button
            key={size.label}
            onClick={() => handleGridSizeChange(size)}
            className={`px-5 py-2 rounded-full font-semibold border-2 transition-all ${
              gridSize.label === size.label
                ? 'bg-pink-400 text-white border-pink-400'
                : 'bg-white text-pink-400 border-pink-300 hover:border-pink-400'
            }`}
          >
            {size.label}
          </button>
        ))}
      </div>

      <div className="flex gap-8 items-start justify-center">

        {/* Left: Binder Grid */}
        <div className="flex flex-col items-center gap-4">
          <div ref={gridRef}>
            <BinderGrid
              slots={slots}
              cols={gridSize.cols}
              onSlotClick={handleSlotClick}
              onSlotClear={handleSlotClear}
              onCardDrop={handleCardDrop}
              onCardMove={handleCardMove}
            />
          </div>
          <button
            onClick={exportAsPNG}
            className="bg-pink-400 text-white px-8 py-3 rounded-full hover:bg-pink-500 font-semibold shadow-md"
          >
            💾 Save as PNG
          </button>
        </div>

        {/* Right: Card Search */}
        <div className="flex-1 max-w-lg">
          <CardSearch onCardSelect={handleCardSelect} />
        </div>

      </div>
    </div>
  )
}

export default App
