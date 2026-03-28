import { createRouter, createWebHistory } from 'vue-router'
import OrganizationsView from '../views/OrganizationsView.vue'
import DepartmentsView from '../views/DepartmentsView.vue'
import PositionsView from '../views/PositionsView.vue'
import WorkersView from '../views/WorkersView.vue'
import PersonnelOperationsView from '../views/PersonnelOperationsView.vue'
import HistoryView from '../views/HistoryView.vue'
import SpecialistsView from '../views/SpecialistsView.vue'
//import LoginView from '../views/LoginView.vue'

const routes = [
  { path: '/', redirect: '/organizations' },
  { path: '/organizations', component: OrganizationsView, meta: { title: 'Организации' } },
  { path: '/departments', component: DepartmentsView, meta: { title: 'Отделы' } },
  { path: '/positions', component: PositionsView, meta: { title: 'Должности' } },
  { path: '/workers', component: WorkersView, meta: { title: 'Сотрудники' } },
  {
    path: '/personnel-operations',
    component: PersonnelOperationsView,
    meta: { title: 'Кадровые операции' },
  },
  { path: '/history', component: HistoryView, meta: { title: 'История изменений' } },
  { path: '/specialists', component: SpecialistsView, meta: { title: 'Пользователи' } },
  // { path: '/login', component: LoginView, meta: { title: 'Вход' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  next()
})

export default router
