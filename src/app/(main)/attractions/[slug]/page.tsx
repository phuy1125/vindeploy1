"use client";
///src\app\(main)\attractions\[slug]\page.tsx
import { useEffect, useState } from "react";
import { useParams, useSearchParams  } from "next/navigation";
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
    streetViewUrl?: string[];
    panoramaUrl?: string;
  };
}

interface Attraction {
  id: number;
  title: string;
  description: string;
  image: string;
  //tags: string[];
  slug: string;
  tabs: Tab[];
}

export default function AttractionDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams(); // 🆕 lấy search params
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
          // 🆕 Check query param tab
          const initialTab = searchParams ? searchParams.get("tab") : null; 

          if (initialTab) {
            setActiveTab(initialTab);
          } else if (data.tabs && data.tabs.length > 0) {
            setActiveTab(data.tabs[0].id); // Mặc định lấy tab đầu tiên nếu không có param
          }
        } catch (error) {
          console.error("Error fetching attraction data:", error);
          setError("Lỗi khi tải dữ liệu");
        } finally {
          setLoading(false);
        }
      };
  
      fetchAttractionData();
    }, [params?.slug, searchParams]); 
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
      <div className="relative h-[70vh] min-h-[500px] w-full mt-[-45px]">
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
              {/* <div className="flex flex-wrap gap-2 mb-3">
                {attraction.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/30 text-white text-sm font-medium rounded-full backdrop-blur"
                  >
                    {tag}
                  </span>
                ))}
              </div> */}
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

                    {tab.id === "streetview" && (
                      <div className="space-y-8">
                        {/* Street View */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-800">Street View</h3>
                          {tab.content.streetViewUrl && tab.content.streetViewUrl.length > 0 ? (
                            tab.content.streetViewUrl.map((url, index) => (
                              <div key={index} className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg mb-6">
                                <iframe
                                  src={url}
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  allowFullScreen
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                />
                              </div>
                            ))
                          ) : (
                            <p>Không có bản đồ street view.</p>
                          )}
                        </div>

                        {/* 360° View */}
                        {/* <div className="space-y-4">
                          <h3 className="text-xl font-semibold text-gray-800">Khám phá 360°</h3>
                          <div className="w-full h-[400px] relative rounded-lg overflow-hidden shadow-lg">
                            <Image
                              src={tab.content.panoramaUrl || ""}
                              alt="360° View"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div> */}
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