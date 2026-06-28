import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/api/supabase'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/views/auth/LoginPage.vue'), meta: { layout: 'auth' } },
  { path: '/register', name: 'Register', component: () => import('@/views/auth/RegisterPage.vue'), meta: { layout: 'auth' } },
  { path: '/', name: 'Home', component: () => import('@/views/home/HomePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/posts/new', name: 'CreatePost', component: () => import('@/views/posts/CreatePostPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/posts/:id', name: 'PostDetail', component: () => import('@/views/posts/PostDetailPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/posts/:id/edit', name: 'EditPost', component: () => import('@/views/posts/EditPostPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id', name: 'Profile', component: () => import('@/views/profile/ProfilePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/settings/profile', name: 'EditProfile', component: () => import('@/views/profile/EditProfilePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id/followers', name: 'Followers', component: () => import('@/views/profile/FollowListPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/profile/:id/following', name: 'Following', component: () => import('@/views/profile/FollowListPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/notifications', name: 'Notifications', component: () => import('@/views/notifications/NotificationsPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/discover', name: 'Discover', component: () => import('@/views/discover/DiscoverPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/people', name: 'People', component: () => import('@/views/discover/PeoplePage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/activities', name: 'Activities', component: () => import('@/views/activities/ActivitiesPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/events', name: 'Events', component: () => import('@/views/events/EventsPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/events/new', name: 'CreateEvent', component: () => import('@/views/events/CreateEventPage.vue'), meta: { layout: 'default', requiresAuth: true } },
  { path: '/events/:id', name: 'EventDetail', component: () => import('@/views/events/EventDetailPage.vue'), meta: { layout: 'default', requiresAuth: true } },

  { path: '/messages', redirect: '/notifications' },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) next('/login')
  else if ((to.path === '/login' || to.path === '/register') && session) next('/')
  else next()
})

export default router
