import { createRouter, createWebHistory } from 'vue-router'
import CalendarView from '../components/CalendarView.vue'
import LoginForm from '../components/LoginForm.vue'
import { auth } from '../firebase'

const routes = [
  { path: '/', name: 'login', component: LoginForm },
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
  const requiresAuth = to.path === '/calendar'
  if (requiresAuth) {
    const user = await getCurrentUser()
    if (!user) {
      return next('/') // pas connecté → login
    }
  }
  next() // autorisé
})

export default router
