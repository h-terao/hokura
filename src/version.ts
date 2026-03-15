import denoConfig from "../deno.json" with { type: "json" };

export const VERSION: string = denoConfig.version === "0.0.0"
  ? "dev"
  : denoConfig.version ?? "dev";
