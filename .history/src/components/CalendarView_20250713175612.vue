<template>
  <p class="mb-2 text-sm text-gray-700">Clique sur la date du début des règles.
  <div class="p-4">
    <v-calendar
      is-expanded
      :attributes="calendarAttributes"
      @dayclick="onDayClick"
      :disabled="isSaving"
    />

<div v-if="selectedDates.length" class="mt-4 space-y-2">
  <p><strong>Dernière période enregistrée :</strong></p>
  <p>
    <span class="pastille" style="background-color: red;"></span>
    Début des règles : {{ selectedDates[0].toLocaleDateString() }}
  </p>
  <p>
    <span class="pastille" style="background-color: pink;"></span>
    Prochaines règles estimées : {{ selectedDates[1].toLocaleDateString() }}
  </p>
  <p>
    <span class="pastille" style="background-color: green;"></span>
    Ovulation maximale estimée : {{ selectedDates[2].toLocaleDateString() }}
  </p>
</div>
  </div>
  </p>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore'

const selectedDates = ref([])
const calendarAttributes = ref([])
const isSaving = ref(false)
const colorMap = {
  rules: 'red',
  prediction: 'pink',
  ovulation: 'green',
}

const loadPeriods = async () => {
  const user = auth.currentUser
  if (!user) return

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')
    const q = query(periodsCollectionRef, orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    const periods = snapshot.docs.map((doc) => doc.data())

  if (periods.length > 0) {

const start = new Date(periods[0].startDate)
const prediction = new Date(periods[0].predictedDate)
const ovulation = new Date(start)
ovulation.setDate(start.getDate() + 14)

selectedDates.value = [start, prediction, ovulation]}

    const newAttributes = []

    periods.forEach((period, i) => {
      const startDate = new Date(period.startDate)
      const predictedDate = new Date(period.predictedDate)

      newAttributes.push(
        {
          key: `rules-${i}`,
          dates: [startDate],
          highlight: { color: 'red', fillMode: 'solid' },
          popover: { label: 'Début des règles' },
        },
        {
          key: `prediction-${i}`,
          dates: [predictedDate],
          highlight: { color: 'pink', fillMode: 'outline' },
          popover: { label: 'Prochaines règles estimées' },
        },
      )

      // Date d'ovulation maximale : 14 jours après le début des règles
      const ovulationDate = new Date(startDate)
      ovulationDate.setDate(startDate.getDate() + 14)

      newAttributes.push({
        key: `ovulation-${i}`,
        dates: [ovulationDate],
        highlight: { color: 'green', fillMode: 'solid' },
        popover: { label: 'Ovulation maximale' },
      })
    })

    calendarAttributes.value = newAttributes
  } catch (error) {
    console.error('Erreur chargement périodes:', error)
  }
}

const onDayClick = async ({ date }) => {
  if (isSaving.value) {
    console.log('Sauvegarde en cours, clic ignoré')
    return
  }
  isSaving.value = true
  const start = new Date(date)
  const prediction = new Date(start)
  prediction.setDate(start.getDate() + 28)

  const user = auth.currentUser
  if (!user) {
    console.warn('Utilisateur non connecté')
    isSaving.value = false
    return
  }

  try {
    const periodsCollectionRef = collection(db, 'users', user.uid, 'periods')

    // Vérifier qu'on n'ajoute pas deux fois la même période (par startDate)
    const snapshot = await getDocs(periodsCollectionRef)
    const exists = snapshot.docs.some((doc) => doc.data().startDate === start.toISOString())

    if (exists) {
      console.log('Période déjà enregistrée, pas d’ajout')
    } else {
      await addDoc(periodsCollectionRef, {
        startDate: start.toISOString(),
        predictedDate: prediction.toISOString(),
        createdAt: new Date().toISOString(),
      })
      console.log('Nouvelle période sauvegardée')
    }

    await loadPeriods()
  } catch (error) {
    console.error('Erreur sauvegarde période:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadPeriods()
})
</script>
