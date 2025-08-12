<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">D-Day - Suivi Menstruel</h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Choisissez comment utiliser l'application
        </p>
      </div>

      <!-- Options de stockage -->
      <div class="bg-white shadow rounded-lg p-6 space-y-6">
        <!-- Stockage local -->
        <div
          class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
        >
          <div class="flex items-start space-x-3">
            <input
              id="local-option"
              type="radio"
              value="local"
              v-model="selectedOption"
              class="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div class="flex-1">
              <label for="local-option" class="cursor-pointer">
                <h3 class="font-medium text-gray-900 flex items-center">💾 Utilisation locale</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Vos données restent sur cet appareil uniquement. Aucune connexion requise.
                </p>
              </label>
              <div class="mt-2 text-xs text-gray-500">
                ✓ Privé et sécurisé • ✓ Fonctionne hors ligne • ⚠️ Pas de synchronisation
              </div>
            </div>
          </div>
        </div>

        <!-- Stockage cloud -->
        <div
          class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
        >
          <div class="flex items-start space-x-3">
            <input
              id="cloud-option"
              type="radio"
              value="firebase"
              v-model="selectedOption"
              class="mt-1 text-blue-600 focus:ring-blue-500"
            />
            <div class="flex-1">
              <label for="cloud-option" class="cursor-pointer">
                <h3 class="font-medium text-gray-900 flex items-center">☁️ Stockage en ligne</h3>
                <p class="text-sm text-gray-600 mt-1">
                  Synchronisation sur tous vos appareils. Connexion requise.
                </p>
              </label>
              <div class="mt-2 text-xs text-gray-500">
                ✓ Synchronisation multi-appareils • ✓ Sauvegarde automatique • ⚠️ Nécessite internet
              </div>
            </div>
          </div>
        </div>

        <!-- Formulaire de connexion (affiché seulement si cloud sélectionné) -->
        <div v-if="selectedOption === 'firebase'" class="border-t pt-4 space-y-4">
          <div v-if="!isConnected">
            <h4 class="font-medium text-gray-800 mb-3">Connexion à votre compte</h4>

            <div class="space-y-3">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700"> Email </label>
                <input
                  id="email"
                  type="email"
                  v-model="email"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  v-model="password"
                  required
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div class="flex space-x-2 mt-4">
              <button
                @click="signIn"
                :disabled="isLoading"
                class="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">Se connecter</span>
                <span v-else>Connexion...</span>
              </button>

              <button
                @click="signUp"
                :disabled="isLoading"
                class="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <span v-if="!isLoading">S'inscrire</span>
                <span v-else>Inscription...</span>
              </button>
            </div>
          </div>

          <!-- Utilisateur connecté -->
          <div v-else class="text-sm text-green-700 bg-green-50 p-3 rounded">
            ✅ Connecté en tant que {{ currentUser?.email }}
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="errorMessage" class="text-red-600 text-sm bg-red-50 p-3 rounded">
          {{ errorMessage }}
        </div>

        <!-- Bouton principal -->
        <div class="pt-4">
          <button
            @click="startApp"
            :disabled="!canStart || isLoading"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
          >
            <span v-if="selectedOption === 'local'"> 💾 Commencer en local </span>
            <span v-else-if="isConnected"> ☁️ Accéder à mes données </span>
            <span v-else> Se connecter d'abord </span>
          </button>
        </div>

        <!-- Info supplémentaires -->
        <div class="text-xs text-gray-500 space-y-1 pt-4 border-t">
          <p><strong>Mode local :</strong> Aucune donnée n'est envoyée sur internet</p>
          <p><strong>Mode cloud :</strong> Données chiffrées et stockées sur Firebase</p>
          <p>Vous pourrez changer de mode dans les paramètres de l'application</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { auth } from '../firebase'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from 'firebase/auth'
import storageService from '@/stores/storageService'
import { useRouter } from 'vue-router'

const emit = defineEmits(['login-success'])

// État réactif
const selectedOption = ref('local') // Défaut sur local
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errorMessage = ref('')
const currentUser = ref(null)
const isConnected = ref(false)
const router = useRouter()

// État calculé
const canStart = computed(() => {
  if (selectedOption.value === 'local') return true
  return selectedOption.value === 'firebase' && isConnected.value
})

// Méthodes d'authentification
const signIn = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // L'état sera mis à jour par onAuthStateChanged
  } catch (error) {
    console.error('Erreur connexion:', error)
    errorMessage.value = getErrorMessage(error.code)
  } finally {
    isLoading.value = false
  }
}

const signUp = async () => {
  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Le mot de passe doit contenir au moins 6 caractères'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    // L'état sera mis à jour par onAuthStateChanged
  } catch (error) {
    console.error('Erreur inscription:', error)
    errorMessage.value = getErrorMessage(error.code)
  } finally {
    isLoading.value = false
  }
}

// Démarrer l'application
const startApp = async () => {
  console.log('=== START APP CALLED ===')
  console.log('selectedOption BEFORE setStorageType:', selectedOption.value)

  // Configurer le type de stockage
  storageService.setStorageType(selectedOption.value)

  // Vérifier que ça a bien été sauvegardé
  console.log('Storage preference AFTER setStorageType:', storageService.getStoragePreference())

  // Attendre un peu pour être sûr que c'est sauvegardé
  await new Promise((resolve) => setTimeout(resolve, 100))

  if (selectedOption.value === 'local') {
    console.log('Navigating to calendar (local mode)')
    await router.push('/calendar')
  } else if (selectedOption.value === 'firebase' && isConnected.value) {
    console.log('Navigating to calendar (firebase mode)')
    await router.push('/calendar')
  } else {
    console.log('Cannot navigate - not connected to firebase')
  }
}

// Messages d'erreur Firebase
const getErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Aucun compte trouvé avec cet email'
    case 'auth/wrong-password':
      return 'Mot de passe incorrect'
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email'
    case 'auth/invalid-email':
      return 'Email invalide'
    case 'auth/weak-password':
      return 'Mot de passe trop faible'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard'
    default:
      return 'Erreur de connexion. Vérifiez vos informations'
  }
}

// Vérifier l'état de connexion au montage
onMounted(() => {
  console.log('=== DEBUG LOGIN FORM ===')
  console.log('selectedOption:', selectedOption.value)
  console.log('isConnected:', isConnected.value)
  console.log('currentUser:', currentUser.value)
  console.log('Current storage preference:', storageService.getStoragePreference())
  // // Vérifier s'il y a une préférence stockée
  // const storedPreference = storageService.getStoragePreference()
  // if (storedPreference) {
  //   selectedOption.value = storedPreference
  // }

  // Écouter les changements d'authentification
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    isConnected.value = !!user

    if (user) {
      errorMessage.value = ''
    }
  })
})
</script>
