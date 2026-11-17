import { authRequest, databaseRequest } from "@/lib/postgres.functions";

type DbError = { message: string };
type DbResult<T = unknown> = {
  data: T;
  error: DbError | null;
  count: number | null;
};
type Filter = { column: string; operator: "eq" | "neq" | "is" | "ilike" | "in"; value: unknown };

type RowMap = {
  bookmarks: { user_id: string; confession_id: string; created_at: string };
  chat_participants: {
    thread_id: string;
    user_id: string;
    last_read_at: string;
  };
  chat_threads: {
    id: string;
    kind: string;
    group_id: string | null;
    confession_id: string | null;
    created_at: string;
  };
  confessions: {
    id: string;
    author_id: string;
    group_id: string | null;
    category: string;
    mood: string | null;
    body: string;
    created_at: string;
  };
  group_comments: {
    id: string;
    confession_id: string;
    author_id: string;
    parent_id: string | null;
    body: string;
    created_at: string;
  };
  group_members: {
    group_id: string;
    user_id: string;
    role: string;
    joined_at: string;
  };
  groups: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    category: string | null;
    is_private: boolean;
    invite_code: string | null;
    icon_url: string | null;
    creator_id: string;
    created_at: string;
  };
  messages: {
    id: string;
    thread_id: string;
    sender_id: string;
    body: string;
    created_at: string;
  };
  notifications: {
    id: string;
    user_id: string;
    kind: string;
    payload: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  };
  profiles: {
    id: string;
    anon_number: number;
    is_guest: boolean;
    notifications_enabled: boolean;
    created_at: string;
  };
  reactions: {
    id: string;
    confession_id: string;
    user_id: string;
    kind: string;
    created_at: string;
  };
  reports: {
    id: string;
    reporter_id: string;
    target_type: string;
    target_id: string;
    reason: string;
    status: string;
    created_at: string;
  };
};
type TableName = keyof RowMap;
type QueryRow<T> = T extends (infer R)[] ? R : T;

class QueryBuilder<T> implements PromiseLike<DbResult<T>> {
  private action: "select" | "insert" | "update" | "delete" = "select";
  private selection = "*";
  private filters: Filter[] = [];
  private orderBy?: { column: string; ascending?: boolean };
  private rowLimit?: number;
  private values?: Record<string, unknown> | Record<string, unknown>[];
  private singleMode?: "single" | "maybeSingle";
  private count = false;
  private head = false;
  private pending?: Promise<DbResult<T>>;

  constructor(private readonly table: TableName) {}

  select(columns = "*", options?: { count?: string; head?: boolean }) {
    this.selection = columns;
    this.count = options?.count === "exact";
    this.head = options?.head ?? false;
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[]) {
    this.action = "insert";
    this.values = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.action = "update";
    this.values = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, operator: "eq", value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ column, operator: "neq", value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, operator: "is", value });
    return this;
  }

  ilike(column: string, value: string) {
    this.filters.push({ column, operator: "ilike", value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ column, operator: "in", value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy = { column, ascending: options?.ascending };
    return this;
  }

  limit(count: number) {
    this.rowLimit = count;
    return this;
  }

  single(): Promise<DbResult<QueryRow<T> | null>> {
    this.singleMode = "single";
    return this.execute() as Promise<DbResult<QueryRow<T> | null>>;
  }

  maybeSingle(): Promise<DbResult<QueryRow<T> | null>> {
    this.singleMode = "maybeSingle";
    return this.execute() as Promise<DbResult<QueryRow<T> | null>>;
  }

  private execute() {
    if (!this.pending) {
      this.pending = databaseRequest({
        data: {
          table: this.table,
          action: this.action,
          select: this.selection,
          filters: this.filters,
          order: this.orderBy,
          limit: this.rowLimit,
          values: this.values,
          single: this.singleMode,
          count: this.count,
          head: this.head,
        },
      }) as Promise<DbResult<T>>;
    }
    return this.pending;
  }

  then<TResult1 = DbResult<T>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

export const database = {
  from<T extends TableName>(table: T) {
    return new QueryBuilder<RowMap[T][]>(table);
  },
  auth: {
    async getUser() {
      const result = await authRequest({ data: { action: "current" } });
      return { data: { user: "user" in result ? result.user : null }, error: null };
    },
    async signUp({ email, password }: { email: string; password: string }) {
      const result = await authRequest({ data: { action: "signup", email, password } });
      if (!("user" in result)) return { data: { user: null, session: null }, error: result.error };
      return { data: { user: result.user, session: {} }, error: null };
    },
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const result = await authRequest({ data: { action: "signin", email, password } });
      if (!("user" in result)) return { data: { user: null, session: null }, error: result.error };
      return { data: { user: result.user, session: {} }, error: null };
    },
    async signInAnonymously() {
      const result = await authRequest({ data: { action: "guest" } });
      if (!("user" in result)) return { data: { user: null }, error: result.error };
      return { data: { user: result.user }, error: null };
    },
    async signOut() {
      const result = await authRequest({ data: { action: "logout" } });
      if (!("user" in result)) return { error: result.error };
      return { error: null };
    },
    onAuthStateChange() {
      return { data: { subscription: { unsubscribe() {} } } };
    },
  },
};

export type { DbResult };
