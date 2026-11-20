import { defineConfig } from 'vite';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

/*
  The page markup is rendered from src/content.js at dev/build time
  (src/render.js), so the HTML is static and works without JavaScript,
  while all copy stays in one file.
*/
function renderContent() {
  let server;
  return {
    name: 'watsof-render-content',
    configureServer(s) {
      server = s;
    },
    async transformIndexHtml(html) {
      const mod = server
        ? await server.ssrLoadModule('/src/render.js')
        : await import(pathToFileURL(resolve('src/render.js')).href);
      return html.replace('<!--page-->', mod.renderPage());
    },
    handleHotUpdate({ file, server: s }) {
      if (/src[\\/](content|render)\.js$/.test(file)) {
        s.moduleGraph.invalidateAll();
        s.ws.send({ type: 'full-reload' });
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [renderContent()],
  server: { port: 5173, open: false },
});
