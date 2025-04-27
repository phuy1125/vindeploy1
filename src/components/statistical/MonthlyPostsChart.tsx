"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PostStats {
  _id: { year: number; month: number };
  count: number;
}

const PostStatsChart = () => {
  const [data, setData] = useState<PostStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/MonthlyPostsChart");
        const stats: PostStats[] = await response.json();
        setData(stats);
      } catch (error) {
        console.error("Error fetching post stats:", error);
      }
    };

    fetchData();
  }, []);

  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const chartData = {
    labels: months,
    datasets: [
      {
        label: "Posts per Month",
        data: months.map((month, index) => {
          const monthData = data.find((item) => item._id.month === index + 1);
          return monthData ? monthData.count : 0;
        }),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // ⚡ CHỈ THÊM DÒNG NÀY LÀ FIX ĐƯỢC
    plugins: {
      legend: { position: "top" as const },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
      }
    }
  };

  return <Line data={chartData} options={chartOptions} />;
};

export default PostStatsChart;
