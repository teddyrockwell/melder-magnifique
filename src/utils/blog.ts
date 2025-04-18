import type { PaginateFunction } from 'astro';
import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import type { Post, Heading } from '~/types';
import { APP_BLOG } from 'astrowind:config';
import {
  cleanSlug,
  trimSlash,
  BLOG_BASE,
  POST_PERMALINK_PATTERN,
  CATEGORY_BASE,
  TAG_BASE,
  AUTHOR_BASE,
} from './permalinks';

const generatePermalink = async ({
  id,
  slug,
  publishDate,
  category,
}: {
  id: string;
  slug: string;
  publishDate: Date;
  category: string | undefined;
}) => {
  const year = String(publishDate.getFullYear()).padStart(4, '0');
  const month = String(publishDate.getMonth() + 1).padStart(2, '0');
  const day = String(publishDate.getDate()).padStart(2, '0');
  const hour = String(publishDate.getHours()).padStart(2, '0');
  const minute = String(publishDate.getMinutes()).padStart(2, '0');
  const second = String(publishDate.getSeconds()).padStart(2, '0');

  const permalink = POST_PERMALINK_PATTERN.replace('%slug%', slug)
    .replace('%id%', id)
    .replace('%category%', category || '')
    .replace('%year%', year)
    .replace('%month%', month)
    .replace('%day%', day)
    .replace('%hour%', hour)
    .replace('%minute%', minute)
    .replace('%second%', second);

  return permalink
    .split('/')
    .map((el) => trimSlash(el))
    .filter((el) => !!el)
    .join('/');
};

const getNormalizedPost = async (post: CollectionEntry<'post'>): Promise<Post> => {
  const { id, slug: rawSlug = '', data } = post;
  const { Content, remarkPluginFrontmatter, headings: rawHeadings } = await post.render();

  const {
    publishDate: rawPublishDate = new Date(),
    updateDate: rawUpdateDate,
    title,
    excerpt,
    image,
    tags: rawTags = [],
    category: rawCategory,
    author,
    draft = false,
    metadata = {},
  } = data;

  const slug = cleanSlug(rawSlug); // cleanSlug(rawSlug.split('/').pop());
  const publishDate = new Date(rawPublishDate);
  const updateDate = rawUpdateDate ? new Date(rawUpdateDate) : undefined;

  const category = rawCategory
    ? {
        slug: cleanSlug(rawCategory),
        title: rawCategory,
      }
    : undefined;

  const tags = rawTags.map((tag: string) => ({
    slug: cleanSlug(tag),
    title: tag,
  }));

  const headings: Heading[] = rawHeadings
    ? rawHeadings.map((heading: { depth: number; slug: string; text: string }) => ({
        depth: heading.depth,
        value: heading.text, // Assuming text is the correct property name for the heading value
        slug: heading.slug,
      }))
    : [];

  return {
    id: id,
    slug: slug,
    permalink: await generatePermalink({ id, slug, publishDate, category: category?.slug }),

    publishDate: publishDate,
    updateDate: updateDate,

    title: title,
    excerpt: excerpt,
    image: image,

    category: category,
    tags: tags,
    author: author,

    draft: draft,

    metadata,

    Content: Content,
    // or 'content' in case you consume from API

    readingTime: remarkPluginFrontmatter?.readingTime,

    headings: headings,
  };
};

const load = async function (): Promise<Array<Post>> {
  const posts = await getCollection('post');
  const normalizedPosts = posts.map(async (post) => await getNormalizedPost(post));

  const results = (await Promise.all(normalizedPosts))
    .sort((a, b) => b.publishDate.valueOf() - a.publishDate.valueOf())
    .filter((post) => !post.draft);

  return results;
};

let _posts: Array<Post>;

/** */
export const isBlogEnabled = APP_BLOG.isEnabled;
export const isRelatedPostsEnabled = APP_BLOG.isRelatedPostsEnabled;
export const isBlogListRouteEnabled = APP_BLOG.list.isEnabled;
export const isBlogPostRouteEnabled = APP_BLOG.post.isEnabled;
export const isBlogCategoryRouteEnabled = APP_BLOG.category.isEnabled;
export const isBlogTagRouteEnabled = APP_BLOG.tag.isEnabled;

export const blogListRobots = APP_BLOG.list.robots;
export const blogPostRobots = APP_BLOG.post.robots;
export const blogCategoryRobots = APP_BLOG.category.robots;
export const blogTagRobots = APP_BLOG.tag.robots;

export const blogPostsPerPage = APP_BLOG?.postsPerPage;

/* Authors inclusion*/
export const authorListRobots = APP_BLOG.author.robots;
export const isAuthorRouteEnabled = APP_BLOG.author.isEnabled;

/** */
export const fetchPosts = async (): Promise<Array<Post>> => {
  if (!_posts) {
    _posts = await load();
  }

  return _posts;
};

/** */
export const findPostsBySlugs = async (slugs: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(slugs)) return [];

  const posts = await fetchPosts();

  return slugs.reduce(function (r: Array<Post>, slug: string) {
    posts.some(function (post: Post) {
      return slug === post.slug && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findPostsByIds = async (ids: Array<string>): Promise<Array<Post>> => {
  if (!Array.isArray(ids)) return [];

  const posts = await fetchPosts();

  return ids.reduce(function (r: Array<Post>, id: string) {
    posts.some(function (post: Post) {
      return id === post.id && r.push(post);
    });
    return r;
  }, []);
};

/** */
export const findLatestPosts = async ({ count }: { count?: number }): Promise<Array<Post>> => {
  const _count = count || 4;
  const posts = await fetchPosts();

  return posts ? posts.slice(0, _count) : [];
};

/** */
export const getStaticPathsBlogList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogListRouteEnabled) return [];
  return paginate(await fetchPosts(), {
    params: { blog: BLOG_BASE || undefined },
    pageSize: blogPostsPerPage,
  });
};

/** */
export const getStaticPathsBlogPost = async () => {
  if (!isBlogEnabled || !isBlogPostRouteEnabled) return [];
  return (await fetchPosts()).flatMap((post) => ({
    params: {
      blog: post.permalink,
    },
    props: { post },
  }));
};

/** */
export const getStaticPathsBlogCategory = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogCategoryRouteEnabled) return [];

  const posts = await fetchPosts();
  const categories = {};
  posts.map((post) => {
    post.category?.slug && (categories[post.category?.slug] = post.category);
  });

  return Array.from(Object.keys(categories)).flatMap((categorySlug) =>
    paginate(
      posts.filter((post) => post.category?.slug && categorySlug === post.category?.slug),
      {
        params: { category: categorySlug, blog: CATEGORY_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { category: categories[categorySlug] },
      }
    )
  );
};

/** Helper function to fetch all categories and calculate their counts */
export const getCategoriesWithCounts = async (): Promise<Array<{ slug: string; title: string; count: number }>> => {
  const posts = await fetchPosts();
  const categories: Record<string, { slug: string; title: string; count: number }> = {};

  posts.forEach((post) => {
    if (post.category) {
      const slug = post.category.slug;
      if (!categories[slug]) {
        categories[slug] = { slug: slug, title: post.category.title, count: 0 };
      }
      categories[slug].count += 1;
    }
  });

  return Object.values(categories).sort((a, b) => a.title.localeCompare(b.title));
};

/** Function to fetch and pre-render all categories with counts */
export const getStaticCategories = async () => {
  return await getCategoriesWithCounts();
};

/** Helper function to fetch all tags and calculate their counts */
export const getTagsWithCounts = async (): Promise<Array<{ slug: string; title: string; count: number }>> => {
  const posts = await fetchPosts();
  const tags: Record<string, { slug: string; title: string; count: number }> = {};

  posts.forEach((post) => {
    Array.isArray(post.tags) &&
      post.tags.forEach((tag) => {
        if (!tags[tag?.slug]) {
          tags[tag?.slug] = { slug: tag?.slug, title: tag?.title, count: 0 };
        }
        tags[tag.slug].count += 1;
      });
  });

  return Object.values(tags).sort((a, b) => a.title.localeCompare(b.title));
};

/** Function to fetch and pre-render all tags with counts */
export const getStaticTags = async () => {
  return await getTagsWithCounts();
};

/** */
export const getStaticPathsBlogTag = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isBlogTagRouteEnabled) return [];

  const posts = await fetchPosts();
  const tags = {};
  posts.map((post) => {
    Array.isArray(post.tags) &&
      post.tags.map((tag) => {
        tags[tag?.slug] = tag;
      });
  });

  return Array.from(Object.keys(tags)).flatMap((tagSlug) =>
    paginate(
      posts.filter((post) => Array.isArray(post.tags) && post.tags.find((elem) => elem.slug === tagSlug)),
      {
        params: { tag: tagSlug, blog: TAG_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { tag: tags[tagSlug] },
      }
    )
  );
};

/** */
export async function getRelatedPosts(originalPost: Post, maxResults: number = 4): Promise<Post[]> {
  const allPosts = await fetchPosts();
  const originalTagsSet = new Set(originalPost.tags ? originalPost.tags.map((tag) => tag.slug) : []);

  const postsWithScores = allPosts.reduce((acc: { post: Post; score: number }[], iteratedPost: Post) => {
    if (iteratedPost.slug === originalPost.slug) return acc;

    let score = 0;
    if (iteratedPost.category && originalPost.category && iteratedPost.category.slug === originalPost.category.slug) {
      score += 5;
    }

    if (iteratedPost.tags) {
      iteratedPost.tags.forEach((tag) => {
        if (originalTagsSet.has(tag.slug)) {
          score += 1;
        }
      });
    }

    acc.push({ post: iteratedPost, score });
    return acc;
  }, []);

  postsWithScores.sort((a, b) => b.score - a.score);

  const selectedPosts: Post[] = [];
  let i = 0;
  while (selectedPosts.length < maxResults && i < postsWithScores.length) {
    selectedPosts.push(postsWithScores[i].post);
    i++;
  }

  return selectedPosts;
}

/* AUTHOR COLLECTION FUNCTIONS */

// export const getStaticPathsAuthorList = async ({ paginate }: { paginate: PaginateFunction }) => {
//   if (!isBlogEnabled || !isAuthorRouteEnabled) return [];
//   return paginate(await fetchPosts(), {
//     params: { blog: AUTHOR_BASE || undefined },
//     pageSize: blogPostsPerPage,
//   });
// };

// export const getStaticPathsAuthorList = async ({ paginate }: { paginate: PaginateFunction }) => {
//   if (!isBlogEnabled || !isAuthorRouteEnabled) return [];

//   const posts = await fetchPosts();
//   const authors: Record<string, { name: string; count: number }> = {};

//   // Extract and count posts for each author
//   posts.forEach((post) => {
//     if (post.author) {
//       const authorName = post.author;
//       if (!authors[authorName]) {
//         authors[authorName] = { name: authorName, count: 0 };
//       }
//       authors[authorName].count += 1;
//     }
//   });

//   // Generate paginated paths for each author
//   return Object.keys(authors).flatMap((authorName) =>
//     paginate(
//       posts.filter((post) => post.author === authorName),
//       {
//         params: { author: authorName, blog: AUTHOR_BASE || undefined },
//         pageSize: blogPostsPerPage,
//         props: { author: { name: authorName, count: authors[authorName].count } },
//       }
//     )
//   );
// };

export const getStaticPathsAuthorList = async ({ paginate }: { paginate: PaginateFunction }) => {
  if (!isBlogEnabled || !isAuthorRouteEnabled) return [];

  const posts = await fetchPosts();
  const authors: Record<string, string> = {};

  posts.map((post) => {
    if (post.author) {
      const authorSlug = cleanSlug(post.author);
      if (!authors[authorSlug]) {
        authors[authorSlug] = post.author;
      }
    }
  });

  return Array.from(Object.keys(authors)).flatMap((authorSlug) =>
    paginate(
      posts.filter((post) => post.author && cleanSlug(post.author) === authorSlug),
      {
        params: { author: authorSlug, blog: AUTHOR_BASE || undefined },
        pageSize: blogPostsPerPage,
        props: { author: authors[authorSlug] },
      }
    )
  );
};
