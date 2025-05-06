"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // Import Link từ Next.js
import { AiOutlineInfoCircle } from "react-icons/ai";

interface Location {
  _id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface LocationListProps {
  provinceGid: number | null;
  provinceName: string | null;
  locationsVersion?: number;
  onLocationDeleted?: () => void;

}

const LocationList = ({ provinceGid, locationsVersion, onLocationDeleted }: LocationListProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!provinceGid) return;

    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/locations?gid=${provinceGid}`);
        const data = await res.json();
        setLocations(data.data || []);
        setFilteredLocations(data.data || []);
      } catch (err) {
        console.error("Lỗi khi tải địa điểm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provinceGid, locationsVersion]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query) {
      const filtered = locations.filter((location) =>
        location.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLocations(filtered);
    } else {
      setFilteredLocations(locations);
    }
  };

  // Hàm xử lý xóa địa điểm
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa địa điểm này?");
    if (confirmDelete) {
      try {
        const res = await fetch(`/api/locations/${id}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (res.ok) {
          setLocations(locations.filter((loc) => loc._id !== id)); // Cập nhật lại danh sách
          setFilteredLocations(filteredLocations.filter((loc) => loc._id !== id)); // Cập nhật lại danh sách đã lọc
          alert(data.message); // Thông báo thành công
          if (onLocationDeleted) {
            onLocationDeleted();
          }
        } else {
          alert(data.error); // Thông báo lỗi
        }
      } catch (err) {
        console.error("Lỗi khi xóa địa điểm:", err);
        alert("Có lỗi khi xóa địa điểm.");
      }
    }
  };

  if (!provinceGid) return null;

  return (
    <div className="absolute top-0 right-0 h-full w-[350px] bg-white/95 shadow-lg overflow-y-auto z-[1001] p-4 border-l border-gray-200">
      <div className="flex">      
        <h2 className="text-xl font-semibold mb-4">Địa điểm</h2>
        <Link
          href={`./provinces/${provinceGid}`} // Chuyển đến trang thông tin tỉnh
          className="text-blue-600 hover:underline flex items-center gap-2 mb-3 ml-16"
        >
          <AiOutlineInfoCircle className="text-xl" />
          Thông tin Province
        </Link>
        </div>

      {/* Input Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Tìm kiếm địa điểm theo tên"
        className="w-full p-2 mb-4 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <p className="text-gray-500">Đang tải...</p>
      ) : filteredLocations.length === 0 ? (
        <p className="text-gray-500">Không có địa điểm nào khớp với tìm kiếm.</p>
      ) : (
        <ul className="space-y-4">
          {filteredLocations.map((loc) => (
            <li
              key={loc._id}
              className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:bg-gray-50 transition"
            >
              <h3 className="text-md font-semibold text-gray-800">{loc.name}</h3>
              <p className="text-sm text-gray-600">{loc.description || "Không có mô tả"}</p>
              <p className="text-xs text-gray-400">
                ({loc.coordinates.lat}, {loc.coordinates.lng})
              </p>

              {/* Các nút hành động */}
              <div className="mt-3 space-x-2">

                {/* Sửa địa điểm */}
                <Link
                  href={`./locations/new/${loc._id}`} // Điều hướng tới trang chi tiết địa điểm
                  className="text-yellow-600 hover:underline"
                >
                  Sửa
                </Link>

                {/* Xóa địa điểm */}
                <button
                  onClick={() => handleDelete(loc._id)} // Xử lý xóa
                  className="text-red-600 hover:underline"
                >
                  Xóa
                </button>

                {/* Nút Thông tin Province */}

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationList;
