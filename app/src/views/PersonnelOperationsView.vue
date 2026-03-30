<template>
  <div>
    <h1>Кадровые операции</h1>
    <button @click="openCreateModal">Добавить операцию</button>
    <table v-if="operations.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Сотрудник</th>
          <th>Тип операции</th>
          <th>Отдел</th>
          <th>Должность</th>
          <th>Зарплата</th>
          <th>Дата</th>
          <th>Действия</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="op in operations" :key="op.id">
          <td>{{ op.id }}</td>
          <td>{{ op.worker_name }}</td>
          <td>{{ operationLabels[op.operation_type] || op.operation_type }}</td>
          <td>{{ op.department_name || '—' }}</td>
          <td>{{ op.position_name || '—' }}</td>
          <td>{{ op.salary ? Number(op.salary).toLocaleString('ru-RU') + ' ₽' : '—' }}</td>
          <td>{{ formatDate(op.add_at) }}</td>
          <td>
            <button class="danger" @click="deleteOperation(op.id)">Удалить</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет кадровых операций</p>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h3>Добавить кадровую операцию</h3>
        <form @submit.prevent="submitForm">
          <div>
            <label>Сотрудник:</label>
            <select v-model="form.id_worker" required>
              <option :value="null" disabled>— выберите —</option>
              <option v-for="w in workers" :key="w.id" :value="w.id">
                {{ w.surname }} {{ w.name }}
              </option>
            </select>
          </div>
          <div>
            <label>Тип операции:</label>
            <select v-model="form.operation_type" required>
              <option :value="null" disabled>— выберите —</option>
              <option value="hiring">Принятие на работу</option>
              <option value="salary_change">Изменение зарплаты</option>
              <option value="department_change">Перевод в другой отдел</option>
              <option value="dismissal">Увольнение</option>
            </select>
          </div>
          <div v-if="needsDepartment">
            <label>Отдел:</label>
            <select v-model="form.id_department" :required="needsDepartment">
              <option :value="null">— выберите —</option>
              <option v-for="d in departments" :key="d.id" :value="d.id">
                {{ d.name }}
              </option>
            </select>
          </div>
          <div v-if="needsPosition">
            <label>Должность:</label>
            <select v-model="form.id_position" :required="needsPosition">
              <option :value="null">— выберите —</option>
              <option v-for="p in positions" :key="p.id" :value="p.id">
                {{ p.name }}
              </option>
            </select>
          </div>
          <div v-if="needsSalary">
            <label>Зарплата:</label>
            <input
              v-model.number="form.salary"
              type="number"
              min="0"
              step="0.01"
              :required="needsSalary"
            />
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
import { ref, computed, onMounted } from 'vue'
import api from '@/modules/api'

const operations = ref([])
const workers = ref([])
const departments = ref([])
const positions = ref([])
const showModal = ref(false)

const operationLabels = {
  hiring: 'Принятие на работу',
  salary_change: 'Изменение зарплаты',
  department_change: 'Перевод в другой отдел',
  dismissal: 'Увольнение',
}

const emptyForm = () => ({
  id_worker: null,
  operation_type: null,
  id_department: null,
  id_position: null,
  salary: null,
})
const form = ref(emptyForm())

const needsDepartment = computed(() =>
  ['hiring', 'department_change'].includes(form.value.operation_type),
)
const needsPosition = computed(() => form.value.operation_type === 'hiring')
const needsSalary = computed(() => ['hiring', 'salary_change'].includes(form.value.operation_type))

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('ru-RU') : '—')

const fetchOperations = async () => {
  try {
    const res = await api.get('/personnel-operations')
    operations.value = res.data
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось загрузить список операций')
  }
}

const fetchLists = async () => {
  try {
    const [w, d, p] = await Promise.all([
      api.get('/workers'),
      api.get('/departments'),
      api.get('/positions'),
    ])
    workers.value = w.data
    departments.value = d.data
    positions.value = p.data
  } catch (error) {
    console.error('Ошибка загрузки справочников:', error)
  }
}

onMounted(async () => {
  await fetchLists()
  await fetchOperations()
})

const openCreateModal = () => {
  form.value = emptyForm()
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const submitForm = async () => {
  try {
    const data = { ...form.value }
    if (!needsDepartment.value) data.id_department = null
    if (!needsPosition.value) data.id_position = null
    if (!needsSalary.value) data.salary = null

    await api.post('/personnel-operations', data)
    closeModal()
    await fetchOperations()
  } catch (error) {
    console.error('Ошибка:', error)
    const msg = error.response?.data?.error || 'Ошибка при сохранении'
    alert(msg)
  }
}

const deleteOperation = async (id) => {
  if (!confirm('Вы уверены?')) return
  try {
    await api.delete(`/personnel-operations/${id}`)
    await fetchOperations()
  } catch (error) {
    console.error('Ошибка:', error)
    alert(error.response?.data?.error || 'Не удалось удалить')
  }
}
</script>
