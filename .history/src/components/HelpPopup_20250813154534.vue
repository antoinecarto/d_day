<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="show"
        class="popup w-full h-full z-50 bg-black bg-opacity-50 overflow-auto"
        @click.self="close"
      >
        <!-- Overlay -->
        <div class="p-6 space-y-4"></div>

        <!-- Contenu de la popup -->
        <div
          class="relative z-10 bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        >
          <!-- En-tête du popup -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-bold text-pink-600 flex items-center gap-2">
                ❓ Guide d'utilisation D-Day
              </h2>
              <button
                @click="close"
                class="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>

          <!-- Contenu du popup -->
          <div class="px-6 py-6 space-y-6">
            <!-- Section 1 -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                🌸 Qu'est-ce que D-Day ?
              </h3>
              <p class="text-gray-600 leading-relaxed">
                D-Day est votre assistant personnel pour suivre votre cycle menstruel. L'application
                vous aide à prévoir vos prochaines règles et votre période d'ovulation en se basant
                sur vos cycles précédents.
              </p>
            </section>

            <!-- Section 2 -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                📅 Comment utiliser l'application
              </h3>
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-red-500 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Enregistrer le début de vos règles :</strong>
                    <p class="text-gray-600">
                      Cliquez sur la date du premier jour de vos règles dans le calendrier.
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-pink-400 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Prédictions automatiques :</strong>
                    <p class="text-gray-600">
                      L'application calcule automatiquement vos prochaines règles estimées.
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span
                    class="inline-block w-6 h-6 bg-green-500 rounded-full mt-1 flex-shrink-0"
                  ></span>
                  <div>
                    <strong class="text-gray-800">Période d'ovulation :</strong>
                    <p class="text-gray-600">
                      Visualisez votre période d'ovulation maximale pour une meilleure
                      planification.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Section 3 -->
            <section>
              <h3 class="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                ⚙️ Fonctionnalités avancées
              </h3>
              <div class="space-y-3 text-gray-600">
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Durée du cycle personnalisable :</strong> Ajustez la durée de votre
                    cycle dans les paramètres (20-40 jours)</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Suppression :</strong> Allez dans "Périodes enregistrées" et cliquez
                    sur l'icone ❌"</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Stockage flexible :</strong> Choisissez entre stockage local ou
                    synchronisation cloud</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Export/Import :</strong> Sauvegardez et restaurez vos données
                    facilement</span
                  >
                </div>
                <div class="flex items-start gap-2">
                  <span class="text-pink-500 mt-1">•</span>
                  <span
                    ><strong>Passage du local au cloud :</strong> Vous pouvez mettre à jour la base
                    de données. Firebase ou pas. À vous de choisir.</span
                  >
                </div>
              </div>
            </section>

            <!-- Section 4 -->
            <section class="bg-pink-50 p-4 rounded-lg">
              <h3 class="text-xl font-semibold text-pink-800 mb-3 flex items-center gap-2">
                💡 Conseils d'utilisation
              </h3>
              <div class="space-y-2 text-pink-700">
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span
                    >Enregistrez régulièrement le début de vos règles pour des prédictions plus
                    précises</span
                  >
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span>Les prédictions s'améliorent avec le temps et plus de données</span>
                </p>
                <p class="flex items-start gap-2">
                  <span class="mt-1">•</span>
                  <span>N'hésitez pas à ajuster la durée de votre cycle si elle change</span>
                </p>
              </div>
            </section>

            <!-- Section 5 -->
            <section class="bg-yellow-50 border-yellow-400 p-4 rounded">
              <h3 class="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                ⚠️ Avertissement médical
              </h3>
              <p class="text-yellow-700 text-sm leading-relaxed">
                Cette application est un outil de suivi personnel et ne remplace pas l'avis d'un
                professionnel de santé.
              </p>
            </section>

            <!-- Section 6 -->
            <section class="bg-yellow-50 border-yellow-400 p-4 rounded">
              <h3 class="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                🐞 Signaler un bug
              </h3>
              <p class="text-yellow-700 text-sm leading-relaxed">
                Si vous rencontrez une anomalie, créez une issue sur GitHub :
                <a
                  href="https://github.com/antoinecarto/d_day/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-blue-600 hover:underline break-all"
                >
                  https://github.com/antoinecarto/d_day/issues
                </a>
              </p>
            </section>
            <!-- Section 7 -->

            <section class="bg-yellow-50 border-yellow-400 p-4 rounded">
              <h3 class="text-lg font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                📜 Licence
              </h3>
              <p class="text-yellow-700 text-sm leading-relaxed">
                Ce projet est sous licence [GNU GPL v3]
                <a href="https://www.gnu.org/licenses/gpl-3.0.html">gpl-3</a>
              </p>
            </section>
          </div>

          <!-- Pied de page -->
          <div class="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
            <button
              @click="close"
              class="w-full px-4 py-2 bg-pink-600 text-white rounded-lg font-medium hover:bg-pink-700 transition-colors"
            >
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: Boolean,
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<style scoped>
.popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border: 2px solid black;
  padding: 1em 2em;
  z-index: 100;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scrollable {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 #f7fafc;
}
</style>
