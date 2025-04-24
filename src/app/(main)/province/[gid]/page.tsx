"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface Attraction {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
}

interface Culture {
  title: string;
  description: string;
}

interface Cuisine {
  title: string;
  description: string;
}

interface Province {
  _id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  attractions: Attraction[];
  culture: Culture;
  cuisine: Cuisine;
}
export default function ProvincePage() {
  const params = useParams();
  const [province, setProvince] = useState<Province | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProvinceData = async () => {
      try {
        const gid = params?.gid;
        if (!gid) return;

        const response = await fetch(`/api/provinces/${gid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch province data');
        }
        const data = await response.json();
        setProvince(data);
      } catch (error) {
        console.error('Error fetching province data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProvinceData();
  }, [params?.gid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!province) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Province Not Found</h1>
          <p className="text-gray-600">The province you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">{province.title}</h1>
          <p className="text-xl opacity-90">{province.description}</p>
        </div>
      </div>

      {/* Attractions Section */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">Điểm Du Lịch Nổi Bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {province.attractions.map((attraction) => (
            <div key={attraction.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="relative h-48">
                <Image
                  src={attraction.image}
                  alt={attraction.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-xl mb-2">{attraction.title}</h3>
                <p className="text-gray-600 mb-4">{attraction.description}</p>
                <div className="flex flex-wrap gap-2">
                  {attraction.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Culture Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">{province.culture.title}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {province.culture.description}
          </p>
        </div>
      </div>

      {/* Cuisine Section */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold mb-8">{province.cuisine.title}</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          {province.cuisine.description}
        </p>
      </div>
    </div>
  );
} 