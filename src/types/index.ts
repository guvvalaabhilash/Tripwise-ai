export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  travelers: number
  image: string
  status: 'upcoming' | 'active' | 'completed'
  members: User[]
  transport?: string
  accommodation?: string
  foodPreference?: string
}

export interface Expense {
  id: string
  tripId: string
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  paidBy: string
  paidByName: string
  splitBetween: string[]
  status: 'paid' | 'pending'
  icon?: string
}

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'activities'
  | 'shopping'
  | 'other'

export interface ItineraryItem {
  id: string
  day: number
  time: string
  title: string
  description: string
  location: string
  type: 'activity' | 'food' | 'transport' | 'accommodation'
}

export interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'success' | 'warning' | 'expense'
  read: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface Settlement {
  from: string
  fromName: string
  to: string
  toName: string
  amount: number
}

export interface MemberContribution {
  userId: string
  name: string
  avatar: string
  paid: number
  owed: number
  balance: number
}

export interface Destination {
  id: string
  name: string
  country: string
  image: string
  rating: number
  price: number
}

export interface Testimonial {
  id: string
  name: string
  role: string
  avatar: string
  content: string
  rating: number
}

export interface Statistic {
  label: string
  value: number
  suffix?: string
  prefix?: string
}

export interface TripFormData {
  destination: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  transport: string
  accommodation: string
  foodPreference: string
}

export interface ExpenseFormData {
  title: string
  amount: number
  category: ExpenseCategory
  date: string
  paidBy: string
  splitBetween: string[]
}
