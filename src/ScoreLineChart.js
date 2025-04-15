import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ScoreLineChart({ projections }) {
  // Prepare data
  const labels = projections.map((p) =>
    p.date instanceof Date
      ? p.date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
      : String(p.date)
  );
  const data = {
    labels,
    datasets: [
      {
        label: "Score",
        data: projections.map((p) => p.score),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.15)",
        tension: 0.2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { title: { display: true, text: "Date" }, ticks: { maxTicksLimit: 8 } },
      y: { title: { display: true, text: "Score" }, beginAtZero: false },
    },
  };
  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <Line data={data} options={options} height={90} />
    </div>
  );
}
