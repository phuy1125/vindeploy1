'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Location {
  _id: string;
  name: string;
  description?: string;
  description_history?: string;
  address?: string;
  openTime?: string;
  price?: string;
  streetViewUrls?: string[];
  tags?: string[];
  image?: string[];
}

export default function UpdateLocationPage() {
  // Kiểm tra kiểu và đảm bảo id là chuỗi
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id; // Lấy id từ params

  const router = useRouter();

  const [formData, setFormData] = useState<Location>({
    _id: "",
    name: "",
    description: "",
    description_history: "",
    address: "",
    openTime: "",
    price: "",
    streetViewUrls: [""],
    tags: [],
    image: [],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageSelected, setImageSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return; // Nếu không có id, không làm gì cả
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/locations/${id}`);
        const data = await res.json();
        setFormData({
          _id: data._id,
          name: data.name || "",
          description: data.description || "",
          description_history: data.description_history || "",
          address: data.address || "",
          openTime: data.openTime || "",
          price: data.price || "",
          streetViewUrls: data.streetViewUrls || [""],
          tags: data.tags || [],
          image: data.image || [],
        });
        
        // Nếu có ảnh, hiển thị ảnh hiện tại
        if (data.image && data.image.length > 0) {
          setImagePreview(Array.isArray(data.image) ? data.image[0] : data.image);
          setImageSelected(true);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu địa điểm:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]); // Đảm bảo gọi lại fetchData mỗi khi id thay đổi

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      tags: value.split(",").map(tag => tag.trim()), // Phân tách các tag và loại bỏ khoảng trắng
    }));
  };

  const handleNearbyPlaceChange = (index: number, value: string) => {
    const newNearby = [...(formData.streetViewUrls || [])];
    newNearby[index] = value;
    setFormData((prev) => ({ ...prev, streetViewUrls: newNearby }));
  };

  const addNearbyPlace = () => {
    setFormData((prev) => ({ ...prev, streetViewUrls: [...(prev.streetViewUrls || []), ""] }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setImageSelected(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageSelected(false);
    setImageFile(null);
    // Chỉ xóa ảnh khỏi preview, không xóa khỏi database cho đến khi submit
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // Tạo FormData thay vì JSON
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('description_history', formData.description_history || '');
      formDataToSend.append('address', formData.address || '');
      formDataToSend.append('openTime', formData.openTime || '');
      formDataToSend.append('price', formData.price || '');
      
      // Xử lý mảng streetViewUrls
      formDataToSend.append('streetViewUrls', JSON.stringify(formData.streetViewUrls));
      
      // Xử lý mảng tags
      if (formData.tags && formData.tags.length > 0) {
        formDataToSend.append('tags', formData.tags.join(','));
      }
      
      // Thêm file ảnh nếu có
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      const res = await fetch(`/api/locations/${id}`, {
        method: "PATCH",
        // Không cần header Content-Type khi gửi FormData
        // FormData sẽ tự động đặt content-type là multipart/form-data
        body: formDataToSend,
      });
      
      const result = await res.json();
      
      if (res.ok) {
        alert("Cập nhật thành công!");
        router.push(`/admin/locations/new/${id}`);
      } else {
        alert("Lỗi: " + (result.message || "Không thể cập nhật địa điểm"));
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật:", err);
      alert("Có lỗi xảy ra khi cập nhật địa điểm.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleBackClick = () => {
    router.back(); // Go back to the previous page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden"></span>
          </div>
          <p className="mt-2">Đang xử lý...</p>
        </div>
      </div>
    );
  }

  return (
<div className="min-h-screen bg-white">
  <div className="relative h-auto text-white flex items-end justify-start p-8 bg-cover bg-center">
          {/* Back Button */}
          <button
        onClick={handleBackClick}
        style={{
          position: 'absolute',
          top: '-12px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          boxShadow: '0 6px 14px rgba(108, 117, 125, 0.6)',
        }}
      >
        Back
      </button>
    <div className="flex items-center justify-center w-full">
      {!imageSelected ? (
        <label
          htmlFor="dropzone-file"
          className="flex flex-col items-center justify-center w-full h-[400px] max-w-5xl border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-300"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click để tải lên</span> hoặc kéo và thả
            </p>
            <p className="text-xs text-gray-500">
              SVG, PNG, JPG hoặc GIF (TỐI ĐA. 800x400px)
            </p>
          </div>
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>
      ) : (
        <div className="relative w-full h-[400px] max-w-5xl">
          <img
            src={imagePreview || ""}
            alt="Image Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 text-white bg-gray-500 p-2 rounded-full hover:bg-gray-700 transition"
          >
            X
          </button>
        </div>
      )}
    </div>
  </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Thông tin tham quan</h2>
            <div className="space-y-4">
              <input
                name="name"
                placeholder="Tên địa điểm"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                name="address"
                placeholder="Địa chỉ"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                name="openTime"
                placeholder="Giờ mở cửa"
                value={formData.openTime}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                name="price"
                placeholder="Giá vé"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
              <input
                name="tags"
                placeholder="Nhập các tags (dùng dấu phẩy để phân tách)"
                value={formData.tags?.join(", ") || ""}
                onChange={handleTagsChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg shadow-sm border">
            <h2 className="text-lg font-semibold mb-4">Mô tả và lân cận</h2>
            <textarea
              name="description"
              placeholder="Mô tả"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded h-24"
            />
            <textarea
              name="description_history"
              placeholder="Lịch sử địa điểm"
              value={formData.description_history}
              onChange={handleChange}
              className="w-full p-2 border rounded h-24 mt-4"
            />
            <div className="mt-4">
              <h3 className="text-md font-medium mb-2">Đường dẫn 360</h3>
              {formData.streetViewUrls?.map((place, index) => (
                <input
                  key={index}
                  value={place}
                  onChange={(e) => handleNearbyPlaceChange(index, e.target.value)}
                  className="w-full p-2 border rounded my-1"
                  placeholder={`https://www.google.com/maps... ${index + 1}`}
                />
              ))}
              <button onClick={addNearbyPlace} className="text-blue-500 text-sm underline mt-2">
                + Thêm đường dẫn
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`${
              isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white px-6 py-2 rounded transition`}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
        </div>
      </div>
    </div>
  );
}