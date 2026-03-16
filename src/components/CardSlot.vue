<template>
  <div @click="$emit('select')"
    :style="{
      width: '100px', height: '140px', borderRadius: '10px',
      border: selected ? '3px solid #d63384' : '2px dashed #ffadd1',
      background: selected ? '#fff0f5' : 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', overflow: 'hidden', position: 'relative',
      boxShadow: selected ? '0 0 0 3px #ffb7d5' : 'none',
      transition: 'all 0.2s'
    }">
    <img v-if="card" :src="card.image" :alt="card.name"
      style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />
    <span v-else style="font-size:24px; color:#ffb7d5;">+</span>

    <button v-if="card" @click.stop="$emit('remove')"
      style="position:absolute; top:3px; right:3px; background:rgba(255,255,255,0.9);
             border:none; border-radius:50%; width:20px; height:20px; font-size:10px;
             cursor:pointer; color:#d63384; font-weight:bold;">
      ✕
    </button>
  </div>
</template>

<script setup>
defineProps({ card: Object, selected: Boolean })
defineEmits(['select', 'remove'])
</script>
