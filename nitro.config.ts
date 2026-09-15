// Nitro configuration for TanStack Start.
// Sets the deployment preset to Vercel so that `nitro build` outputs
// to .vercel/output in the format Vercel Functions expects.
//
// The NITRO_PRESET env var (set in the build script) takes precedence,
// but this default ensures the correct preset is always used.
export default {
  preset: process.env["NITRO_PRESET"] ?? "vercel",
};
