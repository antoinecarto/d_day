<!-- MigrationPopup.vue -->
<template>
  <Teleport to="body">
    <div v-if="isVisible" class="migration-popup-overlay" @click.self="$emit('cancel')">
      <div class="migration-popup-container">
        <!-- Header -->
        <div class="migration-popup-header">
          <h4 class="migration-popup-title">🔄 Migration vers Firebase</h4>
          <button @click="$emit('cancel')" class="migration-popup-close" :disabled="isProcessing">
            ×
          </button>
        </div>

        <!-- Content -->
        <div class="migration-popup-content">
          <div class="migration-popup-info">
            <p class="migration-popup-info-title">📊 Données existantes détectées</p>
            <p class="migration-popup-info-text">
              Vous avez <strong>{{ periodsCount }} période(s)</strong> enregistrée(s) localement.
            </p>
          </div>

          <p class="migration-popup-question">Que souhaitez-vous faire avec ces données ?</p>

          <div class="migration-popup-options">
            <!-- Option 1: Transférer -->
            <button
              @click="$emit('migrate-with-data')"
              :disabled="isProcessing"
              class="migration-popup-option migration-popup-option-primary"
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
              @click="$emit('migrate-without-data')"
              :disabled="isProcessing"
              class="migration-popup-option migration-popup-option-secondary"
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
          <div class="migration-popup-actions">
            <button
              @click="$emit('cancel')"
              :disabled="isProcessing"
              class="migration-popup-cancel"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
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

<style scoped>
.migration-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  animation: fadeIn 0.2s ease-out;
}

.migration-popup-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  max-width: 480px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.migration-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 24px;
}

.migration-popup-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.migration-popup-close {
  background: none;
  border: none;
  font-size: 28px;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
  transition: color 0.2s;
}

.migration-popup-close:hover:not(:disabled) {
  color: #6b7280;
}

.migration-popup-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.migration-popup-content {
  padding: 0 24px 24px 24px;
}

.migration-popup-info {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.migration-popup-info-title {
  color: #1e40af;
  font-weight: 600;
  margin: 0 0 8px 0;
  font-size: 14px;
}

.migration-popup-info-text {
  color: #1d4ed8;
  font-size: 14px;
  margin: 0;
}

.migration-popup-question {
  color: #374151;
  margin: 0 0 20px 0;
  font-size: 16px;
}

.migration-popup-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.migration-popup-option {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: none;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  width: 100%;
}

.migration-popup-option-primary {
  background: #eff6ff;
  border-color: #bfdbfe;
}

.migration-popup-option-primary:hover:not(:disabled) {
  background: #dbeafe;
  border-color: #93c5fd;
  transform: translateY(-1px);
}

.migration-popup-option-secondary {
  background: #fefce8;
  border-color: #fde047;
}

.migration-popup-option-secondary:hover:not(:disabled) {
  background: #fef3c7;
  border-color: #f59e0b;
  transform: translateY(-1px);
}

.migration-popup-option:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.migration-popup-option-icon {
  font-size: 24px;
  transition: transform 0.2s;
}

.migration-popup-option:hover:not(:disabled) .migration-popup-option-icon {
  transform: scale(1.1);
}

.migration-popup-option-content {
  flex: 1;
}

.migration-popup-option-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.migration-popup-option-primary .migration-popup-option-title {
  color: #1e40af;
}

.migration-popup-option-secondary .migration-popup-option-title {
  color: #92400e;
}

.migration-popup-option-subtitle {
  font-size: 14px;
  opacity: 0.8;
}

.migration-popup-option-primary .migration-popup-option-subtitle {
  color: #1d4ed8;
}

.migration-popup-option-secondary .migration-popup-option-subtitle {
  color: #a16207;
}

.migration-popup-actions {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
}

.migration-popup-cancel {
  width: 100%;
  padding: 12px 16px;
  background: #f9fafb;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.migration-popup-cancel:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.migration-popup-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .migration-popup-overlay {
    padding: 8px;
  }

  .migration-popup-header,
  .migration-popup-content {
    padding-left: 16px;
    padding-right: 16px;
  }

  .migration-popup-option {
    padding: 12px;
  }

  .migration-popup-option-icon {
    font-size: 20px;
  }
}
</style>
