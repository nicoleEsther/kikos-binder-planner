<template>
  <div class="min-h-screen" style="background-color:#fff0f5; font-family:'Comic Sans MS',cursive;">

    <!-- Banner -->
    <div style="background:linear-gradient(90deg,#ffb7d5,#ffd6e8,#ffb7d5); border-bottom:3px dashed #ff85b3; padding:12px; text-align:center;">
      <div style="font-size:24px; font-weight:bold; color:#d63384; text-shadow:2px 2px 0px #ffb7d5; letter-spacing:2px;">
        🌸✨ kiko's binder planner ✨🌸
      </div>
      <div style="font-size:12px; color:#ff85b3; margin-top:4px;">꒰ click a slot → search a card → assign! ꒱</div>
    </div>

<div style="background:#ffcce0; border-bottom:2px solid #ffadd1; padding:4px 0; overflow:hidden;">
  <div style="white-space:nowrap; animation:marquee 20s linear infinite; display:inline-block; color:#d63384; font-size:12px;">
    🌸 welcome to kiko's binder planner! 🎴 collect your fave cards! ✨ save your binder! 💾 &nbsp;&nbsp;&nbsp; 🌸 welcome!
  </div>
</div>


    <!-- Main Layout -->
    <div style="max-width:1100px; margin:0 auto; padding:24px 16px; display:flex; gap:24px;">
      <div style="flex:1;">
        <BinderGrid
          :slots="slots"
          :gridSize="gridSize"
          :selectedSlot="selectedSlot"
          :saveMessage="saveMessage"
          @resize="setGrid"
          @select-slot="selectSlot"
          @remove-card="removeCard"
          @save="saveBinder" />
      </div>

        <div style="width:400px; flex-shrink:0;">
        <CardSearch :selectedSlot="selectedSlot" @assign="assignCard" />
      </div>
    </div>

    <div style="text-align:center; padding:16px; font-size:11px; color:#ffadd1; border-top:2px dashed #ffcce0;">
      made with 🌸 by kiko · powered by pokémon tcg api + firebase
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import BinderGrid from './components/BinderGrid.vue'
import CardSearch from './components/CardSearch.vue'

const gridSize = ref('3×3')
const slots = ref(Array(9).fill(null))
const selectedSlot = ref(null)
const saveMessage = ref('')

function setGrid(size) {
  gridSize.value = size
  const count = size === '2×2' ? 4 : size === '3×3' ? 9 : 16
  slots.value = Array(count).fill(null)
  selectedSlot.value = null
}

function selectSlot(i) {
  selectedSlot.value = selectedSlot.value === i ? null : i
}

function removeCard(i) {
  const updated = [...slots.value]
  updated[i] = null
  slots.value = updated
}

function assignCard(card) {
  if (selectedSlot.value === null) return
  const updated = [...slots.value]
  updated[selectedSlot.value] = { name: card.name, image: card.images.small }
  slots.value = updated
  selectedSlot.value = null
}

async function saveBinder() {
  try {
    await setDoc(doc(db, 'binders', 'my-binder'), {
      gridSize: gridSize.value,
      slots: slots.value,
      updatedAt: new Date().toISOString()
    })
    saveMessage.value = '✅ saved! ♡'
    setTimeout(() => saveMessage.value = '', 3000)
  } catch (e) {
    saveMessage.value = '❌ ' + e.message
  }
}

onMounted(async () => {
  try {
    const snap = await getDocs(collection(db, 'binders'))
    if (!snap.empty) {
      const data = snap.docs[0].data()
      gridSize.value = data.gridSize || '3×3'
      slots.value = data.slots || Array(9).fill(null)
    }
  } catch (e) { console.error(e) }
})
</script>

<style>
@keyframes marquee {
  from { transform: translateX(100vw); }
  to { transform: translateX(-100%); }
}
</style>
