import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/Tutory/
// El base path debe coincidir con el nombre del repo. Si usas un dominio
// personalizado o un "user/organization page" (repo *.github.io), cambia
// esto a '/'.
export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? '/Tutory/',
  plugins: [react()],
})
