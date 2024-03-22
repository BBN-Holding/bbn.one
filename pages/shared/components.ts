import type { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartType, DefaultDataPoint } from "https://esm.sh/chart.js/auto";
import { Box, Custom, lazyInit, loadingWheel } from "webgen/mod.ts";

export const LoadingSpinner = () => Box(Custom(loadingWheel() as Element as HTMLElement)).addClass("loading");

const lazyChart = lazyInit(() => import("https://esm.sh/chart.js/auto"));

export const Chart = <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>) => {
    const canvas = document.createElement("canvas");

    lazyChart().then((chartjs) => new chartjs.Chart(canvas, config));

    return Box(Custom(canvas).addClass("chart"));
};
