export default {
  title: 'Документация по системе кадрового учёта',
  description: 'Документация по системе кадрового учёта',
  themeConfig: {
    nav: [
      { text: 'Главная', link: '/' },
      { text: 'Пользователю', link: '/user/' },
      { text: 'Администратору', link: '/admin/' },
    ],
    sidebar: {
      '/user/': [
        { text: 'Введение', link: '/user/' },
        { text: 'Вход', link: '/user/login' },
        { text: 'Организации', link: '/user/organizations' },
        { text: 'Отделы', link: '/user/departments' },
        { text: 'Должности', link: '/user/positions' },
        { text: 'Сотрудники', link: '/user/workers' },
        { text: 'Кадровые операции', link: '/user/personnel-operations' },
        { text: 'Файлы', link: '/user/files' },
        { text: 'История изменений', link: '/user/history-changes' },
      ],
      '/admin/': [
        { text: 'Введение', link: '/admin/' },
        { text: 'Установка и запуск', link: '/admin/installation' },
        { text: 'Конфигурация', link: '/admin/configuration' },
        { text: 'Запуск через Docker', link: '/admin/docker' },
        { text: 'База данных и миграции', link: '/admin/database' },
        { text: 'Пользователи и роли', link: '/admin/users-roles' },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/qwiful/areal-hr_ext-test',
      },
    ],
  },
}
