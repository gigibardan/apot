# User Public Profiles - Quick Reference

## 🔗 Routes

### Public Profile Page
```
/profil/:username
```

**Example:**
```
/profil/john_doe
/profil/maria_popescu
```

## 📡 API Functions

### Import
```typescript
import {
  getUserProfile,
  getUserStats,
  getUserFavorites,
  getUserReviews,
  getUserForumPosts,
  getUserRecentActivity
} from "@/lib/supabase/queries/social";
```

### 1. Get User Profile
```typescript
const profile = await getUserProfile(username);

// Returns:
{
  id, username, full_name, bio, avatar_url,
  location, website_url, twitter_handle, instagram_handle,
  created_at, is_private,
  followersCount, followingCount,
  points: { total_points, level, points_to_next_level },
  badges: [...],
}
```

### 2. Get User Stats
```typescript
const stats = await getUserStats(userId);

// Returns:
{
  favoritesCount: number,
  reviewsCount: number,
  postsCount: number,
  followersCount: number,
  followingCount: number
}
```

### 3. Get User Favorites
```typescript
const result = await getUserFavorites(userId, page, limit);

// Returns:
{
  favorites: Array<{
    id, created_at,
    objective: { id, slug, title, excerpt, featured_image, country, continent }
  }>,
  total: number,
  hasMore: boolean
}
```

### 4. Get User Reviews
```typescript
const result = await getUserReviews(userId, page, limit);

// Returns:
{
  reviews: Array<{
    id, rating, title, comment, created_at, helpful_count,
    type: 'objective' | 'guide',
    objective?: {...},
    guide?: {...}
  }>,
  total: number,
  hasMore: boolean
}
```

### 5. Get User Forum Posts
```typescript
const result = await getUserForumPosts(userId, page, limit);

// Returns:
{
  posts: Array<{
    id, slug, title, content, created_at,
    views_count, replies_count, upvotes_count,
    category: { id, slug, name, color }
  }>,
  total: number,
  hasMore: boolean
}
```

### 6. Get User Activity
```typescript
const activities = await getUserRecentActivity(userId, limit);

// Returns:
Array<{
  id, user_id, activity_type, target_type, target_id,
  created_at, metadata
}>
```

## 🎨 Components

### Import Components
```typescript
import { UserActivityList } from "@/components/features/social/UserActivityList";
import { UserFavoritesList } from "@/components/features/social/UserFavoritesList";
import { UserReviewsList } from "@/components/features/social/UserReviewsList";
import { UserPostsList } from "@/components/features/social/UserPostsList";
```

### Usage
```tsx
// Activity Tab
<UserActivityList userId={userId} />

// Favorites Tab
<UserFavoritesList userId={userId} />

// Reviews Tab
<UserReviewsList userId={userId} />

// Forum Posts Tab
<UserPostsList userId={userId} />
```

## 🔗 Creating Links to Profiles

```tsx
import { Link } from "react-router-dom";

// Basic link
<Link to={`/profil/${username}`}>
  {user.full_name}
</Link>

// With avatar
<Link to={`/profil/${username}`} className="flex items-center gap-2">
  <Avatar>
    <AvatarImage src={user.avatar_url} />
    <AvatarFallback>{user.full_name[0]}</AvatarFallback>
  </Avatar>
  <span>{user.full_name}</span>
</Link>
```

## 🔄 Cache Invalidation

```typescript
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// After profile update
queryClient.invalidateQueries(['userProfile', username]);

// After follow/unfollow
queryClient.invalidateQueries(['userStats', userId]);

// After new content
queryClient.invalidateQueries(['userReviews', userId]);
queryClient.invalidateQueries(['userForumPosts', userId]);
queryClient.invalidateQueries(['userFavorites', userId]);
queryClient.invalidateQueries(['userActivity', userId]);
```

## 📊 Activity Types

```typescript
const ACTIVITY_TYPES = {
  favorite_added: 'User added objective to favorites',
  review_posted: 'User posted a review',
  forum_post: 'User created a forum post',
  forum_reply: 'User replied to a post',
  objective_visited: 'User visited an objective',
  badge_earned: 'User earned a badge',
  user_followed: 'User followed someone'
};
```

## 🎯 Usage Example

```tsx
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserFavorites } from "@/lib/supabase/queries/social";

function ProfilePage() {
  const { username } = useParams();
  
  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: () => getUserProfile(username!)
  });

  const { data: favorites } = useQuery({
    queryKey: ['userFavorites', profile?.id],
    queryFn: () => getUserFavorites(profile!.id, 1, 12),
    enabled: !!profile?.id
  });

  if (isLoading) return <LoadingSpinner />;
  if (!profile) return <NotFound />;

  return (
    <div>
      <h1>{profile.full_name}</h1>
      <p>@{profile.username}</p>
      <p>Level {profile.points.level}</p>
      
      {/* Show favorites */}
      {favorites?.favorites.map(fav => (
        <ObjectiveCard key={fav.id} objective={fav.objective} />
      ))}
    </div>
  );
}
```

## 🚦 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 404 | User not found |
| 500 | Server error |

## ⚡ Performance Tips

1. **Use pagination**: Don't load all data at once
2. **Enable queries conditionally**: Use `enabled` option
3. **Invalidate selectively**: Only invalidate changed queries
4. **Batch requests**: Load multiple resources in parallel

```tsx
// Good - Parallel loading
const [profile, stats] = await Promise.all([
  getUserProfile(username),
  getUserStats(userId)
]);

// Bad - Sequential loading
const profile = await getUserProfile(username);
const stats = await getUserStats(userId);
```

## 📱 Responsive Breakpoints

```css
/* Mobile first */
grid-cols-1          /* < 640px */
sm:grid-cols-2      /* 640px+ */
lg:grid-cols-3      /* 1024px+ */
```

---

**Quick Start:**
1. Navigate to `/profil/username`
2. View tabs: Activity, Favorites, Reviews, Posts
3. Click follow button (if not own profile)
4. Explore user content