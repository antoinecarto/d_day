<!-- MigrationPopup.vue -->
<template>
  <teleport to="body">
    <div v-if="isVisible" class="migration-popup-overlay" @click.self="$emit('cancel')">
      <div class="migration-popup-container">
        <!-- Header -->
        <header class="migration-popup-header">
          <h4 class="migration-popup-title">🔄 Migration vers Firebase</h4>
          <button class="migration-popup-close" :disabled="isProcessing" @click="$emit('cancel')">
            ×
          </button>
        </header>

        <!-- Content -->
        <section class="migration-popup-content">
          <div class="migration-popup-info">
            <p class="migration-popup-info-title">📊 Données existantes détectées</p>
            <p class="migration-popup-info-text">
              Vous avez <strong>{{ periodsCount }} période(s)</strong> enregistrée(s) localement.
            </p>
          </div>

          <p class="migration-popup-question">Que souhaitez-vous faire avec ces données ?</p>

          <!-- Options -->
          <div class="migration-popup-options">
            <!-- Option 1: Transférer -->
            <button
              class="migration-popup-option migration-popup-option-primary"
              :disabled="isProcessing"
              @click="$emit('migrate-with-data')"
            >
              <div class="migration-popup-option-icon">📤</div>
              <div class="migration-popup-option-content">
                <div class="migration-popup-option-title">Transférer vers Firebase</div>
                <div class="migration-popup-option-subtitle">
                  Copier toutes les données locales vers le cloud
                </div>
              </div>
            </button>

            <!-- Option 2: Recommencer -->
            <button
              class="migration-popup-option migration-popup-option-secondary"
              :disabled="isProcessing"
              @click="$emit('migrate-without-data')"
            >
              <div class="migration-popup-option-icon">🆕</div>
              <div class="migration-popup-option-content">
                <div class="migration-popup-option-title">Commencer à zéro</div>
                <div class="migration-popup-option-subtitle">
                  Ignorer les données locales et démarrer une nouvelle base
                </div>
              </div>
            </button>
          </div>

          <!-- Actions -->
          <footer class="migration-popup-actions">
            <button
              class="migration-popup-cancel"
              :disabled="isProcessing"
              @click="$emit('cancel')"
            >
              Annuler
            </button>
          </footer>
        </section>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
interface Props {
  isVisible: boolean
  periodsCount: number
  isProcessing?: boolean
}

defineProps<Props>()

defineEmits<{
  'migrate-with-data': []
  'migrate-without-data': []
  cancel: []
}>()
</script>

<style>
/* Reset et styles absolus pour éviter l'héritage */
.migration-popup-overlay {
  position: fixed;
  inset: 0; /* équivalent à top:0; right:0; bottom:0; left:0 */
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999; /* très élevé pour passer devant tout */
}

.migration-popup-container {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.migration-popup-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 20px !important;
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  border-radius: 10px 10px 0 0 !important;
}

.migration-popup-title {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #1e293b !important;
  margin: 0 !important;
}

.migration-popup-close {
  background: #ef4444 !important;
  border: none !important;
  border-radius: 50% !important;
  width: 30px !important;
  height: 30px !important;
  font-size: 18px !important;
  color: white !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.2s !important;
}

.migration-popup-close:hover:not(:disabled) {
  background: #dc2626 !important;
  transform: scale(1.1) !important;
}

.migration-popup-close:disabled {
  opacity: 0.5 !important;
  cursor: not-allowed !important;
}

.migration-popup-content {
  padding: 20px !important;
}

.migration-popup-info {
  background: #dbeafe !important;
  border: 1px solid #3b82f6 !important;
  border-radius: 8px !important;
  padding: 15px !important;
  margin-bottom: 20px !important;
}

.migration-popup-info-title {
  color: #1e40af !important;
  font-weight: 600 !important;
  margin: 0 0 8px 0 !important;
  font-size: 14px !important;
}

.migration-popup-info-text {
  color: #1d4ed8 !important;
  font-size: 14px !important;
  margin: 0 !important;
}

.migration-popup-question {
  color: #374151 !important;
  margin: 0 0 20px 0 !important;
  font-size: 16px !important;
}

.migration-popup-options {
  display: flex !important;
  flex-direction: column !important;
  gap: 15px !important;
  margin-bottom: 20px !important;
}

.migration-popup-option {
  display: flex !important;
  align-items: center !important;
  gap: 15px !important;
  padding: 15px !important;
  border: 2px solid transparent !important;
  border-radius: 8px !important;
  background: none !important;
  cursor: pointer !important;
  text-align: left !important;
  transition: all 0.2s !important;
  width: 100% !important;
}

.migration-popup-option-primary {
  background: #dbeafe !important;
  border-color: #3b82f6 !important;
}

.migration-popup-option-primary:hover:not(:disabled) {
  background: #bfdbfe !important;
  border-color: #1d4ed8 !important;
  transform: translateY(-2px) !important;
}

.migration-popup-option-secondary {
  background: #fef3c7 !important;
  border-color: #f59e0b !important;
}

.migration-popup-option-secondary:hover:not(:disabled) {
  background: #fde68a !important;
  border-color: #d97706 !important;
  transform: translateY(-2px) !important;
}

.migration-popup-option:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.migration-popup-option-icon {
  font-size: 24px !important;
  transition: transform 0.2s !important;
}

.migration-popup-option:hover:not(:disabled) .migration-popup-option-icon {
  transform: scale(1.2) !important;
}

.migration-popup-option-content {
  flex: 1 !important;
}

.migration-popup-option-title {
  font-weight: 600 !important;
  margin-bottom: 5px !important;
}

.migration-popup-option-primary .migration-popup-option-title {
  color: #1e40af !important;
}

.migration-popup-option-secondary .migration-popup-option-title {
  color: #92400e !important;
}

.migration-popup-option-subtitle {
  font-size: 13px !important;
  opacity: 0.8 !important;
}

.migration-popup-option-primary .migration-popup-option-subtitle {
  color: #1d4ed8 !important;
}

.migration-popup-option-secondary .migration-popup-option-subtitle {
  color: #a16207 !important;
}

.migration-popup-actions {
  border-top: 1px solid #e2e8f0 !important;
  padding-top: 20px !important;
}

.migration-popup-cancel {
  width: 100% !important;
  padding: 12px 16px !important;
  background: #f1f5f9 !important;
  color: #475569 !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 6px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
}

.migration-popup-cancel:hover:not(:disabled) {
  background: #e2e8f0 !important;
  border-color: #94a3b8 !important;
}

.migration-popup-cancel:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .migration-popup-overlay {
    padding: 10px !important;
  }

  .migration-popup-header,
  .migration-popup-content {
    padding: 15px !important;
  }

  .migration-popup-option {
    padding: 12px !important;
  }

  .migration-popup-option-icon {
    font-size: 20px !important;
  }
}
</style>
