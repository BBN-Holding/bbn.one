import { Box, Custom, loadingWheel } from "webgen/mod.ts";

export const LoadingSpinner = () => Box(Custom(loadingWheel() as Element as HTMLElement)).addClass("loading");