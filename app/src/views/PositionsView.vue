<template>
  <div>
    <h1>Должности</h1>
    <button @click="openCreateModal">Добавить должность</button>
    <table v-if="positions.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pos in positions" :key="pos.id">
          <td>{{ pos.id }}</td>
          <td>{{ pos.name }}</td>
          <td>
            <button @click="editPosition(pos)">Редактировать</button>
            <button class="danger" @click="deletePosition(pos.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет должностей</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Добавить должность' : 'Редактировать должность' }}</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>Название:</label>
            <input v-model="form.name" required />
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

const positions = ref([])
const showModal = ref(false)
const modalMode = ref('create')
const currentId = ref(null)
const form = ref({ name: '' })

const fetchPositions = async () => {
  try {
    const response = await api.get('/positions')
    positions.value = response.data
  } catch (error) {
    console.error('Ошибка загрузки должностей:', error)
    alert('Не удалось загрузить список должностей')
  }
}

onMounted(fetchPositions)

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = { name: '' }
  currentId.value = null
  showModal.value = true
}

const editPosition = (pos) => {
  modalMode.value = 'edit'
  form.value = { name: pos.name }
  currentId.value = pos.id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    if (modalMode.value === 'create') {
      await api.post('/positions', form.value)
    } else {
      await api.put(`/positions/${currentId.value}`, form.value)
    }
    closeModal()
    fetchPositions()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert(error.response?.data?.error || 'Ошибка при сохранении')
  }
}

const deletePosition = async (id) => {
  if (!confirm('Вы уверены?')) return
  try {
    await api.delete(`/positions/${id}`)
    fetchPositions()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert(error.response?.data?.error || 'Не удалось удалить')
  }
}
</script>
