"use client";

import { useEffect, useRef } from "react";
import { Chart, LineElement, PointElement, CategoryScale, LinearScale } from "chart.js";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(LineElement, PointElement, CategoryScale, LinearScale, zoomPlugin);

export default function Page() {
  const cpuRef = useRef();
  const ramRef = useRef();
  const diskRef = useRef();
  const consumptionRef = useRef();

  let cpuChart, ramChart, diskChart, consumptionChart;
  let chartLabels = [];

  const initChart = (ctx, datasets, label) =>
    new Chart(ctx, {
      type: "line",
      data: { labels: Array(100).fill(""), datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: "#0f0" } },
          zoom: { pan: { enabled: true, mode: "x" }, zoom: { wheel: { enabled: true }, mode: "x" } }
        },
        scales: {
          x: { display: false, grid: { color: "#333" } },
          y: { ticks: { color: "#0f0" }, grid: { color: "#333" }, min: 0, max: 100 }
        }
      }
    });

  const initCharts = () => {
    cpuChart = initChart(cpuRef.current, [
      { label: "Total CPU", data: Array(100).fill(0), borderColor: "#0ff", fill: true },
      { label: "Core0", data: Array(100).fill(0), borderColor: "#0f0", fill: false },
      { label: "Core1", data: Array(100).fill(0), borderColor: "#ff0", fill: false },
      { label: "Core2", data: Array(100).fill(0), borderColor: "#f0f", fill: false },
      { label: "Core3", data: Array(100).fill(0), borderColor: "#f00", fill: false }
    ]);

    ramChart = initChart(ramRef.current, [
      { label: "RAM Usage", data: Array(100).fill(0), borderColor: "#ff0", fill: true },
      { label: "SWAP Usage", data: Array(100).fill(0), borderColor: "#f0f", fill: true }
    ]);

    diskChart = initChart(diskRef.current, [
      { label: "Disk Usage", data: Array(100).fill(0), borderColor: "#f00", fill: true }
    ]);

    consumptionChart = initChart(consumptionRef.current, [
      { label: "Consumption (W)", data: Array(100).fill(0), borderColor: "#0ff", fill: true }
    ]);
  };

  const updateCharts = (rows) => {
    chartLabels = rows.map(r => r.timestamp);

    cpuChart.data.labels = chartLabels;
    cpuChart.data.datasets[0].data = rows.map(r => r.cpu.total);
    cpuChart.data.datasets[1].data = rows.map(r => r.cpu.core0);
    cpuChart.data.datasets[2].data = rows.map(r => r.cpu.core1);
    cpuChart.data.datasets[3].data = rows.map(r => r.cpu.core2);
    cpuChart.data.datasets[4].data = rows.map(r => r.cpu.core3);
    cpuChart.update();

    ramChart.data.labels = chartLabels;
    ramChart.data.datasets[0].data = rows.map(r => Math.round((r.ram.used / r.ram.total) * 100));
    ramChart.data.datasets[1].data = rows.map(r => r.swap ? Math.round((r.swap.used / r.swap.total) * 100) : 0);
    ramChart.update();

    diskChart.data.labels = chartLabels;
    diskChart.data.datasets[0].data = rows.map(r => Math.round((r.disk.used / r.disk.total) * 100));
    diskChart.update();

    consumptionChart.data.labels = chartLabels;
    consumptionChart.data.datasets[0].data = rows.map(r => r.consumption.used);
    consumptionChart.data.datasets[0].label = `Consumption (W)`;
    consumptionChart.options.scales.y.max = Math.max(...rows.map(r => r.consumption.total));
    consumptionChart.update();
  };

  const fetchMetrics = async () => {
    const resp = await fetch("/api/metrics");
    const data = await resp.json();
    updateCharts(data);
  };

  useEffect(() => {
    initCharts();
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: "#111", color: "#eee", fontFamily: "monospace", padding: 20 }}>
      <h1 style={{ textAlign: "center", color: "#0f0" }}>Raspberry Pi Metrics Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", width: "95%", margin: "0 auto" }}>
        <div style={{ background: "#1a1a1a", padding: 20, borderRadius: 10 }}><canvas ref={cpuRef} /></div>
        <div style={{ background: "#1a1a1a", padding: 20, borderRadius: 10 }}><canvas ref={ramRef} /></div>
        <div style={{ background: "#1a1a1a", padding: 20, borderRadius: 10 }}><canvas ref={diskRef} /></div>
        <div style={{ background: "#1a1a1a", padding: 20, borderRadius: 10 }}><canvas ref={consumptionRef} /></div>
      </div>
    </div>
  );
}
