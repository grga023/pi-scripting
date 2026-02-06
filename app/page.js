'use client'; // Important for Next.js app directory

import { useEffect, useState, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(...registerables, zoomPlugin);

export default function Dashboard() {
  const cpuRef = useRef(null);
  const ramRef = useRef(null);
  const diskRef = useRef(null);
  const consumptionRef = useRef(null);

  const [charts, setCharts] = useState({});

  // Initialize charts once
  useEffect(() => {
    const initChart = (ctx, label, color) => new Chart(ctx, {
      type: 'line',
      data: { labels: [], datasets: [{ label, data: [], borderColor: color, backgroundColor: `${color}33`, fill: true }] },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#0f0' } },
          zoom: { pan: { enabled: true, mode: 'x' }, zoom: { wheel: { enabled: true }, pinch: { enabled: true }, mode: 'x' } }
        },
        scales: { x: { grid: { color: '#333' } }, y: { min: 0, max: 100, grid: { color: '#333' }, ticks: { color: '#0f0' } } }
      }
    });

    setCharts({
      cpu: initChart(cpuRef.current.getContext('2d'), 'CPU Usage (%)', '#0ff'),
      ram: initChart(ramRef.current.getContext('2d'), 'RAM Usage (%)', '#ff0'),
      disk: initChart(diskRef.current.getContext('2d'), 'Disk Usage (%)', '#f00'),
      consumption: initChart(consumptionRef.current.getContext('2d'), 'Consumption (W)', '#f0f')
    });
  }, []);

  // Fetch data every 5-10 seconds
  useEffect(() => {
    if (!charts.cpu) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();

        // Assuming data has the format you posted earlier
        const timestamp = data.timestamp || new Date().toISOString();
        const cpuTotal = data.cpu.total || 0;
        const ramPercent = data.ram.used && data.ram.total ? Math.round((data.ram.used / data.ram.total) * 100) : 0;
        const diskPercent = data.disk.used && data.disk.total ? Math.round((data.disk.used / data.disk.total) * 100) : 0;
        const consumption = data.consumption.used || 0;

        // Helper to update chart datasets
        const updateChart = (chart, value, label = timestamp) => {
          chart.data.labels.push(label);
          chart.data.datasets[0].data.push(value);
          // Keep last 100 points
          if (chart.data.labels.length > 100) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
          }
          chart.update();
        };

        updateChart(charts.cpu, cpuTotal);
        updateChart(charts.ram, ramPercent);
        updateChart(charts.disk, diskPercent);
        updateChart(charts.consumption, consumption);

      } catch (err) {
        console.error('Error fetching metrics:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // every 10s
    return () => clearInterval(interval);
  }, [charts]);

  return (
    <div style={{ fontFamily: 'monospace', background: '#111', color: '#eee', margin: 0, padding: 0 }}>
      <h1 style={{ textAlign: 'center', color: '#0f0', padding: '20px 0' }}>Raspberry Pi Metrics Dashboard</h1>
      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '30px',
        width: '95%',
        maxWidth: '1400px',
        margin: '0 auto 40px auto'
      }}>
        <div className="chart-container" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', boxShadow: '0 0 30px #0f0' }}>
          <canvas ref={cpuRef} style={{ background: '#222', borderRadius: '10px', height: '320px' }} />
        </div>
        <div className="chart-container" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', boxShadow: '0 0 30px #0f0' }}>
          <canvas ref={ramRef} style={{ background: '#222', borderRadius: '10px', height: '320px' }} />
        </div>
        <div className="chart-container" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', boxShadow: '0 0 30px #0f0' }}>
          <canvas ref={diskRef} style={{ background: '#222', borderRadius: '10px', height: '320px' }} />
        </div>
        <div className="chart-container" style={{ background: '#1a1a1a', padding: '30px', borderRadius: '10px', boxShadow: '0 0 30px #0f0' }}>
          <canvas ref={consumptionRef} style={{ background: '#222', borderRadius: '10px', height: '320px' }} />
        </div>
      </div>
    </div>
  );
}
