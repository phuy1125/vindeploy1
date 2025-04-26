//src\lib\contentValidator.ts
import axios from 'axios';

export async function checkPostContent(content: string): Promise<boolean> {
  const API_URL = 'https://api-inference.huggingface.co/models/funa21/phobert-finetuned-victsd-toxic-v2';
  const API_KEY = process.env.HUGGINGFACE_API_KEY;

  if (!API_KEY) {
    throw new Error('Missing Hugging Face API Key (HUGGINGFACE_API_KEY)');
  }

  try {
    const response = await axios.post(
      API_URL,
      { inputs: content },
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const result = response.data;

    if (Array.isArray(result) && result[0]) {
      const label = result[0].label;
      const score = result[0].score;

      console.log(`Label: ${label}, Score: ${score}`);

      // LABEL_1 thường là "positive" (bài hợp lệ), LABEL_0 là "negative" (bài độc hại)
      return label === 'LABEL_1' && score > 0.7;
    }

    return false;
  } catch (error) {
    console.error('Error validating content:', error);
    return false;
  }
}
