// src/components/DemoProgressGraph.tsx
import React from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title as ChartTitle,
    Tooltip as ChartTooltip,
    Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ChartTitle,
    ChartTooltip,
    Legend
);

const DemoProgressGraph: React.FC = () => {
    // sample dates (last 7 days)
    const labels = [
        "Apr 20",
        "Apr 21",
        "Apr 22",
        "Apr 23",
        "Apr 24",
        "Apr 25",
        "Apr 26",
    ];

    // fake “best plank time” data (seconds) showing an upward trend
    const data = {
        labels,
        datasets: [
            {
                label: "Best Plank Time (sec)",
                data: [15, 30, 45, 60, 90, 120, 180],
                fill: false,
                tension: 0.4,
                borderColor: "orange",            // line color
                pointBackgroundColor: "yellow",  // data point fill
                pointBorderColor: "yellow",      // data point stroke
                pointRadius: 5,                  // make points more visible
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { mode: "index" as const, intersect: false },
        },
        scales: {
            x: { title: { display: true, text: "Date" } },
            y: {
                beginAtZero: true,
                title: { display: true, text: "Time (seconds)" },
            },
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="h-60 max-w-xl mx-auto">
            <Line data={data} options={options} />
        </div>
    );
};

export default DemoProgressGraph;
