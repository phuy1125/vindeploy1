import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import axios from 'axios';
import { franc } from 'franc';
import { ObjectId } from 'mongodb';

enum ContentViolationType {
  HATE_SPEECH = 'hate_speech',
  SEXUAL = 'sexual',
  VIOLENCE = 'violence',
  SELF_HARM = 'self_harm',
  SPAM = 'spam',
  FAKE_NEWS = 'fake_news',
  HARASSMENT = 'harassment',
}

// Model tiếng Anh
const TOXIC_API = 'https://api-inference.huggingface.co/models/unitary/toxic-bert';
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY || '';

const headers = {
  Authorization: `Bearer ${HF_API_KEY}`,
  'Content-Type': 'application/json',
};

// Danh sách từ và cụm từ nhạy cảm tiếng Việt
const sensitiveWordsList = {
  [ContentViolationType.HATE_SPEECH]: [
    'địt mẹ', 'địt', 'súc vật', 'óc chó', 'đồ ngu', 'mất dạy', 'ngu vãi', 'thằng điên',
    'đồ điên', 'bố láo', 'đồ thần kinh', 'con chó', 'thằng chó', 'đụ', 'đụ má', 'đụ mẹ',
    'đm', 'đkm', 'đụ má mày', 'địt mẹ mày', 'địt mẹ m', 'địt con mẹ'
  ],
  [ContentViolationType.SEXUAL]: [
    'khiêu dâm', 'gái gọi', 'mại dâm', 'cave', 'sex toy', 'xxx', 'dâm dục', 'bú cu',
    'dick', 'cock', 'pussy', 'lồn', 'cặc', 'cu', 'buồi', 'bướm', 'chim'
  ],
  [ContentViolationType.VIOLENCE]: [
    'giết người', 'đánh bom', 'khủng bố', 'tấn công', 'chặt đầu', 'xả súng'
  ],
  [ContentViolationType.SELF_HARM]: [
    'tự tử', 'uống thuốc độc', 'cắt tay', 'tự sát'
  ],
  [ContentViolationType.SPAM]: [
    'click vào đây', 'kiếm tiền nhanh', 'việc nhẹ lương cao', 'mua ngay', 'bán gấp'
  ],
  [ContentViolationType.FAKE_NEWS]: [
    'tin giả', 'không kiểm chứng', 'lừa đảo', 'giả mạo'
  ],
  [ContentViolationType.HARASSMENT]: [
    'quấy rối', 'xàm sỡ', 'sàm sỡ', 'theo dõi', 'hiếp dâm', 'fuck you', 'ass', 'bitch', 'stupid'
  ],
};

// Danh sách từ tiếng Anh phổ biến cần chặn
const englishSensitiveWords = [
  'fuck', 'shit', 'bitch', 'ass', 'dick', 'pussy', 'stupid', 'cunt', 'whore', 'slut',
  'bastard', 'asshole', 'motherfucker'
];

// Hàm kiểm tra từ nhạy cảm tiếng Việt và tiếng Anh bằng regex Unicode
function checkSensitiveWords(content: string): { flagged: boolean; type?: string; word?: string } {
  const lowerContent = content.toLowerCase().trim();
  
  // Kiểm tra từng loại vi phạm trong danh sách tiếng Việt
  for (const [type, words] of Object.entries(sensitiveWordsList)) {
    for (const word of words) {
      // Tạo regex có ranh giới từ (boundary) hoặc kiểm tra như một phần của từ lớn hơn
      const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
      // Sử dụng word boundary cho từ đơn, hoặc tìm kiếm chính xác cho cụm từ
      const regex = new RegExp(`(^|\\s|[.,!?;:])${escapedWord}($|\\s|[.,!?;:])`, 'iu');
      
      if (regex.test(lowerContent)) {
        return { flagged: true, type, word };
      }
    }
  }
  
  // Kiểm tra riêng danh sách từ tiếng Anh
  for (const word of englishSensitiveWords) {
    const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(^|\\s|[.,!?;:])${escapedWord}($|\\s|[.,!?;:])`, 'iu');
    
    if (regex.test(lowerContent)) {
      return { flagged: true, type: ContentViolationType.HARASSMENT, word };
    }
  }
  
  return { flagged: false };
}

// API validate
export async function GET() {
  try {
    if (!HF_API_KEY) {
      return NextResponse.json({ success: false, message: 'Missing Hugging Face API Key' }, { status: 500 });
    }

    const client = await clientPromise;
    const db = client.db();
    const posts = await db.collection('posts').find().toArray();

    const invalidPosts: {
      postId: string;
      content: string;
      label: string;
      score: number | null;
      reason?: string;
      source?: string;
      updated?: boolean;
    }[] = [];

    const updatePromises: Promise<any>[] = [];

    for (const post of posts) {
      const content = post.content?.trim();
      if (!content) continue;

      // Kiểm tra từ nhạy cảm trước tiên, không phân biệt ngôn ngữ
      const sensitiveCheck = checkSensitiveWords(content);
      if (sensitiveCheck.flagged) {
        console.log(`🚫 Post ${post._id} vi phạm (${sensitiveCheck.type}): "${sensitiveCheck.word}"`);
        
        // Cập nhật trạng thái bài đăng trong database
        const updatePromise = db.collection('posts').updateOne(
          { _id: new ObjectId(post._id) },
          { 
            $set: { 
              status: 'flagged',
              flagInfo: {
                type: sensitiveCheck.type,
                word: sensitiveCheck.word,
                source: 'keyword',
                flaggedAt: new Date()
              }
            } 
          }
        ).then(result => ({
          postId: post._id.toString(),
          updated: result.modifiedCount > 0
        })).catch(err => {
          console.error(`❌ Lỗi cập nhật post ${post._id}:`, err);
          return { postId: post._id.toString(), updated: false, error: err.message };
        });
        
        updatePromises.push(updatePromise);
        
        invalidPosts.push({
          postId: post._id.toString(),
          content,
          label: 'violation',
          score: 1.0,
          reason: sensitiveCheck.type,
          source: 'keyword'
        });
        
        continue; // Nếu đã phát hiện vi phạm qua từ khóa thì không cần kiểm tra bằng API nữa
      }

      // Xác định ngôn ngữ
      const lang = franc(content);

      // Nếu là tiếng Việt và không phát hiện qua từ khóa, đánh dấu an toàn
      if (lang === 'vie') {
        console.log(`✅ Post tiếng Việt ${post._id} an toàn.`);
      } else {
        // Nếu là tiếng Anh hoặc ngôn ngữ khác, sử dụng API để kiểm tra
        try {
          const res = await axios.post(
            TOXIC_API,
            { inputs: content.toLowerCase() },
            { headers }
          );

          const results = res.data?.[0] as { label: string; score: number }[];
          const toxic = results?.find(r => r.label === 'toxic' && r.score > 0.7);

          if (toxic) {
            console.log(`🚫 Post ${post._id} bị đánh giá toxic (score: ${toxic.score.toFixed(2)})`);
            
            // Cập nhật trạng thái bài đăng trong database
            const updatePromise = db.collection('posts').updateOne(
              { _id: new ObjectId(post._id) },
              { 
                $set: { 
                  status: 'flagged',
                  flagInfo: {
                    type: 'toxic',
                    score: toxic.score,
                    source: 'toxic_bert',
                    flaggedAt: new Date()
                  }
                } 
              }
            ).then(result => ({
              postId: post._id.toString(),
              updated: result.modifiedCount > 0
            })).catch(err => {
              console.error(`❌ Lỗi cập nhật post ${post._id}:`, err);
              return { postId: post._id.toString(), updated: false, error: err.message };
            });
            
            updatePromises.push(updatePromise);
            
            invalidPosts.push({
              postId: post._id.toString(),
              content,
              label: toxic.label,
              score: toxic.score,
              source: 'toxic_bert'
            });
          } else {
            console.log(`✅ Post ${post._id} an toàn.`);
          }
        } catch (err: any) {
          console.warn(`⚠️ Lỗi mô hình tiếng Anh với post ${post._id}:`, err?.response?.data || err.message);
        }
      }
    }

    // Đợi tất cả các thao tác cập nhật database hoàn thành
    const updateResults = await Promise.all(updatePromises);
    
    // Kết hợp kết quả cập nhật với thông tin bài đăng
    for (const post of invalidPosts) {
      const updateResult = updateResults.find(r => r.postId === post.postId);
      if (updateResult) {
        post.updated = updateResult.updated;
      }
    }

    return NextResponse.json({
      success: true,
      invalidCount: invalidPosts.length,
      updatedCount: updateResults.filter(r => r.updated).length,
      invalidPosts,
      updateResults
    });
  } catch (error) {
    console.error('❌ Lỗi validate:', error);
    return NextResponse.json({ success: false, message: 'Server error', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}