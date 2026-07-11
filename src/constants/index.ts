import {
  LayoutDashboard,
  Map,
  Receipt,
  Users,
  MessageSquare,
  Calculator,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export const NAV_ITEMS: { label: string; path: string; icon: LucideIcon }[] = [
  { label: 'Dashboard',   path: '/dashboard',    icon: LayoutDashboard },
  { label: 'Trip Planner',path: '/trip-planner', icon: Map },
  { label: 'Expenses',    path: '/expenses',     icon: Receipt },
  { label: 'Split',       path: '/split',        icon: Users },
  { label: 'AI Chat',     path: '/ai-chat',      icon: MessageSquare },
  { label: 'Calculator',  path: '/calculator',   icon: Calculator },
  { label: 'Profile',     path: '/profile',      icon: User },
  { label: 'Settings',    path: '/settings',     icon: Settings },
]

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food & Dining', color: '#f97316' },
  { value: 'transport', label: 'Transport', color: '#3b5bdb' },
  { value: 'accommodation', label: 'Accommodation', color: '#8b5cf6' },
  { value: 'activities', label: 'Activities', color: '#22d3ee' },
  { value: 'shopping', label: 'Shopping', color: '#ec4899' },
  { value: 'other', label: 'Other', color: '#6b7280' },
] as const

export const TRANSPORT_OPTIONS = [
  { value: 'flight', label: 'Flight', icon: '✈️' },
  { value: 'train', label: 'Train', icon: '🚂' },
  { value: 'car', label: 'Car / Rental', icon: '🚗' },
  { value: 'bus', label: 'Bus', icon: '🚌' },
  { value: 'mixed', label: 'Mixed', icon: '🔄' },
]

export const ACCOMMODATION_OPTIONS = [
  { value: 'hotel', label: 'Hotel', icon: '🏨' },
  { value: 'airbnb', label: 'Airbnb', icon: '🏠' },
  { value: 'hostel', label: 'Hostel', icon: '🛏️' },
  { value: 'resort', label: 'Resort', icon: '🏖️' },
  { value: 'camping', label: 'Camping', icon: '🏕️' },
]

export const FOOD_PREFERENCES = [
  { value: 'any', label: 'Any Cuisine' },
  { value: 'local', label: 'Local Specialties' },
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'halal', label: 'Halal' },
  { value: 'fine-dining', label: 'Fine Dining' },
]

export const AI_SUGGESTED_PROMPTS = [
  'Plan a 5-day trip to Kerala under $500',
  'Find budget-friendly hotels in Goa',
  'What are the best local foods in India?',
  'Suggest activities for a family trip',
  'How to split expenses fairly among 4 people?',
  'Best time to visit Ladakh?',
]

export const LANDING_FEATURES = [
  {
    title: 'AI Trip Planning',
    description: 'Let our AI craft personalized itineraries based on your preferences, budget, and travel style.',
    icon: '🧠',
  },
  {
    title: 'Smart Budget Tracking',
    description: 'Real-time budget monitoring with intelligent alerts and spending insights across all trips.',
    icon: '💰',
  },
  {
    title: 'Expense Splitting',
    description: 'Effortlessly split bills among travel companions with automatic settlement calculations.',
    icon: '👥',
  },
  {
    title: 'Live Collaboration',
    description: 'Invite friends and family to plan together with shared itineraries and expense tracking.',
    icon: '🔗',
  },
]

export const CHART_COLORS = {
  primary: '#3b5bdb',
  cyan: '#22d3ee',
  emerald: '#10b981',
  orange: '#f97316',
  purple: '#8b5cf6',
  pink: '#ec4899',
}
