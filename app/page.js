"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale);

export default function Page() {
  const [values, setValues] = useState([]);
  const [input, setInput] = useState("");

  // fetch stored data from API
  useEffect(() => {
    fetch("/api/data")
      .then(res => res.json())
      .then(setValues);
  }, []);

  const chartData = {
    labels: values.map((_, i) => i + 1),
    datasets: [
      {
        label: "My Data",
        data: values
      }
    ]
  };

  const pushData = () => {
    const num = Number(input);
    if (!isNaN(num)) {
      fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: num })
      })
        .then(res => res.json())
        .then(() => {
          setValues([...values, num]);
          setInput("");
        });
    }
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Vercel Graph Page</h1>

      <div>
        <input
          type="number"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a number"
        />
        <button onClick={pushData}>Add Data</button>
      </div>

      <Line data={chartData} />
    </main>
  );
}
