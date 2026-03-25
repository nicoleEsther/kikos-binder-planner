<template>
  <div style="background:white; border:3px dashed #ffadd1; border-radius:16px; padding:16px; position:sticky; top:16px;">
    <div style="font-size:14px; color:#d63384; font-weight:bold; text-align:center; margin-bottom:12px;">🔍 search cards 🔍</div>

    <div style="display:flex; gap:6px; margin-bottom:10px;">
      <input v-model="query" @keyup.enter="search"
        placeholder="pikachu, eevee, 078/066..."
        style="flex:1; border:2px solid #ffadd1; border-radius:20px; padding:7px 12px;
               font-family:Comic Sans MS,cursive; font-size:12px; outline:none; color:#d63384;" />
      <button @click="search"
        style="background:#ff85b3; color:white; border:none; border-radius:20px;
               padding:7px 14px; font-weight:bold; cursor:pointer; font-family:Comic Sans MS,cursive; font-size:12px;">
        go!
      </button>
    </div>

    <div style="text-align:center; font-size:11px; margin-bottom:10px; padding:6px; border-radius:10px;"
      :style="selectedSlot !== null ? 'background:#fff0f5; color:#d63384;' : 'background:#f9f9f9; color:#aaa;'">
      {{ selectedSlot !== null ? `✨ slot ${selectedSlot + 1} selected!` : '👆 select a slot first' }}
    </div>

    <div v-if="loading" style="text-align:center; padding:20px 0;">
      <div style="display:inline-block; font-size:20px; animation:spin 1s linear infinite;">🌸</div>
      <div style="color:#ffadd1; font-size:12px; margin-top:6px;">searching...</div>
    </div>

    <div v-else style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; max-height:500px; overflow-y:auto;">
      <div v-for="card in results" :key="card.id"
        @click="$emit('assign', card)"
        :style="{
          borderRadius: '10px', overflow: 'hidden',
          border: '2px solid #ffcce0',
          cursor: selectedSlot !== null ? 'pointer' : 'not-allowed',
          opacity: selectedSlot !== null ? '1' : '0.5',
          background: 'white', transition: 'all 0.2s'
        }"
        @mouseover="e => selectedSlot !== null && (e.currentTarget.style.borderColor='#ff85b3')"
        @mouseleave="e => e.currentTarget.style.borderColor='#ffcce0'">
        <img :src="card.images.small" :alt="card.name" style="width:100%; display:block;" />
        <div style="font-size:10px; text-align:center; color:#d63384; padding:4px; font-weight:bold; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
          {{ card.name }}
        </div>
      </div>
    </div>

    <div v-if="!loading && results.length === 0 && searched"
      style="text-align:center; color:#ffadd1; font-size:12px; padding:16px 0;">
      no cards found 🥺 try another name!
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({ selectedSlot: { default: null } })
defineEmits(['assign'])

const query = ref('')
const results = ref([])
const loading = ref(false)
const searched = ref(false)
let debounceTimer = null

watch(query, (val) => {
  if (!val.trim()) return
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(), 500)
})

function parseNumberSearch(input) {
  const trimmed = input.trim()
  const match = trimmed.match(/^(\d+)(?:\/(\d+))?$/)
  if (match) return { localId: match[1], total: match[2] ?? null }
  if (trimmed.includes('/')) {
    const [a, b] = trimmed.split('/')
    return { localId: a, total: b ?? null }
  }
  return null
}

// ── pokemontcg.io (English sets, proxied via /tcg/) ──────────────────────────
async function searchTCG(input) {
  const trimmed = input.trim()
  const numSearch = parseNumberSearch(trimmed)
  let q

  if (numSearch) {
    const num = parseInt(numSearch.localId, 10)
    q = `number:${num}`
  } else {
    q = `name:${trimmed}`
  }

  const res = await fetch(`/tcg/v2/cards?q=${encodeURIComponent(q)}&pageSize=20`)
  if (!res.ok) throw new Error(`TCG HTTP ${res.status}`)
  const data = await res.json()
  return (data.data || []).map(card => ({
    id: card.id,
    name: card.name,
    images: { small: card.images?.small }
  })).filter(c => c.images.small)
}

// ── TCGdex (Japanese + newer sets, proxied via /tcgdex/) ─────────────────────
async function searchTCGdex(input) {
  const trimmed = input.trim()
  const numSearch = parseNumberSearch(trimmed)

  if (numSearch && numSearch.total) {
    // Has both number and set total (e.g. "078/066") — resolve exact set
    const setsRes = await fetch(`/tcgdex/v2/en/sets`)
    if (!setsRes.ok) throw new Error(`TCGdex sets HTTP ${setsRes.status}`)
    const sets = await setsRes.json()

    const localId = numSearch.localId.replace(/^0+/, '')
    const total = parseInt(numSearch.total, 10)

    const matchingSets = (Array.isArray(sets) ? sets : [])
      .filter(s => s.cardCount?.official === total || s.cardCount?.total === total)

    const cardPromises = matchingSets.map(async (s) => {
      try {
        const r = await fetch(`/tcgdex/v2/en/sets/${s.id}/${localId}`)
        if (!r.ok) return null
        const card = await r.json()
        if (!card.image) return null
        return {
          id: `tcgdex-${card.id}`,
          name: card.name ?? trimmed,
          images: { small: `${card.image}/low.webp` }
        }
      } catch { return null }
    })

    const cards = (await Promise.all(cardPromises)).filter(Boolean)
    if (cards.length > 0) return cards
  }

  if (numSearch) {
    // Number only, no set total
    const localId = numSearch.localId.replace(/^0+/, '')
    const res = await fetch(`/tcgdex/v2/en/cards?localId=${localId}`)
    if (!res.ok) throw new Error(`TCGdex HTTP ${res.status}`)
    const data = await res.json()
    return (Array.isArray(data) ? data : [])
      .filter(c => c.image)
      .slice(0, 20)
      .map(c => ({ id: `tcgdex-${c.id}`, name: c.name ?? trimmed, images: { small: `${c.image}/low.webp` } }))
  }

  // Name search — fetch ALL results then sort newest first so ARs/SARs bubble up
  const res = await fetch(`/tcgdex/v2/en/cards?name=${encodeURIComponent(trimmed)}`)
  if (!res.ok) throw new Error(`TCGdex HTTP ${res.status}`)
  const data = await res.json()

  return (Array.isArray(data) ? data : [])
    .filter(c => c.image)
    // Sort by set id descending (sv* sets sort after older sets) and by
    // localId descending so higher card numbers (AR/SAR) come first within a set
    .sort((a, b) => {
      const setA = a.id?.split('-')[0] ?? ''
      const setB = b.id?.split('-')[0] ?? ''
      if (setB !== setA) return setB.localeCompare(setA)
      const numA = parseInt(a.localId ?? a.id?.split('-')[1] ?? 0)
      const numB = parseInt(b.localId ?? b.id?.split('-')[1] ?? 0)
      return numB - numA
    })
    .slice(0, 60) // get plenty so newer cards aren't cut off
    .map(c => ({ id: `tcgdex-${c.id}`, name: c.name ?? trimmed, images: { small: `${c.image}/low.webp` } }))
}

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  searched.value = true
  results.value = []

  try {
    // Run both APIs in parallel for speed
    const [tcgCards, tcgdexCards] = await Promise.allSettled([
      searchTCG(query.value),
      searchTCGdex(query.value)
    ])

    const english = tcgCards.status === 'fulfilled' ? tcgCards.value : []
    const all = tcgdexCards.status === 'fulfilled' ? tcgdexCards.value : []

    // TCGdex results first (newer cards, Japanese), then English-only cards
    const tcgdexIds = new Set(all.map(c => c.id))
    const englishOnly = english.filter(c => !tcgdexIds.has(c.id))
    results.value = [...all, ...englishOnly]
  } catch (e) {
    console.error('Search error:', e)
  }

  loading.value = false
}
</script>

<style>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>