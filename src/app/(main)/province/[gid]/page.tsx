"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Culture {
  title: string;
  description: string;
}

interface Cuisine {
  title: string;
  description: string;
}

interface Province {
  _id: number;
  name: string;
  description: string;
  cuisine: Cuisine;
  culture: Culture;
}

interface Location {
  _id: string;
  name: string;
  description: string;
  image: string[];
  slug: string;
  provinceGid: number;
}

export default function ProvincePage() {
  const params = useParams();
  const [province, setProvince] = useState<Province | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvinceData = async () => {
      try {
        const gid = params?.gid;
        if (!gid) return;

        const [provinceRes, locationsRes] = await Promise.all([
          fetch(`/api/province_ad/${gid}`),
          fetch(`/api/locations?provinceGid=${gid}`)
        ]);

        if (!provinceRes.ok || !locationsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const provinceData = await provinceRes.json();
        const locationsData = await locationsRes.json();

        setProvince(provinceData);
        setLocations(locationsData.data || []);  // 🔥 Chú ý: API /locations trả về { data: [...] }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceData();
  }, [params?.gid]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-10 text-center">
        <p className="text-lg">Đang tải...</p>
      </div>
    );
  }

  if (error || !province) {
    return (
      <div className="max-w-6xl mx-auto py-10 text-center">
        <p className="text-red-500">{error || "Không tìm thấy tỉnh thành"}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4">{province.name}</h1>
      <p className="text-base text-gray-700 mb-8">{province.description}</p>

      <h2 className="text-2xl font-semibold mt-10 mb-4">Điểm đến nổi bật</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {locations.map((loc) => (
          <div
            key={loc._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-transform hover:scale-[1.02] flex flex-col"
          >
            <Link href={`/attractions/${loc._id}`} className="flex flex-col flex-1">
              <div className="relative w-full h-48">
                <Image
                  src={loc.image?.[0] || "/img/VN.jpg"}
                  alt={loc.name}
                  fill
                  className="rounded-t-lg object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold mb-2 text-blue-600 hover:underline">
                  {loc.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 flex-1">{loc.description}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">{province.culture.title}</h2>
        <p className="text-base text-gray-700">{province.culture.description}</p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-2">{province.cuisine.title}</h2>
        <p className="text-base text-gray-700">{province.cuisine.description}</p>
      </div>
    </div>
  );
}
