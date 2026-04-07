export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
  month: string;
}

export interface DashboardData {
  income: number;
  expenses: number;
  available: number;
  saved: number;
  by_category: Record<string, number>;
  budgets: Record<string, number>;
  alerts: string[];
  suggestions: string[];
  transaction_count: number;
}

export interface Goal {
  id: number;
  description: string;
  target_amount: number;
  month: string;
}

export interface Budget {
  id: number;
  category: string;
  limit_amount: number;
}

export interface RecurringTransaction {
  id: number;
  description: string;
  amount: number;
  category: string;
  is_active: boolean;
}

export interface TrendData {
  months: string[];
  income: number[];
  expenses: number[];
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}
