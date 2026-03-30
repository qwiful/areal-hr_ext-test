import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.fetchUser().finally(() => {
  app.mount('#app')
})
