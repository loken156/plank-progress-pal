// src/components/ProgressGraph.tsx
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
} from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

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

interface PlankRow {
    plank_date: string;
    duration_s: number;
}

interface DataPoint {
    date: string;      // YYYY-MM-DD
    bestTime: number;  // seconds
}

interface ProgressGraphProps {
    userId: string;
}

const ProfileGraph: React.FC<ProgressGraphProps> = ({ userId }) => {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        async function load() {
            setLoading(true);

            // fetch all planks for the given userId
            const { data, error } = await supabase
                .from<PlankRow>("planks")
                .select("plank_date, duration_s")
                .eq("user_id", userId);

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            // group by date and pick max(duration_s)
            const grouped: Record<string, number[]> = {};
            (data || []).forEach((row) => {
                grouped[row.plank_date] = grouped[row.plank_date] || [];
                grouped[row.plank_date].push(row.duration_s);
            });

            const points: DataPoint[] = Object.entries(grouped)
                .map(([date, durations]) => ({
                    date,
                    bestTime: Math.max(...durations),
                }))
                .sort(
                    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
                );

            setDataPoints(points);
            setLoading(false);
        }

        load();
    }, [userId]);

    if (loading) {
        return (
            <Card>
                <CardHeader className="border-b pb-3">
                    <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="h-5 w-5 text-plank-green mr-2" />
                        Plank Development
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center text-gray-500">
                    Loading data...
                </CardContent>
            </Card>
        );
    }

    // chart.js data
    const labels = dataPoints.map((p) =>
        new Date(p.date).toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
        })
    );
    const chartData = {
        labels,
        datasets: [
            {
                label: "Best time (seconds)",
                data: dataPoints.map((p) => p.bestTime),
                fill: false,
                tension: 0.3,
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
        <Card>
            <CardHeader className="border-b pb-3">
                <CardTitle className="text-lg flex items-center">
                    <TrendingUp className="h-5 w-5 text-plank-green mr-2" />
                    Plank Development
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <div className="h-60">
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileGraph;
