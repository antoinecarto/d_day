<template>
  <div class="p-4">
    <v-calendar
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
      :disabled="isSaving"
    />

    <div v-if="selectedDates.length" class="mt-4">
      <p><strong>Dernière période enregistrée :</strong></p>
      <p>
        <span class="dot red"></span>
        Début des règles : {{ selectedDates[0].toLocaleDateString() }}
      </p>
      <p>
        <span class="dot green"></span>
        Ovulation maximale : {{ selectedDates[2].toLocaleDateString() }}
      </p>
      <p>
        <span class="dot pink"></span>
        Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
      </p>
    </div>

    <div class="mt-4 text-right">
      <button @click="showSettings = !showSettings">⚙️ Paramètres</button>
    </div>

    <div v-if="showSettings" class="mt-2">
      <label>
        Durée du cycle (jours) :
        <input type="number" v-model.number="cycleDuration" min="20" max="40" />
      </label>
      <p class="text-sm text-gray-500">
        La nouvelle durée s'appliquera aux prochains cycles enregistrés.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const showSettings = ref(false)
const cycleDuration = ref(28) // valeur par défaut

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const periods = snapshot.docs.map((doc) => doc.data())

    const newAttributes = []

    if (periods.length > 0) {
      const latest = periods[0]
      const startDate = new Date(latest.startDate)
      const predictedDate = new Date(latest.predictedDate)
      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(
        startDate.getDate() + Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24) / 2),
      )

      selectedDates.value = [startDate, predictedDate, ovulationDate]
    }

    const referenceDate = selectedDates.value[0] ?? new Date(0)

    periods.forEach((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(period.predictedDate)
      const ovulationDate = new Date(startDate)
      const cycleDays = Math.floor((predictedDate - startDate) / (1000 * 60 * 60 * 24))
      ovulationDate.setDate(startDate.getDate() + Math.floor(cycleDays / 2))

      const opacity = startDate < referenceDate ? 0.3 : 1

      newAttributes.push(
        {
          key: `rules-${i}`,
          dates: [startDate],
          highlight: {
            color: 'red',
            fillMode: 'solid',
            contentClass: startDate < referenceDate ? 'past-opacity' : '',
          },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [predictedDate],
          highlight: {
            color: 'pink',
            fillMode: 'outline',
            contentClass: startDate < referenceDate ? 'past-opacity' : '',
          },
          popover: { label: 'Prochaines règles estimées' },
        },
        {
          key: `ovulation-${i}`,
          dates: [ovulationDate],
          highlight: {
            color: 'green',
            fillMode: 'solid',
            contentClass: startDate < referenceDate ? 'past-opacity' : '',
          },
          popover: { label: 'Ovulation maximale' },
        },
      )
    })

    calendarAttributes.value = newAttributes
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const onDayClick = async ({ date }) => {
  if (isSaving.value) return
  isSaving.value = true

  const user = auth.currentUser
  if (!user) {
    isSaving.value = false
    return
  }

  const start = new Date(date)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + cycleDuration.value)
  const ovulation = new Date(start)
  ovulation.setDate(start.getDate() + Math.floor(cycleDuration.value / 2))

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const snapshot = await getDocs(periodsCollectionRef)
    const exists = snapshot.docs.some((doc) => doc.data().startDate === start.toISOString())

    if (!exists) {
      await addDoc(periodsCollectionRef, {
        startDate: start.toISOString(),
        predictedDate: prediction.toISOString(),
        createdAt: new Date().toISOString(),
      })
    }

    await loadPeriods()
  } catch (error) {
    console.error('Erreur sauvegarde période:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(loadPeriods)
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
  opacity: 0.3;
}
</style>
