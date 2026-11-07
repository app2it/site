import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://app2it.com',
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'app2it docs',
      description: 'Guides for app2it, the production home for AI-built internal tools.',
      disable404Route: true,
      pagefind: false,
      head: [
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: 'https://static.cloudflareinsights.com/beacon.min.js',
            'data-cf-beacon': '{"token": "bb94850de0904b3c807dc6f14a1a56a0"}',
          },
        },
      ],
      customCss: ['./src/styles/docs.css'],
      social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/app2it' }],
      sidebar: [{ label: 'Start here', items: [{ label: 'Overview', slug: 'docs' }] }],
    }),
  ],
});
