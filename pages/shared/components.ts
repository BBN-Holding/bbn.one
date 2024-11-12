import type { ChartConfiguration, ChartConfigurationCustomTypesPerDataset, ChartType, DefaultDataPoint } from "https://esm.sh/chart.js@4.4.6/auto";
import { Box, lazy } from "webgen/mod.ts";

const lazyChart = lazy(() => import("https://esm.sh/chart.js@4.4.6/auto"));

export const Chart = <TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(config: ChartConfiguration<TType, TData, TLabel> | ChartConfigurationCustomTypesPerDataset<TType, TData, TLabel>) => {
    const canvas = document.createElement("canvas");

    lazyChart().then((chartjs) => new chartjs.Chart(canvas, config));

    const component = { draw: () => canvas };

    return Box(component).addClass("chart");
};
