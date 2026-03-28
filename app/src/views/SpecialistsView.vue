<template>
  <div>
    <h1>Пользователи</h1>
    <button @click="openCreateModal">Добавить пользователя</button>
    <table v-if="specialists.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Фамилия</th>
          <th>Имя</th>
          <th>Отчество</th>
          <th>Логин</th>
          <th>Роль</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in specialists" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.surname }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.patronymic || '—' }}</td>
          <td>{{ s.login }}</td>
          <td>{{ roleLabels[s.role_name] || s.role_name }}</td>
          <td>
            <button @click="editSpecialist(s)">Ред.</button>
            <button class="danger" @click="deleteSpecialist(s.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет пользователей</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>
          {{ modalMode === 'create' ? 'Добавить пользователя' : 'Редактировать пользователя' }}
        </h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>Фамилия:</label>
            <input v-model="form.surname" required />
          </div>
          <div>
            <label>Имя:</label>
            <input v-model="form.name" required />
          </div>
          <div>
            <label>Отчество:</label>
            <input v-model="form.patronymic" />
          </div>
          <div>
            <label>Логин:</label>
            <input v-model="form.login" required minlength="3" maxlength="20" />
          </div>
          <div>
            <label>{{
              modalMode === 'create' ? 'Пароль:' : 'Новый пароль (оставьте пустым чтобы не менять):'
            }}</label>
            <input
              v-model="form.password"
              type="password"
              :required="modalMode === 'create'"
              minlength="6"
            />
          </div>
          <div>
            <label>Роль:</label>
            <select v-model="form.id_role" required>
              <option :value="null" disabled>— выберите —</option>
              <option v-for="r in roles" :key="r.id" :value="r.id">
                {{ roleLabels[r.role] || r.role }}
              </option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="submit">Сохранить</button>
            <button type="button" @click="closeModal">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/modules/api'

const specialists = ref([])
const roles = ref([])
const showModal = ref(false)
const modalMode = ref('create')
const currentId = ref(null)

const roleLabels = {
  admin: 'Администратор',
  manager: 'Менеджер по персоналу',
}

const emptyForm = () => ({
  surname: '',
  name: '',
  patronymic: '',
  login: '',
  password: '',
  id_role: null,
})
const form = ref(emptyForm())

const fetchSpecialists = async () => {
  try {
    const res = await api.get('/specialists')
    specialists.value = res.data
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось загрузить список пользователей')
  }
}

const fetchRoles = async () => {
  try {
    const res = await api.get('/specialists/roles')
    roles.value = res.data
  } catch (error) {
    console.error('Ошибка загрузки ролей:', error)
  }
}

onMounted(async () => {
  await fetchRoles()
  await fetchSpecialists()
})

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = emptyForm()
  currentId.value = null
  showModal.value = true
}

const editSpecialist = (s) => {
  modalMode.value = 'edit'
  form.value = {
    surname: s.surname,
    name: s.name,
    patronymic: s.patronymic || '',
    login: s.login,
    password: '',
    id_role: s.id_role,
  }
  currentId.value = s.id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    const data = { ...form.value }

    if (modalMode.value === 'edit' && !data.password) {
      delete data.password
    }

    if (modalMode.value === 'create') {
      await api.post('/specialists', data)
    } else {
      await api.put(`/specialists/${currentId.value}`, data)
    }
    closeModal()
    await fetchSpecialists()
  } catch (error) {
    console.error('Ошибка:', error)
    const msg = error.response?.data?.error || 'Ошибка при сохранении'
    alert(msg)
  }
}

const deleteSpecialist = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить пользователя?')) return
  try {
    await api.delete(`/specialists/${id}`)
    await fetchSpecialists()
  } catch (error) {
    console.error('Ошибка:', error)
    alert(error.response?.data?.error || 'Не удалось удалить')
  }
}
</script>
