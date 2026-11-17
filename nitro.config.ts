// Nitro configuration for TanStack Start.
// Sets the deployment preset to Vercel so the `nitro/vite` plugin outputs
// to .vercel/output in the format Vercel Functions expects.
//
// The NITRO_PRESET env var takes precedence, but this default ensures
// the correct preset is always used.
export default {
  preset: process.env["NITRO_PRESET"] ?? "vercel",
};
