import { Config } from "@remotion/cli/config";

// Deterministic 1080p30 H.264 output. The browser path points at the
// pre-installed headless shell when present (override with REMOTION_BROWSER).
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setConcurrency(Number(process.env.REMOTION_CONCURRENCY ?? 4));
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
