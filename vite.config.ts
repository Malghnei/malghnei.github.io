import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({ 
    plugins: [tailwindcss(), sveltekit()],
    base: '/malghnei.github.io/',
    test: {
        include: ['src/**/*.test.ts'],
        environment: 'node'
    }
});
