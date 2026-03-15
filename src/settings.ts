import { parse } from "@std/toml";
import { z } from "zod";
import { expandHome } from "@/utils.ts";

const SettingsSchema = z.object({
  workingDir: z.string().default("~/.local/share/hokura"),
  vars: z.record(z.unknown()).default({}),
});

export type Settings = z.infer<typeof SettingsSchema>;

const defaultSettings: Settings = SettingsSchema.parse({});

export const loadSettings = async (
  settingDir: string = "~/.config/hokura",
): Promise<Settings> => {
  const dir = expandHome(settingDir);
  try {
    await Deno.stat(dir);
  } catch {
    return defaultSettings;
  }

  let text: string;
  try {
    text = await Deno.readTextFile(`${dir}/settings.toml`);
  } catch {
    return defaultSettings;
  }
  const parsed = parse(text);

  const result = SettingsSchema.safeParse(parsed);
  if (!result.success) {
    return defaultSettings;
  }
  return result.data;
};
