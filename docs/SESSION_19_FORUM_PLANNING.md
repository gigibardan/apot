# Session 19 (VIITOARE): Community Forum System - Planning Document

**Status:** 🔮 Planificat pentru implementare viitoare  
**Priority:** Medium-High  
**Estimated Complexity:** High (Full forum system)

---

## 📋 Overview

Sistem complet de forum comunitar pentru utilizatori cu funcționalități complete:
- **User Features** - Postări, comentarii, votare, replies
- **Admin Moderation** - Aprobare postări, ștergere, ban users, report handling
- **Categories & Tags** - Organizare pe categorii și tag-uri
- **User Profiles** - Reputation, badges, activity history
- **Rich Text Editor** - Formatare text, imagini, links
- **Notifications** - Real-time notifications pentru replies și mentions
- **Search & Filter** - Căutare full-text prin discuții

---

## 🏗️ Proposed Database Schema

### Tables Required

#### 1. forum_categories
```sql
CREATE TABLE public.forum_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  parent_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  topics_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone"
  ON public.forum_categories FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage categories"
  ON public.forum_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

#### 2. forum_topics
```sql
CREATE TABLE public.forum_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES public.forum_categories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open', -- open, closed, locked, archived
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE, -- Requires admin approval
  
  -- Stats
  views_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Moderation
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  
  -- Timestamps
  last_reply_at TIMESTAMPTZ,
  last_reply_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_forum_topics_category ON public.forum_topics(category_id);
CREATE INDEX idx_forum_topics_user ON public.forum_topics(user_id);
CREATE INDEX idx_forum_topics_status ON public.forum_topics(status);
CREATE INDEX idx_forum_topics_search ON public.forum_topics USING GIN(search_vector);
CREATE INDEX idx_forum_topics_last_reply ON public.forum_topics(last_reply_at DESC);

-- Full-text search trigger
CREATE TRIGGER forum_topics_search_vector_update
  BEFORE INSERT OR UPDATE ON public.forum_topics
  FOR EACH ROW EXECUTE FUNCTION
  tsvector_update_trigger(search_vector, 'pg_catalog.simple', title, content);

-- RLS Policies
ALTER TABLE public.forum_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved topics viewable by everyone"
  ON public.forum_topics FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create topics"
  ON public.forum_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics within 24h"
  ON public.forum_topics FOR UPDATE
  USING (auth.uid() = user_id AND created_at > NOW() - INTERVAL '24 hours');

CREATE POLICY "Admins can manage all topics"
  ON public.forum_topics FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

#### 3. forum_replies
```sql
CREATE TABLE public.forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  
  -- Status
  is_approved BOOLEAN DEFAULT FALSE,
  is_best_answer BOOLEAN DEFAULT FALSE, -- Marked by topic author
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  
  -- Moderation
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMPTZ,
  moderation_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  
  -- Search
  search_vector TSVECTOR
);

-- Indexes
CREATE INDEX idx_forum_replies_topic ON public.forum_replies(topic_id);
CREATE INDEX idx_forum_replies_user ON public.forum_replies(user_id);
CREATE INDEX idx_forum_replies_parent ON public.forum_replies(parent_id);
CREATE INDEX idx_forum_replies_search ON public.forum_replies USING GIN(search_vector);

-- RLS Policies
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved replies viewable by everyone"
  ON public.forum_replies FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create replies"
  ON public.forum_replies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies within 24h"
  ON public.forum_replies FOR UPDATE
  USING (auth.uid() = user_id AND created_at > NOW() - INTERVAL '24 hours');

CREATE POLICY "Admins can manage all replies"
  ON public.forum_replies FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

#### 4. forum_topic_tags
```sql
CREATE TABLE public.forum_topic_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(topic_id, tag)
);

-- Indexes
CREATE INDEX idx_forum_topic_tags_topic ON public.forum_topic_tags(topic_id);
CREATE INDEX idx_forum_topic_tags_tag ON public.forum_topic_tags(tag);

-- RLS
ALTER TABLE public.forum_topic_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tags viewable by everyone"
  ON public.forum_topic_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can add tags to own topics"
  ON public.forum_topic_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.forum_topics
      WHERE id = topic_id AND user_id = auth.uid()
    )
  );
```

#### 5. forum_likes
```sql
CREATE TABLE public.forum_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, topic_id, reply_id)
);

-- Indexes
CREATE INDEX idx_forum_likes_user ON public.forum_likes(user_id);
CREATE INDEX idx_forum_likes_topic ON public.forum_likes(topic_id);
CREATE INDEX idx_forum_likes_reply ON public.forum_likes(reply_id);

-- RLS
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes viewable by everyone"
  ON public.forum_likes FOR SELECT
  USING (true);

CREATE POLICY "Users can like content"
  ON public.forum_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike own likes"
  ON public.forum_likes FOR DELETE
  USING (auth.uid() = user_id);
```

#### 6. forum_reports
```sql
CREATE TABLE public.forum_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.forum_topics(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, reviewed, resolved, dismissed
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (topic_id IS NOT NULL AND reply_id IS NULL) OR
    (topic_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- RLS
ALTER TABLE public.forum_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create reports"
  ON public.forum_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can view all reports"
  ON public.forum_reports FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update reports"
  ON public.forum_reports FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
```

#### 7. forum_user_stats
```sql
CREATE TABLE public.forum_user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  topics_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  best_answers_count INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.forum_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User stats viewable by everyone"
  ON public.forum_user_stats FOR SELECT
  USING (true);

CREATE POLICY "System can update stats"
  ON public.forum_user_stats FOR ALL
  USING (true); -- Updated via triggers/functions
```

---

## 🎯 Features to Implement

### User Features
1. **Topic Creation**
   - Rich text editor (TipTap)
   - Add tags
   - Select category
   - Upload images
   - Preview before posting

2. **Reply System**
   - Reply to topics
   - Quote replies
   - Nested replies (threading)
   - Edit within 24h
   - Mark best answer (topic author)

3. **Voting System**
   - Like/unlike topics and replies
   - Reputation calculation
   - Top contributors leaderboard

4. **User Profiles**
   - Forum activity history
   - Topics created
   - Replies posted
   - Badges earned
   - Reputation score

5. **Notifications**
   - New reply on your topic
   - Someone quoted you
   - Best answer selected
   - Topic status changed

### Admin Moderation Features
1. **Content Moderation**
   - Approve/reject new topics
   - Approve/reject replies
   - Edit any content
   - Delete topics/replies
   - Lock/unlock topics
   - Pin/unpin topics
   - Feature topics

2. **User Management**
   - Ban users from forum
   - Mute users temporarily
   - View user activity
   - Reset reputation

3. **Report Handling**
   - View all reports
   - Review reports
   - Take action (remove content, warn user, ban)
   - Dismiss reports

4. **Category Management**
   - Create/edit/delete categories
   - Reorder categories
   - Set permissions per category

5. **Forum Settings**
   - Require approval for new users
   - Auto-approve after X posts
   - Min reputation to create topics
   - Rate limiting

---

## 🎨 UI Components Needed

### Public Pages
- `/forum` - Forum home with categories
- `/forum/category/:slug` - Category view with topics
- `/forum/topic/:slug` - Topic view with replies
- `/forum/search` - Search results
- `/forum/tags/:tag` - Topics by tag
- `/forum/user/:id` - User forum profile

### Components
- `ForumCategoryCard` - Category display
- `ForumTopicCard` - Topic in listing
- `ForumTopicDetail` - Full topic view
- `ForumReplyCard` - Reply display
- `ForumReplyForm` - Create/edit reply
- `ForumTopicForm` - Create/edit topic
- `ForumSearchBar` - Advanced search
- `ForumUserCard` - User profile summary
- `ForumBadge` - Achievement badges
- `ForumReportModal` - Report content

### Admin Pages
- `/admin/forum/categories` - Manage categories
- `/admin/forum/topics` - All topics (pending, reported)
- `/admin/forum/replies` - All replies (pending, reported)
- `/admin/forum/reports` - All reports
- `/admin/forum/users` - Forum users and stats
- `/admin/forum/settings` - Forum configuration

---

## 🔄 Real-time Features

### Supabase Realtime Subscriptions
```typescript
// Listen for new replies on a topic
const channel = supabase
  .channel('topic_replies')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'forum_replies',
      filter: `topic_id=eq.${topicId}`
    },
    (payload) => {
      // Add new reply to UI
    }
  )
  .subscribe();

// Listen for topic updates (status, pins)
const topicChannel = supabase
  .channel('topic_updates')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'forum_topics'
    },
    (payload) => {
      // Update topic in UI
    }
  )
  .subscribe();
```

---

## 🔐 Security Considerations

1. **Rate Limiting**
   - Max 5 topics per day per user
   - Max 50 replies per day per user
   - Cooldown between posts (1 minute)

2. **Spam Prevention**
   - Admin approval for new users' first 3 posts
   - Link restrictions for low-reputation users
   - Duplicate content detection

3. **Content Safety**
   - Profanity filter
   - Link validation
   - Image size limits
   - XSS prevention (sanitize HTML)

4. **Moderation Tools**
   - Auto-flag suspicious content
   - Word blacklist
   - Report thresholds (auto-hide after X reports)

---

## 📊 Analytics & Metrics

### User Metrics
- Active users (daily, weekly, monthly)
- New topics per day
- Replies per topic (average)
- Response time (average)
- Most active users

### Content Metrics
- Top categories (by activity)
- Trending topics
- Unanswered questions
- Resolution rate (topics with best answer)

### Moderation Metrics
- Pending approvals count
- Reports handled per day
- Average resolution time
- Banned users count

---

## 🚀 Implementation Phases

### Phase 1: Core Forum (2-3 sesiuni)
- [ ] Database schema și migrations
- [ ] Basic CRUD pentru topics și replies
- [ ] Category system
- [ ] User profiles for forum
- [ ] Basic search

### Phase 2: Engagement Features (1-2 sesiuni)
- [ ] Voting system (likes)
- [ ] Best answer selection
- [ ] Tags system
- [ ] Rich text editor (TipTap)
- [ ] Image uploads

### Phase 3: Moderation (1-2 sesiuni)
- [ ] Admin moderation panel
- [ ] Report system
- [ ] Topic approval workflow
- [ ] User banning/muting
- [ ] Content filtering

### Phase 4: Advanced Features (1-2 sesiuni)
- [ ] Real-time updates
- [ ] Notifications
- [ ] User reputation și badges
- [ ] Advanced search și filters
- [ ] Forum statistics

### Phase 5: Polish & Optimization (1 sesiune)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Email notifications
- [ ] SEO optimization
- [ ] Testing & bug fixes

**Total Estimated Time:** 6-10 sesiuni de implementare

---

## 📝 Notes

### Integration with Existing Features
- Link forum topics to objectives/guides (discussion threads)
- User profiles include forum activity
- Forum reputation affects overall user status
- Admin dashboard includes forum metrics

### Future Enhancements
- Private messages between users
- User groups/communities
- Event system (meetups, tours)
- Marketplace integration (buy/sell services)
- Multi-language support

---

**Status:** 🔮 Document de planificare - Implementare în sesiune viitoare  
**Priority:** Medium-High (după finalizarea features curente)  
**Prepared by:** AI Assistant  
**Last Updated:** 2025-11-30
