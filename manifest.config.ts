import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'HeadMod',
  version: '0.1.0',
  description: 'Inject and modify HTTP request/response headers and cookies.',
  action: { default_popup: 'src/popup/index.html', default_title: 'HeadMod' },
  background: { service_worker: 'src/background/worker.ts', type: 'module' },
  permissions: ['declarativeNetRequest', 'storage', 'activeTab'],
  optional_host_permissions: ['<all_urls>'],
});
