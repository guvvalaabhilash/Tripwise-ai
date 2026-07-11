// Phase 2: Replace with Supabase/API calls
export const tripService = {
  getAll: async () => [],
  getById: async (_id: string) => null,
  create: async (_data: unknown) => null,
  update: async (_id: string, _data: unknown) => null,
  delete: async (_id: string) => false,
}

export const expenseService = {
  getAll: async (_tripId?: string) => [],
  create: async (_data: unknown) => null,
  update: async (_id: string, _data: unknown) => null,
  delete: async (_id: string) => false,
}

export const authService = {
  login: async (_email: string, _password: string) => null,
  register: async (_data: unknown) => null,
  logout: async () => {},
  resetPassword: async (_email: string) => false,
  verifyOTP: async (_code: string) => false,
}

export const aiService = {
  sendMessage: async (_message: string) => '',
}
