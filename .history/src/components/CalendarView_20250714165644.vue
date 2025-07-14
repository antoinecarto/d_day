<template>
  <div>
    <v-calendar v-model="selectedDates" is-range :attributes="calendarAttributes" />

    <ul class="mt-4">
      <li
        v-for="(period, index) in periods"
        :key="index"
        class="flex justify-between items-center border-b py-1"
      >
        <span>{{ formatDate(period.startDate) }} - {{ formatDate(period.endDate) }}</span>
        <button @click="confirmDeletion(period.startDate)" class="text-red-500 hover:text-red-700">
          🗑 Supprimer
        </button>
      </li>
    </ul>

    <!-- Popup de confirmation -->
    <div
      v-if="showPopup"
      class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center z-50"
    >
      <div class="bg-white p-4 rounded shadow-md max-w-sm w-full">
        <p class="mb-4">Supprimer la période du {{ formatDate(periodToDelete) }} ?</p>
        <div class="flex justify-end gap-2">
          <button @click="cancelDeletion" class="px-3 py-1 border rounded">Annuler</button>
          <button @click="deletePeriod" class="px-3 py-1 bg-red-500 text-white rounded">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const selectedDates = ref({})
const periods = ref([])
const showPopup = ref(false)
const periodToDelete = ref(null)

const calendarAttributes = ref([])

function formatDate(date) {
  return new Date(date).toLocaleDateString('fr-FR')
}

function updateAttributes() {
  calendarAttributes.value = periods.value.map((p) => ({
    key: p.startDate,
    highlight: true,
    dates: { start: p.startDate, end: p.endDate },
  }))
}

watch(selectedDates, (val) => {
  if (val.start && val.end) {
    const alreadyExists = periods.value.some(
      (p) =>
        new Date(p.startDate).getTime() === new Date(val.start).getTime() &&
        new Date(p.endDate).getTime() === new Date(val.end).getTime(),
    )
    if (!alreadyExists) {
      periods.value.push({
        startDate: new Date(val.start),
        endDate: new Date(val.end),
      })
      updateAttributes()
    }
    selectedDates.value = {} // reset après ajout
  }
})

function confirmDeletion(date) {
  periodToDelete.value = date
  showPopup.value = true
}

function cancelDeletion() {
  showPopup.value = false
  periodToDelete.value = null
}

function deletePeriod() {
  periods.value = periods.value.filter(
    (p) => p.startDate.getTime() !== periodToDelete.value.getTime(),
  )
  showPopup.value = false
  updateAttributes()
}
</script>

<style>
.dot {
  height: 12px;
  width: 12px;
  display: inline-block;
  border-radius: 50%;
  margin-right: 6px;
}
.red {
  background-color: red;
}
.pink {
  background-color: pink;
}
.green {
  background-color: green;
}
.past-opacity {
  opacity: 0.3 !important;
}
</style>
