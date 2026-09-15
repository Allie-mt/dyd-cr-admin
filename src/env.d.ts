/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_BASEAPI: string;
  readonly VITE_APP_KEY: string;
  readonly VITE_APP_VALUE: string;
  readonly VITE_TOS_REGION: string;
  readonly VITE_TOS_ENDPOINT: string;
  readonly VITE_TOS_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
