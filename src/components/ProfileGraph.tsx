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

const ProgressGraph: React.FC = () => {
    const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            // 1) get current user
            const {
                data: { user },
                error: userErr,
            } = await supabase.auth.getUser();
            if (userErr || !user) {
                console.error(userErr);
                setLoading(false);
                return;
            }

            // 2) fetch all planks for this user
            const { data, error } = await supabase
                .from<PlankRow>("planks")
                .select("plank_date, duration_s")
                .eq("user_id", user.id);

            if (error) {
                console.error(error);
                setLoading(false);
                return;
            }

            // 3) group by date and pick max(duration_s)
            const grouped: Record<string, number[]> = {};
            data!.forEach((row) => {
                if (!grouped[row.plank_date]) grouped[row.plank_date] = [];
                grouped[row.plank_date].push(row.duration_s);
            });

            const points: DataPoint[] = Object.entries(grouped)
                .map(([date, durations]) => ({
                    date,
                    bestTime: Math.max(...durations),
                }))
                .sort(
                    (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                );

            setDataPoints(points);
            setLoading(false);
        }

        load();
    }, []);

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

    // 4) Build chart.js data
    const labels = dataPoints.map((p) =>
        new Date(p.date).toLocaleDateString("sv-SE", {
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

export default ProgressGraph;
