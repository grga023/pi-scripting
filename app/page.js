"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

let Chart;

export default function Page() {
  const cpuRef = useRef(null);
  const ramRef = useRef(null);
  const diskRef = useRef(null);
  const consumptionRef = useRef(null);

  let cpuChart, ramChart, diskChart, consumptionChart;

  const initCharts = () => {
    if (!cpuRef.current) return;

    // Dynamically import Chart.js and zoom plugin
    import("chart.js").then((ChartModule) => {
      Chart = ChartModule.Chart;
      const { LineElement, PointElement, CategoryScale, LinearScale } = ChartModule;
      import("chartjs-plugin-zoom").then((ZoomPlugin) => {
        Chart.register(LineElement, PointElement, CategoryScale, LinearScale, ZoomPlugin.default);

        // CPU Chart
        const ctxCPU = cpuRef.current.getContext("2d");
        cpuChart = new Chart(ctxCPU, {
          type: "line",
          data: {
            labels: Array(100).fill(""),
            datasets: [
              { label: "Total CPU", data: Array(100).fill(0), borderColor: "#0ff", backgroundColor: "rgba(0,255,255,0.2)", fill: true },
              { label: "Core0", data: Array(100).fill(0), borderColor: "#0f0", fill: false },
              { label: "Core1", data: Array(100).fill(0), borderColor: "#ff0", fill: false },
              { label: "Core2", data: Array(100).fill(0), borderColor: "#f0f", fill: false },
              { label: "Core3", data: Array(100).fill(0), borderColor: "#f00", fill: false }
            ]
          },
          options: chartOptions()
        });

        // RAM Chart
        const ctxRAM = ramRef.current.getContext("2d");
        ramChart = new Chart(ctxRAM, {
          type: "line",
          data: {
            labels: Array(100).fill(""),
            datasets: [
              { label: "RAM Usage (%)", data: Array(100).fill(0), borderColor: "#ff0", backgroundColor: "rgba(255,255,0,0.2)", fill: true },
              { label: "SWAP Usage (%)", data: Array(100).fill(0), borderColor: "#f0f", backgroundColor: "rgba(255,0,255,0.2)", fill: true }
            ]
          },
          options: chartOptions()
        });

        // Disk Chart
        const ctxDisk = diskRef.current.getContext("2d");
        diskChart = new Chart(ctxDisk, {
          type: "line",
          data: {
            labels: Array(100).fill(""),
            datasets: [
              { label: "Disk Usage (%)", data: Array(100).fill(0), borderColor: "#f00", backgroundColor: "rgba(255,0,0,0.2)", fill: true }
            ]
          },
          options: chartOptions()
        });

        // Consumption Chart
        const ctxConsumption = consumptionRef.current.getContext("2d");
        consumptionChart = new Chart(ctxConsumption, {
          type: "line",
          data: {
            labels: Array(100).fill(""),
            datasets: [
              { label: "Consumption (W)", data: Array(100).fill(0), borderColor: "#0ff", backgroundColor: "rgba(0,255,255,0.2)", fill: true }
            ]
          },
          options: chartOptions()
        });

        fetchMetrics();
        setInterval(fetchMetrics, 10000);
      });
    });
  };

  const chartOptions = () => ({
    responsive: true,
    plugins: {
      legend: { labels: { color: "#0f0" } },
      zoom: { pan: { enabled: true, mode: "x" }, zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: "x" } }
    },
    scales: {
      x: { display: false, grid: { color: "#333" } },
      y: { ticks: { color: "#0f0" }, grid: { color: "#333" }, min: 0, max: 100 }
    }
  });

  const updateCharts = (rows) => {
    if (!rows || rows.length === 0) return;

    const labels = rows.map(r => r.timestamp);

    cpuChart.data.labels = labels;
    cpuChart.data.datasets[0].data = rows.map(r => r.cpu.total);
    cpuChart.data.datasets[1].data = rows.map(r => r.cpu.core0);
    cpuChart.data.datasets[2].data = rows.map(r => r.cpu.core1);
    cpuChart.data.datasets[3].data = rows.map(r => r.cpu.core2);
    cpuChart.data.datasets[4].data = rows.map(r => r.cpu.core3);
    cpuChart.update();

    ramChart.data.labels = labels;
    ramChart.data.datasets[0].data = rows.map(r => Math.round((r.ram.used / r.ram.total) * 100));
    ramChart.data.datasets[1].data = rows.map(r => r.swap ? Math.round((r.swap.used / r.swap.total) * 100) : 0);
    ramChart.update();

    diskChart.data.labels = labels;
    diskChart.data.datasets[0].data = rows.map(r => Math.round((r.disk.used / r.disk.total) * 100));
    diskChart.update();

    consumptionChart.data.labels = labels;
    consumptionChart.data.datasets[0].data = rows.map(r => r.consumption.used);
    consumptionChart.data.datasets[0].label = `Consumption (W)`;
    consumptionChart.options.scales.y.max = Math.max(...rows.map(r => r.consumption.total));
    consumptionChart.update();
  };

  const fetchMetrics = async () => {
    try {
      const resp = await fetch("/api/metrics");
      const data = await resp.json();
      updateCharts(data);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    }
  };

  useEffect(() => {
    initCharts();
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
