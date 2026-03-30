<template>
  <div>
    <h1>Сотрудники</h1>
    <button @click="openCreateModal">Добавить сотрудника</button>
    <table v-if="workers.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Фамилия</th>
          <th>Имя</th>
          <th>Отчество</th>
          <th>Дата рождения</th>
          <th>Паспорт</th>
          <th>Адрес</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="w in workers" :key="w.id">
          <td>{{ w.id }}</td>
          <td>{{ w.surname }}</td>
          <td>{{ w.name }}</td>
          <td>{{ w.patronymic || '—' }}</td>
          <td>{{ formatDate(w.date_of_birth) }}</td>
          <td>{{ w.passport_series }} {{ w.passport_number }}</td>
          <td>{{ w.locality }}, {{ w.street }}, {{ w.house }}</td>
          <td>
            <button @click="editWorker(w)">Ред.</button>
            <button @click="openFilesModal(w)">Файлы</button>
            <button class="danger" @click="deleteWorker(w.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет сотрудников</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content wide">
        <h3>{{ modalMode === 'create' ? 'Добавить сотрудника' : 'Редактировать сотрудника' }}</h3>
        <form @submit.prevent="submitForm" class="worker-form-grid">
          <div class="form-section">
            <h4>Личные данные</h4>
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
              <label>Дата рождения:</label>
              <input v-model="form.date_of_birth" type="date" required />
            </div>
          </div>

          <div class="form-section">
            <h4>Паспортные данные</h4>
            <div>
              <label>Серия:</label>
              <input v-model="form.passport.series" required />
            </div>
            <div>
              <label>Номер:</label>
              <input v-model="form.passport.number" required />
            </div>
            <div>
              <label>Дата выдачи:</label>
              <input v-model="form.passport.date_issue" type="date" required />
            </div>
            <div>
              <label>Код подразделения:</label>
              <input v-model="form.passport.unit_kod" required />
            </div>
            <div>
              <label>Кем выдан:</label>
              <input v-model="form.passport.issued_by_whom" required />
            </div>
          </div>

          <div class="form-section">
            <h4>Адрес</h4>
            <div>
              <label>Регион:</label>
              <input v-model="form.address.region" required />
            </div>
            <div>
              <label>Населённый пункт:</label>
              <input v-model="form.address.locality" required />
            </div>
            <div>
              <label>Улица:</label>
              <input v-model="form.address.street" required />
            </div>
            <div>
              <label>Дом:</label>
              <input v-model="form.address.house" required />
            </div>
            <div>
              <label>Корпус:</label>
              <input v-model="form.address.building" />
            </div>
            <div>
              <label>Квартира:</label>
              <input v-model="form.address.apartment" />
            </div>
          </div>

          <div class="modal-actions full-width">
            <button type="submit">Сохранить</button>
            <button type="button" @click="closeModal">Отмена</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showFilesModal" class="modal">
      <div class="modal-content" style="width: 500px">
        <h3>Файлы: {{ selectedWorkerName }}</h3>
        <table v-if="workerFiles.length" style="margin-bottom: 15px">
          <thead>
            <tr>
              <th>Название</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="f in workerFiles" :key="f.id">
              <td>{{ f.name }}</td>
              <td>
                <button @click="downloadFile(f.id)">Скачать</button>
                <button class="danger" @click="deleteFile(f.id)">Удалить</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else style="margin-bottom: 15px">Нет файлов</p>

        <h4 style="margin-bottom: 5px">Загрузить файл</h4>
        <div>
          <label>Название:</label>
          <input v-model="fileForm.name" />
        </div>
        <div>
          <label>Файл:</label>
          <input type="file" @change="onFileSelect" />
        </div>
        <div class="modal-actions">
          <button @click="uploadFile" :disabled="!fileForm.name || !fileForm.file">
            Загрузить
          </button>
          <button @click="showFilesModal = false">Закрыть</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/modules/api'

const workers = ref([])
const showModal = ref(false)
const modalMode = ref('create')
const currentId = ref(null)

const emptyForm = () => ({
  surname: '',
  name: '',
  patronymic: '',
  date_of_birth: '',
  passport: { series: '', number: '', date_issue: '', unit_kod: '', issued_by_whom: '' },
  address: { region: '', locality: '', street: '', house: '', building: '', apartment: '' },
})
const form = ref(emptyForm())

const showFilesModal = ref(false)
const selectedWorkerId = ref(null)
const selectedWorkerName = ref('')
const workerFiles = ref([])
const fileForm = ref({ name: '', file: null })

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ru-RU') : '—')

const fetchWorkers = async () => {
  try {
    const res = await api.get('/workers')
    workers.value = res.data
  } catch (error) {
    console.error('Ошибка загрузки:', error)
    alert('Не удалось загрузить список сотрудников')
  }
}

onMounted(fetchWorkers)

const openCreateModal = () => {
  modalMode.value = 'create'
  form.value = emptyForm()
  currentId.value = null
  showModal.value = true
}

const editWorker = async (w) => {
  try {
    const res = await api.get(`/workers/${w.id}`)
    const data = res.data
    modalMode.value = 'edit'
    form.value = {
      surname: data.surname,
      name: data.name,
      patronymic: data.patronymic || '',
      date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : '',
      passport: {
        series: data.passport?.series || '',
        number: data.passport?.number || '',
        date_issue: data.passport?.date_issue ? data.passport.date_issue.slice(0, 10) : '',
        unit_kod: data.passport?.unit_kod || '',
        issued_by_whom: data.passport?.issued_by_whom || '',
      },
      address: {
        region: data.address?.region || '',
        locality: data.address?.locality || '',
        street: data.address?.street || '',
        house: data.address?.house || '',
        building: data.address?.building || '',
        apartment: data.address?.apartment || '',
      },
    }
    currentId.value = w.id
    showModal.value = true
  } catch (error) {
    console.error('Ошибка загрузки данных:', error)
    alert('Не удалось загрузить данные сотрудника')
  }
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    if (modalMode.value === 'create') {
      await api.post('/workers', form.value)
    } else {
      await api.put(`/workers/${currentId.value}`, form.value)
    }
    closeModal()
    await fetchWorkers()
  } catch (error) {
    console.error('Ошибка сохранения:', error)
    const msg = error.response?.data?.error || 'Ошибка при сохранении'
    alert(msg)
  }
}

const deleteWorker = async (id) => {
  if (!confirm('Вы уверены?')) return
  try {
    await api.delete(`/workers/${id}`)
    await fetchWorkers()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert(error.response?.data?.error || 'Не удалось удалить')
  }
}

const openFilesModal = async (w) => {
  selectedWorkerId.value = w.id
  selectedWorkerName.value = `${w.surname} ${w.name}`
  fileForm.value = { name: '', file: null }
  try {
    const res = await api.get(`/workers/${w.id}`)
    workerFiles.value = res.data.files || []
    showFilesModal.value = true
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Ошибка загрузки файлов')
  }
}

const onFileSelect = (e) => {
  fileForm.value.file = e.target.files[0] || null
}

const uploadFile = async () => {
  if (!fileForm.value.name || !fileForm.value.file) return
  const fd = new FormData()
  fd.append('name', fileForm.value.name)
  fd.append('id_worker', selectedWorkerId.value)
  fd.append('file', fileForm.value.file)
  try {
    await api.post('/files', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    fileForm.value = { name: '', file: null }
    const res = await api.get(`/workers/${selectedWorkerId.value}`)
    workerFiles.value = res.data.files || []
  } catch (error) {
    console.error('Ошибка загрузки файла:', error)
    alert(error.response?.data?.error || 'Ошибка загрузки файла')
  }
}

const downloadFile = (id) => {
  window.open(`/api/files/${id}/download`, '_blank')
}

const deleteFile = async (id) => {
  if (!confirm('Удалить файл?')) return
  try {
    await api.delete(`/files/${id}`)
    const res = await api.get(`/workers/${selectedWorkerId.value}`)
    workerFiles.value = res.data.files || []
  } catch (error) {
    console.error('Ошибка:', error)
    alert(error.response?.data?.error || 'Не удалось удалить файл')
  }
}
</script>
