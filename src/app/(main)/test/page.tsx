// src/app/(main)/test/page.tsx
"use client";

import Image from "next/image";
import { useState } from "react";

// Định nghĩa type cho tabContent
type TabContentType = {
  history: { title: string; content: string };
  architecture: { title: string; content: string };
  culture: { title: string; content: string };
  tourism: { title: string; content: string };
};

// Định nghĩa type cho keys của tabContent
type TabKey = keyof TabContentType;

export default function HoGuomPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("history");

  const tabContent: TabContentType = {
    history: {
      title: "Lịch sử Hồ Gươm",
      content: "Hồ Gươm (Hồ Hoàn Kiếm) là một hồ nước ngọt tự nhiên nằm ở trung tâm thành phố Hà Nội. Theo truyền thuyết, vào thế kỷ 15, vua Lê Thái Tổ sau khi đánh thắng quân Minh đã trả lại thanh gươm thần cho Rùa Thần tại hồ này, từ đó có tên là Hồ Hoàn Kiếm (nghĩa là Hồ Trả Gươm).",
    },
    architecture: {
      title: "Kiến trúc nổi bật",
      content: "Quanh Hồ Gươm có nhiều công trình kiến trúc nổi tiếng như Đền Ngọc Sơn nằm trên đảo Ngọc được nối với bờ bằng cầu Thê Húc sơn màu đỏ, Tháp Rùa nằm trên một đảo nhỏ giữa Hồ Gươm được xây dựng để tưởng nhớ Rùa Thần. Khu vực xung quanh hồ cũng có nhiều công trình hiện đại và cổ kính khác.",
    },
    culture: {
      title: "Văn hóa và lễ hội",
      content: "Hồ Gươm là trung tâm văn hóa, tinh thần của người Hà Nội. Nơi đây thường xuyên diễn ra các hoạt động văn hóa, lễ hội, như lễ hội đền Ngọc Sơn, biểu diễn nghệ thuật vào các dịp lễ tết. Vào cuối tuần, khu vực xung quanh hồ trở thành phố đi bộ sôi động, thu hút đông đảo người dân và du khách.",
    },
    tourism: {
      title: "Du lịch Hồ Gươm",
      content: "Hồ Gươm là điểm đến không thể bỏ qua khi tới Hà Nội. Du khách có thể dạo quanh hồ, thưởng thức không khí trong lành, tham quan Đền Ngọc Sơn, chụp ảnh với Tháp Rùa, thưởng thức ẩm thực đường phố và mua sắm tại các cửa hàng lưu niệm. Khu vực này cũng nổi tiếng với cà phê trứng và các món ăn truyền thống Hà Nội.",
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="relative h-[600px]">
  <Image 
    src="/api/placeholder/1200/800" 
    alt="Hồ Gươm - Hà Nội" 
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end">
    <div className="container mx-auto px-4 pb-12">
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
        Hồ Gươm - Learn how to get started with custom tours using the Hà Nội Guides
      </h1>
      <p className="text-xl text-white opacity-90">
        Before going digital, you might scribbling down some ideas in a sketchbook.
      </p>
    </div>
  </div>
</div>

      {/* Hero Section */}
 
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap border-b">
            {(Object.keys(tabContent) as TabKey[]).map((tab) => (
              <button
                key={tab}
                className={`px-4 py-3 font-medium text-sm md:text-base transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-green-600 text-green-600"
                    : "text-gray-500 hover:text-green-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tabContent[tab].title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{tabContent[activeTab].title}</h2>
            <p className="text-gray-700 mb-6">{tabContent[activeTab].content}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image 
                  src="/api/placeholder/600/400" 
                  alt="Hồ Gươm - Góc nhìn 1" 
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image 
                  src="/api/placeholder/600/400" 
                  alt="Hồ Gươm - Góc nhìn 2" 
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Information Sections */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Thông tin tham quan</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-center">
                <span className="font-medium mr-2">Địa chỉ:</span> Quận Hoàn Kiếm, Hà Nội
              </li>
              <li className="flex items-center">
                <span className="font-medium mr-2">Diện tích:</span> Khoảng 12 hecta
              </li>
              <li className="flex items-center">
                <span className="font-medium mr-2">Giờ mở cửa:</span> 24/7 (Đền Ngọc Sơn: 8:00 - 17:00)
              </li>
              <li className="flex items-center">
                <span className="font-medium mr-2">Giá vé:</span> Miễn phí (Đền Ngọc Sơn: 30.000 VNĐ)
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">Điểm tham quan lân cận</h3>
            <ul className="space-y-2 text-gray-700">
              <li>Phố cổ Hà Nội</li>
              <li>Nhà hát Lớn Hà Nội</li>
              <li>Văn Miếu - Quốc Tử Giám</li>
              <li>Nhà thờ Lớn Hà Nội</li>
              <li>Bảo tàng Lịch sử Quốc gia</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-green-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2">Khám phá Hồ Gươm</h3>
            <p className="mb-4">Di sản văn hóa và lịch sử Thủ đô Hà Nội</p>
            <p className="text-sm text-green-200">© 2025 VintelliTour. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}