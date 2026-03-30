import { createRouter, createWebHistory } from 'vue-router'
import OrganizationsView from '../views/OrganizationsView.vue'
import DepartmentsView from '../views/DepartmentsView.vue'
import PositionsView from '../views/PositionsView.vue'
import WorkersView from '../views/WorkersView.vue'
import PersonnelOperationsView from '../views/PersonnelOperationsView.vue'
import HistoryView from '../views/HistoryView.vue'
import SpecialistsView from '../views/SpecialistsView.vue'
import LoginView from '../views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/organizations' },
  {
    path: '/organizations',
    component: OrganizationsView,
    meta: { title: 'Организации', requiresAuth: true },
  },
  {
    path: '/departments',
    component: DepartmentsView,
    meta: { title: 'Отделы', requiresAuth: true },
  },
  {
    path: '/positions',
    component: PositionsView,
    meta: { title: 'Должности', requiresAuth: true },
  },
  { path: '/workers', component: WorkersView, meta: { title: 'Сотрудники', requiresAuth: true } },
  {
    path: '/personnel-operations',
    component: PersonnelOperationsView,
    meta: { title: 'Кадровые операции', requiresAuth: true },
  },
  {
    path: '/history',
    component: HistoryView,
    meta: { title: 'История изменений', requiresAuth: true },
  },
  {
    path: '/specialists',
    component: SpecialistsView,
    meta: { title: 'Пользователи', requiresAuth: true, role: 'admin' },
  },
  { path: '/login', component: LoginView, meta: { requiresAuth: false } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.loaded) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.role && authStore.role !== to.meta.role) {
    next('/')
  } else {
    next()
  }
})

export default router
