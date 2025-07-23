import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'

// Composants
import landing from '@/views/landing.vue'
import apropos from '@/views/apropos.vue'
import charte from '@/views/charte.vue'
import evenement from '@/views/evenement.vue'
import register from '@/views/register.vue'
import login from '@/views/login.vue'
import boutique from '@/views/boutique.vue'
import contact from '@/views/contact.vue'
import publication from '@/views/publication.vue'
import home from '@/views/home.vue'
import EventDetail from '@/views/EventDetail/:id.vue'

const routes = [
  {
    path: '/',
    name: 'landing',
    component: landing,
    meta: { public: true }
  },
  // Redirections vers les ancres sur la landing page
  {
    path: '/apropos',
    redirect: '/#apropos'
  },
  {
    path: '/charte',
    redirect: '/#chartes'
  },
  {
    path: '/contact',
    redirect: '/#contacts'
  },
  {
    path: '/home',
    redirect: '/#home'
  },
  // Route normale
  {
    path: '/login',
    name: 'Connexion',
    component: login,
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'register',
    component: register,
    meta: { public: true }
  },
  {
    path: '/charte',
    name: 'charte',
    component: charte,
    meta: { public: true }
  },
  {
    path: '/contact',
    name: 'Contacts',
    component: contact,
    meta: { public: true }
  },
  {
    path: '/home',
    name: 'home',
    component: home,
    meta: { public: true }
  },
  {
    path: '/apropos',
    name: 'apropos',
    component: apropos,
    meta: { public: true }
  },
  {
    path: '/boutique',
    name: 'boutique',
    component: boutique,
    meta: { public: true }
  },
  {
    path: '/evenement',
    name: 'evenement',
    component: evenement,
    meta: { public: true }
  },
  {
    path: '/EventDetail/:id',
    name: 'Event Detail',
    component: EventDetail,
    meta: { public: true }
  },
  {
    path: '/publication',
    name: 'publication',
    component: publication,
    meta: { public: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})


// ✅ Garde de navigation
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')

  // Si la route n'est pas publique et qu'on n’a pas de token, on redirige vers /login
  if (!token && !to.meta.public) {
    next('/login')
  } else {
    next()
  }
})

export default router
