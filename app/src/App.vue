<template>
  <div class="app-container">
    <aside class="sidebar">
      <nav>
        <ul>
          <li><router-link to="/">Профиль</router-link></li>
          <li><router-link to="/organizations">Организации</router-link></li>
          <li><router-link to="/departments">Отделы</router-link></li>
          <li><router-link to="/positions">Должности</router-link></li>
          <li><router-link to="/workers">Сотрудники</router-link></li>
          <li><router-link to="/personnel-operations">Кадровые операции</router-link></li>
          <li><router-link to="/history">История изменений</router-link></li>
          <li><router-link to="/users">Пользователи</router-link></li>
        </ul>
      </nav>
    </aside>

    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// тут потом добавить логику проверки авторизации и т.п.
</script>
