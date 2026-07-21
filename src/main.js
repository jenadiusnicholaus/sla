import { createVuestic } from 'vuestic-ui'
import 'vuestic-ui/css'
import './assets/ui.css'
import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(
  createVuestic({
    config: {
      colors: {
        variables: {
          primary: '#ff6a00',
          secondary: '#0a7a3d',
          success: '#0a7a3d',
          info: '#163566',
          danger: '#b42318',
          warning: '#ff6a00',
          backgroundPrimary: '#f4f6f9',
          backgroundSecondary: '#ffffff',
          backgroundElement: '#ffffff',
          backgroundBorder: '#e6ebf2',
          textPrimary: '#0a1f44',
          textInverted: '#ffffff',
        },
      },
    },
  }),
)

app.use(router)
app.mount('#app')
