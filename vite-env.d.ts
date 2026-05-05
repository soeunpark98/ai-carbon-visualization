/// <reference types="vite/client" />

import type * as D3Namespace from "d3";

declare global {
  const d3: typeof D3Namespace;
}

export {};
