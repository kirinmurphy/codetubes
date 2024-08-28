import { Handler } from "@netlify/functions";
import { BlogPost, Tag } from "@prisma/client";
import { clearMemCache, getNetlifyFunctionHandler } from "../utils/getNetlifyFunctionHandler";

const HOMEPAGE_CACHE_KEY = 'homepage_data';
const HOMEPAC_CACHE_EXPIRY = 60 * 60 * 24 * 7; // 1 week

type BlogPostWithTags = BlogPost & {
  tags: {
    tag: Tag;
  }[];
};

interface PostsByTagGroupResult {
  tag: Partial<Tag>;  
  posts: BlogPostWithTags[];
}

interface ResponseData {
  featuredPosts: BlogPost[];
  tagGroups: PostsByTagGroupResult[];
}

export const handler: Handler = async (event) => {
  return await getNetlifyFunctionHandler<ResponseData>({
    event,
    errorMessage: 'Failed to fetch posts by tag group',
    cacheConfig: {
      key: HOMEPAGE_CACHE_KEY,
      expiry: HOMEPAC_CACHE_EXPIRY
    },
    getQueryResponse: async ({ prisma, event }) => {
      const queryStringParameters = event.queryStringParameters || {};
      const { tagNames, maxItemsPerTag } = queryStringParameters;

      const tagNameCollection = tagNames?.split(',') || [];
      const totalMaxItemsPerTag = parseInt(maxItemsPerTag || '4', 10);

      const [tagGroups, featuredPosts] = await Promise.all([
        Promise.all(tagNameCollection.map(async (tagName) => {
          const posts = await prisma.blogPost.findMany({
            where: { tags: { some: { tag: { name: tagName }}}},
            include: { tags: { include: { tag: true }}},
            // orderBy: { createdAt: 'desc' },
            take: totalMaxItemsPerTag
          });

          return {
            tag: posts[0]?.tags[0]?.tag ?? { name: tagName },
            posts: posts as BlogPostWithTags[]
          };
        })),
        prisma.blogPost.findMany({
          where: { featured: true },
          orderBy: { createdAt: 'desc' },
          take: totalMaxItemsPerTag
        })
      ]);

      return { featuredPosts, tagGroups };
    }
  });
};

export const clearHomepageCache = clearMemCache(HOMEPAGE_CACHE_KEY)
