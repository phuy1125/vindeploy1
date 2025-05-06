import PostStatsChart from "@/components/statistical/MonthlyPostsChart";
import ProvinceEngagementChart from "@/components/statistical/ChartCare";
import UserPostStatusChart from "@/components/statistical/UserPostStatusChart";

export default function AdminPage() {
  return (
    <div className="p-6 space-y-10">
      <h1 className="text-3xl font-bold mb-10 text-center">Admin Dashboard</h1>

      {/* Section 1: Top 5 Provinces + User Post Status (cùng hàng) */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-10 text-gray-800">
          🏞️ Top 5 Provinces & 👤 User Post Status
        </h2>

        <div className="flex flex-wrap gap-6">
          {/* Column Chart */}
          <div className="flex-1 min-w-[300px] h-[400px]">
            <ProvinceEngagementChart />
          </div>

          {/* Pie Chart */}
          <div className="w-full md:w-1/3 h-[400px]">
            <UserPostStatusChart />
          </div>
        </div>
      </section>

      {/* Section 2: Post Stats by Month (full width) */}
      <section className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          📈 Post Stats by Month
        </h2>

        <div className="w-120% h-[500px]"> 
          {/* 🆕 Đặt w-full ở đây để nó chiếm hết chiều ngang div */}
          <PostStatsChart />
        </div>
      </section>
    </div>
  );
}
