import { fetchTagsFacet } from '@/src/lib/fetchTagsFacet';
import { fetchBlogPosts } from '@/src/lib/fetchBlogPosts';
import { fetchPostsByTagGroup, FilteredTagGroupResponse } from '@/src/lib/fetchPostsByTagGroup';
import { ClientRouterWrapper } from './components/layout/ClientRouterWrapper';
import { PostsByTagGroup } from './components/blog/PostsByTagGroup/PostsByTagGroup';
import { TagNavigation } from './components/blog/tags/TagNavigation';
import { PostViewWrapper } from './components/blog/PostViewWrapper';
import { BlogPost } from '@prisma/client';

const HOMEPAGE_TAG_GROUP_NAMES = ['new_react_stuff', 'browser_basics', 'nextjs', 'css'];

interface Props {
  searchParams: Record<string, string>;
}

export default async function Home({ searchParams = {} }: Props) {
  const selectedTagName = searchParams?.tag || '';
  const hasUserFilter = selectedTagName !== '';
    
  try {
    const [allTags, blogPosts, groupedPosts] = await Promise.all([
      fetchTagsFacet(),
      hasUserFilter ? fetchBlogPosts({ tag: selectedTagName }) : Promise.resolve(null),
      hasUserFilter ? Promise.resolve(null) 
        : fetchPostsByTagGroup({ tagNames: HOMEPAGE_TAG_GROUP_NAMES, maxItemsPerTag: 4 })
    ]);

    if (!allTags || (!blogPosts && !groupedPosts)) return <></>;

    const selectedTag = allTags.filter(tagOption => tagOption.name === selectedTagName)[0] || {};

    return (
      <ClientRouterWrapper initialTag={selectedTagName}>
        <PostViewWrapper
          tagNavigation={
            <TagNavigation allTags={allTags} tagName={selectedTagName} />
          }
        >
          {blogPosts && (
            <PostsByTagGroup tag={selectedTag} posts={blogPosts} />
          )}

          {groupedPosts?.tagGroups && (
            <>
              {groupedPosts.featuredPosts.length > 0 && (
                <div className="mb-8">
                  <FeaturedPost posts={groupedPosts.featuredPosts} />
                </div>
              )}
              {groupedPosts.tagGroups.map((props: FilteredTagGroupResponse) => (
                props.posts.length > 0 && (
                  <div key={props.tag.id} className="mb-8">
                    <PostsByTagGroup 
                      {...props} 
                      tagWithCount={allTags.find(tag => tag.name === props.tag.name)}
                      allowViewMore={true} 
                    />
                  </div>
                )
              ))}
            </>
          )}
        </PostViewWrapper>
      </ClientRouterWrapper>
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return <div>Error loading data: {errorMessage}</div>;
  }
}


function FeaturedPost ({ posts }: { posts: BlogPost[] }) {
  const featuredPostIndex = Math.floor(Math.random() * posts.length);
  const featuredPost = posts[featuredPostIndex];

  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-4 flex-grow 900mq:mb-6">
        {featuredPost.title}
      </h2>

    </div>
  );
}