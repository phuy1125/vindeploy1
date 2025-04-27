// @lib/CareLikeComment/provinceEngagement.ts
import Post from "@models/post"; // Import model Post

export async function getTopProvinces() {
  const result = await Post.aggregate([
    {
      $match: { provinceGid: { $ne: null } } // Lọc bài viết có provinceGid
    },
    {
      $group: {
        _id: "$provinceGid",
        totalLikes: {
          $sum: {
            $size: { $ifNull: ["$usersLiked", []] }
          }
        },
        totalComments: {
          $sum: {
            $size: { $ifNull: ["$comments", []] }
          }
        }
      }
    },
    {
      $project: {
        provinceGid: "$_id",
        totalEngagement: { $add: ["$totalLikes", "$totalComments"] }
      }
    },
    { $sort: { totalEngagement: -1 } },
    { $limit: 5 }
  ]);

  return result;
}
