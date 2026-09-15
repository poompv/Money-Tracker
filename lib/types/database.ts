export type TransactionType = "income" | "expense";

// NOTE: these domain types must stay `type` aliases, not `interface`s.
// Interfaces used as `Row` inside the `Database` type below break generic
// inference for supabase-js's `.insert()`/`.rpc()` (verified empirically:
// swapping `interface` -> `type` here is what fixes it).
export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: TransactionType;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_default: boolean;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  category_id: string | null;
  type: TransactionType;
  amount: number;
  occurred_on: string;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type TransactionWithCategory = Transaction & {
  category: Pick<Category, "id" | "name" | "icon" | "color"> | null;
};

export type Budget = {
  id: string;
  user_id: string;
  category_id: string;
  month: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
};

export type BudgetLevel = "ok" | "warning" | "over";

export type BudgetProgress = {
  category_id: string;
  category_name: string;
  icon: string | null;
  color: string | null;
  limit_amount: number;
  spent: number;
  percent: number;
  level: BudgetLevel;
};

export type MonthlyTotals = {
  income: number;
  expense: number;
  net: number;
};

export type CategoryBreakdownItem = {
  category_id: string | null;
  category_name: string;
  color: string | null;
  total: number;
};

export type MonthlyTrendItem = {
  month: string;
  income: number;
  expense: number;
};

// Minimal Database type so @supabase/ssr's generics have something to bind to.
// Hand-written to match supabase/schema.sql rather than generated, since this
// project has no CI step that runs `supabase gen types`. Each table needs
// `Relationships` (even if empty) or postgrest-js's GenericTable constraint
// silently resolves query results to `never`.
export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          type: TransactionType;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          type?: TransactionType;
          icon?: string | null;
          color?: string | null;
          sort_order?: number;
          is_default?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: Transaction;
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          type: TransactionType;
          amount: number;
          occurred_on?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          type?: TransactionType;
          amount?: number;
          occurred_on?: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      budgets: {
        Row: Budget;
        Insert: {
          id?: string;
          user_id: string;
          category_id: string;
          month: string;
          limit_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string;
          month?: string;
          limit_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: { id: string; display_name: string | null; created_at: string };
        Insert: { id: string; display_name?: string | null };
        Update: { display_name?: string | null };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_category_spend: {
        Args: { p_month: string };
        Returns: { category_id: string; spent: number }[];
      };
    };
  };
};
