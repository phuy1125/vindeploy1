import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Post from '@/models/post';

mongoose.connect(process.env.MONGODB_URI as string);

const getMonthlyPostStats = async () => {
  const result = await Post.aggregate([
    {
      $project: {
        year: { $year: "$timestamp" }, // Lấy năm từ timestamp
        month: { $month: "$timestamp" }, // Lấy tháng từ timestamp
      },
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" }, // Nhóm theo năm và tháng
        count: { $sum: 1 }, // Đếm số lượng bài viết trong tháng
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 }, // Sắp xếp theo năm và tháng
    },
  ]);
  return result;
};

export const GET = async () => {
  try {
    const data = await getMonthlyPostStats();
    return NextResponse.json(data); // Trả về kết quả
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
};

