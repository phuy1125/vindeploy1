"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ← dùng useParams với App Router

interface Location {
  _id: string;
  name: string;
  description?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

const LocationDetailPage = () => {
  const params = useParams();
  const id = params?.id as string; // ← lấy id từ URL
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchLocationDetail = async () => {
      try {
        const res = await fetch(`/api/locations/${id}`);
        const data = await res.json();
        if (res.ok) {
          setLocation(data.data);
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

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{location.name}</h1>
      <p className="text-gray-700 mb-2">
        <strong>Mô tả:</strong> {location.description || "Không có mô tả"}
      </p>
      <p className="text-gray-500 text-sm">
        <strong>Toạ độ:</strong> ({location.coordinates.lat}, {location.coordinates.lng})
      </p>
    </div>
  );
};

export default LocationDetailPage;
