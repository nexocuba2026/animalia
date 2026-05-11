import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Registrar el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/animalia/sw.js')
      .then((registration) => {
        console.log('Service Worker registrado:', registration.scope)
      })
      .catch((error) => {
        console.log('Error al registrar Service Worker:', error)
      })
  })
}