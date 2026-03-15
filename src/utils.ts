export const expandHome = (path: string): string => {
  if (path === "~" || path.startsWith("~/")) {
    const home = Deno.env.get("HOME");
    if (home) return path.replace("~", home);
  }
  return path;
};

export const isDir = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);
    return stat.isDirectory;
  } catch {
    return false;
  }
};

export const isFile = async (path: string): Promise<boolean> => {
  try {
    const stat = await Deno.stat(path);
    return stat.isFile;
  } catch {
    return false;
  }
};

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

export const deepMerge = (
  ...objects: Record<string, unknown>[]
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const obj of objects) {
    for (const [key, value] of Object.entries(obj)) {
      if (isPlainObject(value) && isPlainObject(result[key])) {
        result[key] = deepMerge(result[key], value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
};

export const isDirEmpty = async (path: string): Promise<boolean> => {
  for await (const _ of Deno.readDir(path)) {
    return false;
  }
  return true;
};
