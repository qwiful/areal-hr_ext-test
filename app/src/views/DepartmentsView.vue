<template>
  <div>
    <h1>Отделы</h1>
    <button @click="openCreateModal">Добавить отдел</button>
    <table v-if="departments.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Название</th>
          <th>Организация</th>
          <th>Родитель</th>
          <th>Комментарий</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="dept in departments"
          :key="dept.id"
          :style="{ paddingLeft: dept.level * 20 + 'px' }"
        >
          <td>{{ dept.id }}</td>
          <td>{{ dept.name }}</td>
          <td>{{ getOrganizationName(dept.id_organization) }}</td>
          <td>{{ getParentName(dept.id_parent) }}</td>
          <td>{{ dept.comment }}</td>
          <td>
            <button @click="editDepartment(dept)">Редактировать</button>
            <button class="danger" @click="deleteDepartment(dept.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет отделов</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>{{ modalMode === 'create' ? 'Добавить отдел' : 'Редактировать отдел' }}</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>Название:</label>
            <input v-model="form.name" required />
          </div>
          <div>
            <label>Организация:</label>
            <select v-model="form.id_organization" required>
              <option v-for="org in organizations" :key="org.id" :value="org.id">
                {{ org.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Родительский отдел (необязательно):</label>
            <select v-model="form.id_parent">
              <option :value="null">— нет —</option>
              <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Комментарий:</label>
            <textarea v-model="form.comment"></textarea>
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

const departments = ref([])
const organizations = ref([])
const showModal = ref(false)
const modalMode = ref('create')
const currentId = ref(null)
const form = ref({
  name: '',
  id_organization: null,
  id_parent: null,
  comment: '',
})

const orgMap = ref({})
const deptMap = ref({})

const fetchOrganizations = async () => {
  try {
    const res = await api.get('/organizations')
    organizations.value = res.data
    orgMap.value = Object.fromEntries(res.data.map((o) => [o.id, o.name]))
  } catch (error) {
    console.error('Ошибка загрузки организаций:', error)
    alert('Не удалось загрузить организации')
  }
}

const fetchDepartments = async () => {
  try {
    const res = await api.get('/departments')
    departments.value = res.data
    deptMap.value = Object.fromEntries(res.data.map((d) => [d.id, d.name]))
  } catch (error) {
    console.error('Ошибка загрузки отделов:', error)
    alert('Не удалось загрузить отделы')
  }
}

const getOrganizationName = (id) => orgMap.value[id] || id
const getParentName = (id) => (id ? deptMap.value[id] || id : '—')

onMounted(async () => {
  await fetchOrganizations()
  await fetchDepartments()
})

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = { name: '', id_organization: null, id_parent: null, comment: '' }
  currentId.value = null
  showModal.value = true
}

const editDepartment = (dept) => {
  modalMode.value = 'edit'
  form.value = {
    name: dept.name,
    id_organization: dept.id_organization,
    id_parent: dept.id_parent || null,
    comment: dept.comment,
  }
  currentId.value = dept.id
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    if (modalMode.value === 'create') {
      await api.post('/departments', form.value)
    } else {
      await api.put(`/departments/${currentId.value}`, form.value)
    }
    closeModal()
    await fetchDepartments()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    alert(error.response?.data?.error || 'Ошибка при сохранении')
  }
}

const deleteDepartment = async (id) => {
  if (!confirm('Вы уверены?')) return
  try {
    await api.delete(`/departments/${id}`)
    await fetchDepartments()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert(error.response?.data?.error || 'Не удалось удалить')
  }
}
</script>
