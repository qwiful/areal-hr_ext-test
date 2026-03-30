<template>
  <div v-if="!isLoginPage" class="app-container">
    <aside class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/organizations">Организации</router-link></li>
          <li><router-link to="/departments">Отделы</router-link></li>
          <li><router-link to="/positions">Должности</router-link></li>
          <li><router-link to="/workers">Сотрудники</router-link></li>
          <li><router-link to="/personnel-operations">Кадровые операции</router-link></li>
          <li><router-link to="/history">История изменений</router-link></li>
          <li v-if="isAdmin"><router-link to="/specialists">Пользователи</router-link></li>
          <li><button class="logout-btn" @click="logout">Выйти</button></li>
        </ul>
      </nav>
    </aside>
    <main class="content">
      <router-view />
    </main>
  </div>
  <router-view v-else />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isLoginPage = computed(() => route.path === '/login')
const isAdmin = computed(() => authStore.role === 'admin')

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
