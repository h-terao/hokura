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

export const isDirEmpty = async (path: string): Promise<boolean> => {
  for await (const _ of Deno.readDir(path)) {
    return false;
  }
  return true;
};
