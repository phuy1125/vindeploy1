"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Location {
  _id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const LocationEditPage = () => {
  const params = useParams(); 
  const id = params?.id as string; // Lấy id từ URL
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lat: "",
    lng: "",
  });
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const fetchLocationDetail = async () => {
      try {
        const res = await fetch(`/api/locations/${id}`);
        const data = await res.json();
        if (res.ok) {
          setLocation(data.data);
          setFormData({
            name: data.data.name,
            description: data.data.description || "",
            lat: data.data.coordinates.lat.toString(),
            lng: data.data.coordinates.lng.toString(),
          });
        } else {
          console.error("Lỗi:", data.error);
        }
      } catch (err) {
        console.error("Lỗi khi fetch location:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocationDetail();
  }, [id]);

  if (loading) return <div className="p-4">Đang tải thông tin...</div>;
  if (!location) return <div className="p-4">Không tìm thấy địa điểm.</div>;

  // Hàm xử lý form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedLocation = {
      name: formData.name,
      description: formData.description,
      coordinates: {
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng),
      },
    };

    try {
      const res = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedLocation),
      });
      if (res.ok) {
        alert("Địa điểm đã được cập nhật!");
        router.push(`/components/province/location/details/${id}`) // Chuyển hướng về trang chi tiết
      } else {
        alert("Lỗi khi cập nhật địa điểm.");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật địa điểm:", err);
      alert("Có lỗi khi cập nhật địa điểm.");
    }
  };

  // Hàm xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Cập nhật giá trị tương ứng với trường nhập liệu
    });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Chỉnh sửa địa điểm</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="name">
            Tên địa điểm
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="description">
            Mô tả
          </label>
          <textarea
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="lat">
            Vĩ độ
          </label>
          <input
            type="text"
            name="lat"
            id="lat"
            value={formData.lat}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700" htmlFor="lng">
            Kinh độ
          </label>
          <input
            type="text"
            name="lng"
            id="lng"
            value={formData.lng}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md"
        >
          Cập nhật địa điểm
        </button>
      </form>
    </div>
  );
};

export default LocationEditPage;
