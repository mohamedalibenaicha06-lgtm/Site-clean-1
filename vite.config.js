import { defineConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * SITE_URL : adresse publique du site (ex. https://www.sosmenage06.fr), sans "/" final.
 *  - si définie : remplace __SITE_URL__ (canonical, Open Graph, données structurées) et génère sitemap.xml + robots.txt
 *  - si absente : les balises qui en dépendent sont retirées pour ne jamais publier d'URL inventée.
 */
const SITE_URL = (process.env.SITE_URL || '').replace(/\/$/, '');

function siteUrlPlugin() {
  return {
    name: 'site-url',
    transformIndexHtml(html) {
      if (SITE_URL) return html.replaceAll('__SITE_URL__', SITE_URL);
      return html
        .split('\n')
        .filter((l) => !/<(link|meta)[^>]*__SITE_URL__/.test(l))
        .join('\n')
        .replace(/\s*"(@id|url|logo|image)": "__SITE_URL__[^"]*",?/g, '')
        .replace(/,(\s*")/g, ',$1');
    },
    generateBundle() {
      const robots = SITE_URL
        ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
        : 'User-agent: *\nAllow: /\n';
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
      if (!SITE_URL) return;
      const today = new Date().toISOString().slice(0, 10);
      const pages = [['/', '1.0'], ['/mentions-legales.html', '0.2'], ['/confidentialite.html', '0.2']];
      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages
        .map(([p, prio]) => `  <url><loc>${SITE_URL}${p}</loc><lastmod>${today}</lastmod><priority>${prio}</priority></url>`)
        .join('\n')}\n</urlset>\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [siteUrlPlugin()],
  build: {
    target: 'es2019',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        mentions: resolve(__dirname, 'mentions-legales.html'),
        confidentialite: resolve(__dirname, 'confidentialite.html'),
      },
    },
  },
});
