import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../components/CalendarView.vue'
import LoginForm from '../components/LoginForm.vue'
import { auth } from '../firebase'

const routes = [
  {
    path: '/',
    name: 'home',
    redirect: () => {
      // Vérifier les préférences de stockage au démarrage
      const storagePreference = localStorage.getItem('storagePreference')

      if (storagePreference === 'local') {
        return '/calendar'
      } else if (storagePreference === 'cloud') {
        return '/login'
      } else {
        // Première visite - aller vers login pour choisir le mode de stockage
        return '/login'
      }
    },
  },
  { path: '/login', name: 'login', component: LoginForm },
  { path: '/calendar', name: 'calendar', component: CalendarView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Fonction qui retourne une Promise qui attend que Firebase ait chargé l'utilisateur
function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe()
      resolve(user)
    }, reject)
  })
}

router.beforeEach(async (to, from, next) => {
  const storagePreference = localStorage.getItem('storagePreference')

  // Si on va vers /calendar, vérifier les conditions d'accès
  if (to.path === '/calendar') {
    if (storagePreference === 'cloud') {
      // Mode cloud : vérifier l'authentification Firebase
      const user = await getCurrentUser()
      if (!user) {
        return next('/login') // pas connecté → login
      }
    } else if (storagePreference === 'local') {
      // Mode local : accès direct autorisé
      return next()
    } else {
      // Pas de préférence définie → aller vers login pour choisir
      return next('/login')
    }
  }

  // Si on va vers /login et qu'on est déjà en mode local, rediriger vers calendar
  if (to.path === '/login' && storagePreference === 'local') {
    return next('/calendar')
  }

  next() // autorisé dans tous les autres cas
})

export default router
