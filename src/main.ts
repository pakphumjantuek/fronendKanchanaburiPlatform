import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createNotivue } from 'notivue'
import 'notivue/notification.css'
import 'notivue/animations.css'

import App from './App.vue'
import router from './router'
import sweetalert from './plugins/sweetalert'
import { vuetify } from './plugins/vuetify'

const app = createApp(App)

const notivue = createNotivue({
  position: 'top-right',
  limit: 4,
})

app.use(createPinia())
app.use(router)
app.use(notivue)
app.use(sweetalert)
app.use(vuetify)

app.mount('#app')
