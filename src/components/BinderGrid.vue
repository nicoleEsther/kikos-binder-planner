<template>
  <div style="background:white; border:3px dashed #ffadd1; border-radius:16px; padding:20px; display:inline-block; width:100%;">
    <div style="font-size:13px; color:#d63384; font-weight:bold; text-align:center; margin-bottom:12px;">🎀 my binder page 🎀</div>

    <!-- Grid Size -->
    <div style="display:flex; gap:8px; justify-content:center; margin-bottom:16px;">
      <button v-for="size in ['2×2','3×3','4×4']" :key="size"
        @click="$emit('resize', size)"
        :style="{
          padding: '6px 18px', borderRadius: '20px',
          border: '2px solid #ff85b3',
          background: gridSize === size ? '#ff85b3' : 'white',
          color: gridSize === size ? 'white' : '#ff85b3',
          fontWeight: 'bold', cursor: 'pointer',
          fontFamily: 'Comic Sans MS, cursive', fontSize: '13px'
        }">
        {{ size }}
      </button>
    </div>

    <!-- Slots -->
    <div :style="`display:grid; grid-template-columns:repeat(${gridCols}, 100px); gap:10px; justify-content:center;`">
      <CardSlot v-for="(slot, i) in slots" :key="i"
        :card="slot"
        :selected="selectedSlot === i"
        @select="$emit('select-slot', i)"
        @remove="$emit('remove-card', i)" />
    </div>

    <!-- Save -->
    <div style="margin-top:16px; text-align:center;">
      <button @click="$emit('save')"
        style="background:linear-gradient(135deg,#ff85b3,#d63384); color:white; border:none;
               padding:10px 28px; border-radius:20px; font-weight:bold; cursor:pointer;
               font-family:Comic Sans MS,cursive; font-size:14px; box-shadow:0 3px 10px rgba(214,51,132,0.3);">
        💾 save binder!
      </button>
      <div v-if="saveMessage" style="margin-top:8px; font-size:13px; color:#d63384; font-weight:bold;">
        {{ saveMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CardSlot from './CardSlot.vue'

const props = defineProps({
  slots: Array,
  gridSize: String,
  selectedSlot: Number,
  saveMessage: String
})

defineEmits(['resize', 'select-slot', 'remove-card', 'save'])

const gridCols = computed(() => props.gridSize === '2×2' ? 2 : props.gridSize === '3×3' ? 3 : 4)
</script>
