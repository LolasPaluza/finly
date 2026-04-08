const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("finly_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  auth: {
    register: (data: { email: string; password: string; name: string }) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
  },
  dashboard: (month?: string) =>
    request<import("./types").DashboardData>(`/dashboard${month ? `?month=${month}` : ""}`),
  dashboardTrends: (n = 6) =>
    request<import("./types").TrendData>(`/dashboard/trends?n=${n}`),
  dashboardSuggestions: (month: string) =>
    request<{ suggestions: string[] }>(`/dashboard/suggestions?month=${month}`),
  transactions: {
    list: (month?: string) =>
      request<import("./types").Transaction[]>(`/transactions${month ? `?month=${month}` : ""}`),
    months: () => request<string[]>("/transactions/months"),
    create: (data: { date: string; description: string; amount: number; category: string; month?: string }) =>
      request("/transactions", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { date?: string; description?: string; amount?: number; category?: string }) =>
      request<import("./types").Transaction>(`/transactions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) =>
      request(`/transactions/${id}`, { method: "DELETE" }),
    upload: async (file: File, docType: "extrato" | "fatura" | "pix_only" = "extrato") => {
      const form = new FormData();
      form.append("file", file);
      form.append("doc_type", docType);
      const token = getToken();
      const res = await fetch(`${BASE}/transactions/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error(`Upload falhou: ${res.status}`);
      return res.json();
    },
  },
  chat: (message: string, month?: string) =>
    request<{ reply: string }>("/chat", { method: "POST", body: JSON.stringify({ message, month }) }),
  goals: {
    list: () => request<import("./types").Goal[]>("/goals"),
    create: (data: { description: string; target_amount: number; month: string }) =>
      request("/goals", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/goals/${id}`, { method: "DELETE" }),
  },
  budgets: {
    list: () => request<import("./types").Budget[]>("/budgets"),
    upsert: (data: { category: string; limit_amount: number }) =>
      request<import("./types").Budget>("/budgets", { method: "POST", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/budgets/${id}`, { method: "DELETE" }),
  },
  recurring: {
    list: () => request<import("./types").RecurringTransaction[]>("/recurring"),
    create: (data: { description: string; amount: number; category: string }) =>
      request<import("./types").RecurringTransaction>("/recurring", { method: "POST", body: JSON.stringify(data) }),
    update: (id: number, data: { description?: string; amount?: number; category?: string; is_active?: boolean }) =>
      request<import("./types").RecurringTransaction>(`/recurring/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    delete: (id: number) => request(`/recurring/${id}`, { method: "DELETE" }),
    apply: (month: string) => request<{ applied: number }>(`/recurring/apply/${month}`, { method: "POST" }),
  },
};
