<template>
  <div style="background:white; border:3px dashed #ffadd1; border-radius:16px; padding:16px; position:sticky; top:16px;">
    <div style="font-size:14px; color:#d63384; font-weight:bold; text-align:center; margin-bottom:12px;">🔍 search cards 🔍</div>

    <div style="display:flex; gap:6px; margin-bottom:10px;">
      <input v-model="query" @keyup.enter="search"
        placeholder="pikachu, eevee..."
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

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  searched.value = true
  results.value = []
  try {
    const url = `/tcg/v2/cards?q=name:${encodeURIComponent(query.value)}&pageSize=20`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    const data = await res.json()
    results.value = data.data || []
  } catch (e) {
    console.error('Error fetching cards:', e)
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