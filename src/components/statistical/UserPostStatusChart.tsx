"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Đăng ký các thành phần cần dùng
ChartJS.register(ArcElement, Tooltip, Legend);

const UserPostStatusChart = () => {
  const [data, setData] = useState<{ usersWithPosts: number; usersWithoutPosts: number } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/post-status");
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading post status...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center h-64 flex items-center justify-center">{error}</div>;
  }

  if (!data) {
    return <div className="text-center h-64 flex items-center justify-center">No data available</div>;
  }

  const totalUsers = data.usersWithPosts + data.usersWithoutPosts;

  const chartData = {
    labels: ["Users with Posts", "Users without Posts"],
    datasets: [
      {
        label: "Post Status",
        data: [data.usersWithPosts, data.usersWithoutPosts],
        backgroundColor: [
          "rgba(76, 175, 80, 0.7)",   // xanh lá nhạt
          "rgba(255, 87, 34, 0.7)"    // cam nhạt
        ],
        borderColor: [
          "rgba(76, 175, 80, 1)",     // viền xanh đậm
          "rgba(255, 87, 34, 1)"      // viền cam đậm
        ],
        borderWidth: 2,
        hoverOffset: 10, // Khi hover sẽ "nổ" lát cắt ra
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw;
            const percentage = ((value / totalUsers) * 100).toFixed(1);
            return `${label}: ${value} users (${percentage}%)`;
          },
        },
      },
    },
  };

  // 🆕 Hàm render bảng chi tiết

  return (
    <div className="space-y-8">
      <div className="w-full h-80 border border-gray-200 rounded-lg p-4 bg-white">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default UserPostStatusChart;
