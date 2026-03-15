export const withFakeHome = async (
  fakeHome: string,
  fn: () => Promise<unknown>,
) => {
  const originalHome = Deno.env.get("HOME");
  Deno.env.set("HOME", fakeHome);
  try {
    await fn();
  } finally {
    if (originalHome) {
      Deno.env.set("HOME", originalHome);
    } else {
      Deno.env.delete("HOME");
    }
  }
};
