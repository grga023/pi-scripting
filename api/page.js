"use client";

import { useState } from "react";
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
  const [text, setText] = useState("");

  const values = text
    .split(",")
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v));

  const data = {
    labels: values.map((_, i) => i + 1),
    datasets: [
      {
        label: "My Data",
        data: values
      }
    ]
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Vercel Graph Page</h1>

      <p>Enter numbers separated by commas:</p>

      <textarea
        rows={4}
        style={{ width: "100%" }}
        placeholder="10,20,30,40"
        onChange={e => setText(e.target.value)}
      />

      <Line data={data} />
    </main>
  );
}
