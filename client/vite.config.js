import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/deployment-and-devops-essentials-Puritized/', // ← your repo name
  plugins: [react()],
});