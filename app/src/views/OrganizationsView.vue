<template>
  <div>
    <h1>Организации</h1>
    <button @click="openCreateModal">Добавить организацию</button>
    <table v-if="organizations.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Комментарий</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="org in organizations" :key="org.id">
          <td>{{ org.id }}</td>
          <td>{{ org.name }}</td>
          <td>{{ org.comment }}</td>
          <td>
            <button @click="editOrganization(org)">Редактировать</button>
            <button class="danger" @click="deleteOrganization(org.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет организаций</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Добавить организацию' : 'Редактировать организацию' }}</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>Название:</label>
            <input v-model="form.name" required />
          </div>
          <div>
            <label>Комментарий:</label>
            <textarea v-model="form.comment" required></textarea>
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

const organizations = ref([])
const showModal = ref(false)
const modalMode = ref('create')
const currentId = ref(null)
const form = ref({ name: '', comment: '' })

const fetchOrganizations = async () => {
  try {
    const response = await api.get('/organizations')
    organizations.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки организаций:', error)
    alert('Не удалось загрузить список организаций')
  }
}

onMounted(fetchOrganizations)

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = { name: '', comment: '' }
  currentId.value = null
  showModal.value = true
}

const editOrganization = (org) => {
  modalMode.value = 'edit'
  form.value = { name: org.name, comment: org.comment }
  currentId.value = org.id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    if (modalMode.value === 'create') {
      await api.post('/organizations', form.value)
    } else {
      await api.put(`/organizations/${currentId.value}`, form.value)
    }
    closeModal()
    fetchOrganizations()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert('Ошибка при сохранении')
  }
}

const deleteOrganization = async (id) => {
  if (!confirm('Вы уверены?')) return
  try {
    await api.delete(`/organizations/${id}`)
    fetchOrganizations()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert('Не удалось удалить')
  }
}
</script>
