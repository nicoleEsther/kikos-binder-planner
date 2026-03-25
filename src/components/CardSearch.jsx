import { useState } from 'react'
import axios from 'axios'

const cache = {}
const PAGE_SIZE = 8

function buildQuery(input) {
  const trimmed = input.trim()

  // Matches formats like "078/066", "078/185", or just "078"
  const numberOnly = /^(\d+)(\/\d+)?$/.test(trimmed)
  const hasSlash = trimmed.includes('/')

  if (numberOnly || hasSlash) {
    const numPart = trimmed.split('/')[0]
    const num = parseInt(numPart, 10) // strip leading zeros e.g. "078" → 78
    // Note: we intentionally ignore the "/066" total — Art Rares (AR) and
    // Special Art Rares (SAR) have card numbers HIGHER than the set total,
    // so filtering by total would exclude them.
    return `number:${num}`
  }

  return `name:${trimmed}`
}

function CardSearch({ onCardSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(results.length / PAGE_SIZE)
  const currentCards = results.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const searchCards = async () => {
    if (!query.trim()) return

    if (cache[query]) {
      setResults(cache[query])
      setPage(0)
      return
    }

    setLoading(true)
    setResults([])
    setError('')
    setPage(0)

    try {
      const q = buildQuery(query)
      // Uses the same pokemontcg.io API as the Vue version (proxied via /tcg/)
      const res = await axios.get(
        `/tcg/v2/cards?q=${encodeURIComponent(q)}&pageSize=40`
      )
      const cards = (res.data.data || [])
        .filter(card => card.images?.small)
        .map(card => ({
          id: card.id,
          name: card.name,
          images: { small: card.images.small }
        }))
      cache[query] = cards
      setResults(cards)
    } catch (err) {
      console.error('API error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4">
      <div className="flex gap-2 mb-4">
        <input
          className="border-2 border-pink-300 rounded-full px-4 py-2 w-full focus:outline-none focus:border-pink-500"
          placeholder="Search by name or number (e.g. pikachu, 078/066)... 🌸"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchCards()}
        />
        <button
          className="bg-pink-400 text-white px-6 py-2 rounded-full hover:bg-pink-500"
          onClick={searchCards}
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-400 text-center">{error}</p>}

      {loading && (
        <div className="grid grid-cols-4 gap-2">
          {Array(8).fill(null).map((_, i) => (
            <div key={i} className="w-full h-28 bg-pink-100 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {currentCards.map(card => (
          <img
            key={card.id}
            src={card.images.small}
            alt={card.name}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('card', JSON.stringify(card))}
            className="rounded-lg cursor-grab hover:scale-105 transition-transform"
            onClick={() => onCardSelect(card)}
          />
        ))}
      </div>

      {results.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="bg-pink-400 text-white px-5 py-2 rounded-full hover:bg-pink-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          <span className="text-pink-400 font-semibold">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            className="bg-pink-400 text-white px-5 py-2 rounded-full hover:bg-pink-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}

export default CardSearch