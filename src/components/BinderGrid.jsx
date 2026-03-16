function BinderGrid({ slots, cols = 3, onSlotClick, onSlotClear, onCardDrop, onCardMove }) {
  const handleDragOver = (e) => e.preventDefault()

  const handleDrop = (e, toIndex) => {
    e.preventDefault()
    const data = JSON.parse(e.dataTransfer.getData('card'))
    if (data.fromIndex !== undefined) {
      onCardMove(data.fromIndex, toIndex)
    } else {
      onCardDrop(data, toIndex)
    }
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[cols]} gap-3 p-4 bg-white rounded-2xl shadow-md w-fit mx-auto`}>
      {slots.map((card, index) => (
        <div
          key={index}
          className="relative w-24 h-32 border-2 border-dashed border-pink-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 bg-pink-50"
          onClick={() => onSlotClick(index)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, index)}
        >
          {card ? (
            <>
              <img
                src={card.images.small}
                alt={card.name}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('card', JSON.stringify({ ...card, fromIndex: index }))
                }}
                className="rounded-lg w-full h-full object-cover cursor-grab"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onSlotClear(index)
                }}
                className="absolute top-1 right-1 bg-pink-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-pink-700"
              >
                ×
              </button>
            </>
          ) : (
            <span className="text-pink-300 text-2xl">+</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default BinderGrid
