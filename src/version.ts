import denoConfig from "../deno.json" with { type: "json" };

export const VERSION: string = denoConfig.version ?? "dev";
