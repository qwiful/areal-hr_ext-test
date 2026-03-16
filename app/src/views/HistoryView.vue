<template>
  <div>
    <h1>История изменений</h1>
    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: flex-end">
      <div>
        <label>Фильтр по объекту:</label>
        <select v-model="filter.object" @change="fetchHistory" style="width: 200px">
          <option value="">Все</option>
          <option value="Организация">Организация</option>
          <option value="Отдел">Отдел</option>
          <option value="Должность">Должность</option>
          <option value="Сотрудник">Сотрудник</option>
          <option value="Файл">Файл</option>
          <option value="Кадровая операция">Кадровая операция</option>
        </select>
      </div>
      <button @click="fetchHistory">Обновить</button>
    </div>

    <table v-if="history.length">
      <thead>
        <tr>
          <th>ID</th>
          <th>Дата и время</th>
          <th>Кто изменил</th>
          <th>Объект</th>
          <th>Изменённые данные</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="h in history" :key="h.id">
          <td>{{ h.id }}</td>
          <td>{{ formatDateTime(h.add_at) }}</td>
          <td>{{ h.specialist_name || 'ID: ' + h.who_changed }}</td>
          <td>{{ h.object }}</td>
          <td style="max-width: 400px; overflow: hidden; text-overflow: ellipsis">
            <details>
              <summary>Показать</summary>
              <pre style="white-space: pre-wrap; font-size: 12px">{{
                formatJson(h.changed_field)
              }}</pre>
            </details>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>Нет записей в истории</p>

    <div v-if="history.length" style="margin-top: 10px; display: flex; gap: 10px">
      <button :disabled="offset === 0" @click="prevPage">← Назад</button>
      <span style="padding: 8px">Страница {{ page }}</span>
      <button :disabled="history.length < limit" @click="nextPage">Вперёд →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/modules/api'

const history = ref([])
const filter = ref({ object: '' })
const limit = 20
const offset = ref(0)

const page = computed(() => Math.floor(offset.value / limit) + 1)

const formatDateTime = (d) =>
  d ? new Date(d).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'medium' }) : '—'

const formatJson = (data) => {
  try {
    return typeof data === 'string'
      ? JSON.stringify(JSON.parse(data), null, 2)
      : JSON.stringify(data, null, 2)
  } catch {
    return String(data)
  }
}

const fetchHistory = async () => {
  try {
    const params = { limit, offset: offset.value }
    if (filter.value.object) params.object = filter.value.object
    const res = await api.get('/history', { params })
    history.value = res.data
  } catch (error) {
    console.error('Ошибка:', error)
    alert('Не удалось загрузить историю')
  }
}

const prevPage = () => {
  offset.value = Math.max(0, offset.value - limit)
  fetchHistory()
}

const nextPage = () => {
  offset.value += limit
  fetchHistory()
}

onMounted(fetchHistory)
</script>
