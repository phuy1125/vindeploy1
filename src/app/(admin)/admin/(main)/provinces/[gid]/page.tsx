'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// Updated interfaces based on your database structure
interface Attraction {
  id: number;
  title: string;
  description: string;
  image: string;
  slug: string;
}

interface Culture {
  title?: string;
  description?: string;
}

interface Cuisine {
  title?: string;
  description?: string;
}

interface Location {
  _id: string;
  name: string;
  description?: string;
  description_history?: string;
  address?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  provinceGid: number;
  image?: string[];
  openTime?: string;
  price?: string;
  tags?: string[];
  nearbyPlaces?: any[];
}

interface Province {
  _id: number;
  name: string;
  slug?: string;
  title?: string;
  description?: string;
  attractions?: Attraction[];
  culture?: Culture;
  cuisine?: Cuisine;
  locations: Location[];
}

export default function ProvincePage() {
  const { gid } = useParams();
  const router = useRouter();
  const [province, setProvince] = useState<Province | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch province data when gid changes
  useEffect(() => {
    if (!gid) return;

    const fetchProvinceData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/province_ad/${gid}`);
        if (!response.ok) throw new Error("Failed to fetch province data");

        const data = await response.json();
        setProvince(data);
      } catch (err) {
        console.error("Error fetching province data:", err);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceData();
  }, [gid]);

  // Handle loading or error states
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-xl text-gray-600">Đang tải...</div>
    </div>;
  }

  if (error || !province) {
    return <div className="flex justify-center items-center h-screen">
      <div className="text-xl text-red-500">{error || "Không tìm thấy tỉnh thành"}</div>
    </div>;
  }

  // Back button functionality
  const handleBackClick = () => {
    router.back(); // Go back to the previous page
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // Prepare the data to send, including name, description, culture, and cuisine
      const res = await fetch(`/api/province_ad/${gid}`, {
        method: "POST", // Use POST or PATCH based on your backend setup
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: province.name,
          description: province.description,
          culture: {
            title: province.culture?.title,
            description: province.culture?.description,
          },
          cuisine: {
            title: province.cuisine?.title,
            description: province.cuisine?.description,
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Cập nhật thành công!");
        router.push(`/admin/provinces/${gid}`); // Navigate to the province detail page after updating
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật tỉnh thành"));
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Có lỗi xảy ra khi cập nhật tỉnh thành.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Back Button */}


      <div className="container mx-auto py-16 px-4">
        <div className="w-full mx-auto">   
          {/* Main content card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            {/* Form container */}
            <div className="p-6">
              {/* Form sections */}
              <div className="space-y-8">
                {/* Basic Info Section */}
                <div className="border-b border-gray-200 pb-6">

                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Tên tỉnh thành
                      </label>
                      <input
                        id="name"
                        name="name"
                        placeholder="Tên tỉnh thành"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={province.name}
                        onChange={(e) => setProvince({ ...province, name: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả chung
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Giới thiệu về tỉnh thành..."
                        rows={5}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={province.description || ""}
                        onChange={(e) => setProvince({ ...province, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Culture Section */}
                <div className="border-b border-gray-200 pb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Văn hóa</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cultureTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề văn hóa
                      </label>
                      <input
                        id="cultureTitle"
                        name="cultureTitle"
                        placeholder="Văn hóa của tỉnh..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={province.culture?.title || ""}
                        onChange={(e) => {
                          const updatedProvince = {...province};
                          if (!updatedProvince.culture) updatedProvince.culture = {};
                          updatedProvince.culture.title = e.target.value;
                          setProvince(updatedProvince);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cultureDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả văn hóa
                      </label>
                      <textarea
                        id="cultureDescription"
                        name="cultureDescription"
                        placeholder="Chi tiết về văn hóa..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={province.culture?.description || ""}
                        onChange={(e) => {
                          const updatedProvince = {...province};
                          if (!updatedProvince.culture) updatedProvince.culture = {};
                          updatedProvince.culture.description = e.target.value;
                          setProvince(updatedProvince);
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cuisine Section */}
                <div className="pb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Ẩm thực</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cuisineTitle" className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề ẩm thực
                      </label>
                      <input
                        id="cuisineTitle"
                        name="cuisineTitle"
                        placeholder="Ẩm thực của tỉnh..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={province.cuisine?.title || ""}
                        onChange={(e) => {
                          const updatedProvince = {...province};
                          if (!updatedProvince.cuisine) updatedProvince.cuisine = {};
                          updatedProvince.cuisine.title = e.target.value;
                          setProvince(updatedProvince);
                        }}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cuisineDescription" className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả ẩm thực
                      </label>
                      <textarea
                        id="cuisineDescription"
                        name="cuisineDescription"
                        placeholder="Chi tiết về ẩm thực..."
                        rows={4}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        value={province.cuisine?.description || ""}
                        onChange={(e) => {
                          const updatedProvince = {...province};
                          if (!updatedProvince.cuisine) updatedProvince.cuisine = {};
                          updatedProvince.cuisine.description = e.target.value;
                          setProvince(updatedProvince);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end">
              <button
                onClick={handleBackClick}
                className="mr-4 px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 
                          transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>

          {/* Locations Section */}
          <div className="mt-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Địa điểm</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {province.locations && province.locations.length > 0 ? (
                province.locations.map((location) => (
                  <div key={location._id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    {location.image && location.image.length > 0 && (
                      <div className="relative w-full h-48">
                        <Image
                          src={location.image[0]}
                          alt={location.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-lg text-gray-800 mb-2">{location.name}</h4>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {location.description || "Không có mô tả"}
                      </p>
                      
                      <div className="space-y-1 text-sm text-gray-500">
                        {location.address && (
                          <p className="flex items-start">
                            <span className="mr-1 mt-1">📍</span>
                            <span>{location.address}</span>
                          </p>
                        )}
                        
                        {location.openTime && (
                          <p className="flex items-start">
                            <span className="mr-1 mt-1">🕒</span>
                            <span>{location.openTime}</span>
                          </p>
                        )}
                        
                        {location.price && (
                          <p className="flex items-start">
                            <span className="mr-1 mt-1">💰</span>
                            <span>{location.price}</span>
                          </p>
                        )}
                      </div>
                      
                      {location.tags && location.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {location.tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 flex justify-end">
                        <Link href={`/admin/locations/new/${location._id}`} passHref>
                          <button className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm transition-colors">
                            Xem chi tiết
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 col-span-3 text-center py-8">Chưa có địa điểm nào được thêm vào tỉnh này.</p>
              )}
            </div>
          </div>

          {/* Notable destinations - Only show if attractions exist */}
          {province.attractions && province.attractions.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Điểm đến nổi bật</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {province.attractions.map((attraction) => (
                  <div key={attraction.id} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
                    <Link href={`/attractions/${attraction.slug}`} className="flex flex-col h-full">
                      <div className="relative w-full h-48">
                        <Image
                          src={attraction.image}
                          alt={attraction.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-4 flex-grow">
                        <h4 className="text-lg font-semibold text-blue-600 hover:underline">{attraction.title}</h4>
                        <p className="text-sm text-gray-600 mt-2">{attraction.description}</p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}