<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Вход в систему</h2>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Логин:</label>
          <input v-model="form.login" type="text" required />
        </div>
        <div>
          <label>Пароль:</label>
          <input v-model="form.password" type="password" required />
        </div>
        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="modal-actions" style="justify-content: center">
          <button type="submit" :disabled="loading">Войти</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const form = ref({ login: '', password: '' })
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(form.value)
    const redirectPath = router.currentRoute.value.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    error.value = err.response?.data?.error || 'Ошибка входа'
  } finally {
    loading.value = false
  }
}
</script>
