// app/api/content-moderation/route.ts
import { NextResponse } from 'next/server';
import { checkPostContent } from '../../../lib/contentValidator';

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Content is required' },
        { status: 400 }
      );
    }

    // Kiểm tra nội dung bài viết
    const isValid = await checkPostContent(content);

    return NextResponse.json({
      success: true,
      isValid,
    });
  } catch (error) {
    console.error('Error checking post content:', error);
    return NextResponse.json(
      { success: false, message: 'Server error', error },
      { status: 500 }
    );
  }
}
