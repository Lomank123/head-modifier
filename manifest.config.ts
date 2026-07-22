import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'HeadMod',
  version: '1.1.0',
  description: 'Inject and modify HTTP request/response headers and cookies.',
  icons: {
    16: 'icon-16.png',
    32: 'icon-32.png',
    48: 'icon-48.png',
    128: 'icon-128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'HeadMod',
    default_icon: {
      16: 'icon-16.png',
      32: 'icon-32.png',
      48: 'icon-48.png',
      128: 'icon-128.png',
    },
  },
  background: { service_worker: 'src/background/worker.ts', type: 'module' },
  permissions: ['declarativeNetRequestWithHostAccess', 'storage', 'activeTab'],
  optional_host_permissions: ['<all_urls>'],
});
