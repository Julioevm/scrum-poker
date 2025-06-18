declare module "*.css" {
    const mapping: Record<string, string>;
    export default mapping;
}
interface ImportMetaEnv {
  readonly VITE_SCRUM_POKER_SERVER?: string;
  // add more env variables here if needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
