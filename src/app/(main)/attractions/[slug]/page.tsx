"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Tab {
  id: string;
  label: string;
  content: {
    title: string;
    description: string;
    image?: string;
    items?: string[];
  };
}

interface Attraction {
  id: number;
  title: string;
  description: string;
  image: string;
  tags: string[];
  slug: string;
  tabs: Tab[];
}

export default function AttractionDetailPage() {
  const params = useParams();
  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttractionData = async () => {
      try {
        const slug = params?.slug;
        if (!slug) return;

        const response = await fetch(`/api/attractions/${slug}`);
        if (!response.ok) {
          throw new Error("Failed to fetch attraction data");
        }
        const data = await response.json();
        setAttraction(data);
        // Set the first tab as active by default
        if (data.tabs && data.tabs.length > 0) {
          setActiveTab(data.tabs[0].id);
        }
      } catch (error) {
        console.error("Error fetching attraction data:", error);
        setError("Lỗi khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchAttractionData();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-xl text-red-500 font-medium">{error || "Không tìm thấy địa điểm"}</p>
          <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
            Quay về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[70vh] min-h-[500px] w-full">
        <Image
          src={attraction.image}
          alt={attraction.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90">
          <div className="container mx-auto h-full px-4 flex flex-col justify-end pb-16">
            <div className="max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-3">
                {attraction.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/30 text-white text-sm font-medium rounded-full backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow">
                {attraction.title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 drop-shadow">
                {attraction.description}
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {/* Content Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-300 mb-8">
            <nav className="flex space-x-6 overflow-x-auto scrollbar-hide" aria-label="Tabs">
              {attraction.tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-base whitespace-nowrap font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-green-600 hover:border-green-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
  
          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            {attraction.tabs.map(
              (tab) =>
                activeTab === tab.id && (
                  <div key={tab.id} className="p-6 sm:p-10 space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {tab.content.title}
                    </h2>
  
                    {tab.content?.image && (
                      <div className="w-full h-60 sm:h-80 relative rounded-lg overflow-hidden shadow">
                        <Image
                          src={tab.content.image}
                          alt={tab.content.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
  
                    <p className="text-gray-700 text-base leading-relaxed">
                      {tab.content.description}
                    </p>
  
                    {tab.content.items && (
                      <ul className="list-disc pl-5 text-gray-700 space-y-2">
                        {tab.content.items.map((item, index) => (
                          <li key={index} className="text-base">
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
            )}
          </div>
        </div>
      </div>
    </main>
  );
  
}
