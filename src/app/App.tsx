import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import OTPPage from '@/pages/auth/OTPPage'
import DashboardPage from '@/pages/DashboardPage'
import TripPlannerPage from '@/pages/TripPlannerPage'
import TripDetailsPage from '@/pages/TripDetailsPage'
import ExpensesPage from '@/pages/ExpensesPage'
import SplitPage from '@/pages/SplitPage'
import AIChatPage from '@/pages/AIChatPage'
import CalculatorPage from '@/pages/CalculatorPage'
import ProfilePage from '@/pages/ProfilePage'
import SettingsPage from '@/pages/SettingsPage'
import { CountryProvider } from "@/context/CountryContext";
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<OTPPage />} />
          </Route>

          <Route
  element={
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  }
>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/trips/:id" element={<TripDetailsPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/split" element={<SplitPage />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
            <Route path="/calculator" element={<CalculatorPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <CountryProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </CountryProvider>
  )
}
