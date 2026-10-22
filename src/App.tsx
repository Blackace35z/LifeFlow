
import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Page = "Dashboard" | "Budget" | "Daily Planner" | "Goals";
type Theme = "light" | "dark";
type TransactionType = "Income" | "Expense";
type Priority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  title: string;
  time: string;
  category: string;
  completed: boolean;
  date: string;
  priority: Priority;
};

type Transaction = {
  id: string;
  title: string;
  category: string;
  type: TransactionType;
  amount: number;
  date: string;
};

type Goal = {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  deadline: string;
  category: string;
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadTasks(): Task[] {
  const saved = readStorage<unknown>("lifeflow-tasks", []);
  if (!Array.isArray(saved)) return [];

  return saved
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.title === "string",
    )
    .map((item) => ({
      id: String(item.id),
      title: String(item.title),
      time: typeof item.time === "string" ? item.time : "09:00",
      category:
        typeof item.category === "string" ? item.category : "Personal",
      completed: Boolean(item.completed),
      date: typeof item.date === "string" ? item.date : today(),
      priority:
        item.priority === "Low" ||
        item.priority === "High" ||
        item.priority === "Medium"
          ? item.priority
          : "Medium",
    }));
}

function loadTransactions(): Transaction[] {
  const saved = readStorage<unknown>("lifeflow-transactions", []);
  if (!Array.isArray(saved)) return [];

  return saved
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.amount === "number" &&
        Number.isFinite(item.amount),
    )
    .map((item) => ({
      id: String(item.id),
      title: String(item.title),
      category:
        typeof item.category === "string" ? item.category : "Other",
      type: item.type === "Income" ? "Income" : "Expense",
      amount: Math.max(0, Number(item.amount)),
      date: typeof item.date === "string" ? item.date : today(),
    }));
}

function loadGoals(): Goal[] {
  const saved = readStorage<unknown>("lifeflow-goals", []);
  if (!Array.isArray(saved)) return [];

  return saved
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .filter(
      (item) =>
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        typeof item.target === "number",
    )
    .map((item) => ({
      id: String(item.id),
      title: String(item.title),
      description:
        typeof item.description === "string" ? item.description : "",
      target: Math.max(0, Number(item.target)),
      progress: Math.min(
        100,
        Math.max(0, Number(item.progress) || 0),
      ),
      deadline:
        typeof item.deadline === "string" ? item.deadline : "",
      category:
        typeof item.category === "string" ? item.category : "Personal",
    }));
}

function formatMoney(amount: number): string {
  return `${new Intl.NumberFormat("fr-TN", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(amount)} TND`;
}

function formatDate(date: string): string {
  if (!date) return "No deadline";
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const navItems: { name: Page; icon: string }[] = [
  { name: "Dashboard", icon: "◫" },
  { name: "Budget", icon: "↗" },
  { name: "Daily Planner", icon: "▦" },
  { name: "Goals", icon: "◎" },
];

const expenseCategories = [
  "Food",
  "Housing",
  "Transport",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Bills",
  "Other",
];

const incomeCategories = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
];

function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [theme, setTheme] = useState<Theme>(() =>
    readStorage<Theme>("lifeflow-theme", "light") === "dark"
      ? "dark"
      : "light",
  );
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [transactions, setTransactions] =
    useState<Transaction[]>(loadTransactions);
  const [goals, setGoals] = useState<Goal[]>(loadGoals);
  const [selectedDate, setSelectedDate] = useState(today());
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);

  useEffect(() => {
    localStorage.setItem("lifeflow-tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(
      "lifeflow-transactions",
      JSON.stringify(transactions),
    );
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("lifeflow-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("lifeflow-theme", JSON.stringify(theme));
  }, [theme]);

  const currentMonth = today().slice(0, 7);

  const monthlyTransactions = useMemo(
    () =>
      transactions.filter((transaction) =>
        transaction.date.startsWith(currentMonth),
      ),
    [transactions, currentMonth],
  );

  const monthlyIncome = monthlyTransactions
    .filter((item) => item.type === "Income")
    .reduce((total, item) => total + item.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((item) => item.type === "Expense")
    .reduce((total, item) => total + item.amount, 0);

  const balance = monthlyIncome - monthlyExpenses;

  const todayTasks = tasks.filter((task) => task.date === today());
  const completedToday = todayTasks.filter((task) => task.completed).length;
  const taskPercentage =
    todayTasks.length === 0
      ? 0
      : Math.round((completedToday / todayTasks.length) * 100);

  const weeklySpending = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    const weekday = (now.getDay() + 6) % 7;
    start.setDate(now.getDate() - weekday);
    start.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      const dateKey = `${day.getFullYear()}-${String(
        day.getMonth() + 1,
      ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;

      const amount = transactions
        .filter(
          (item) => item.date === dateKey && item.type === "Expense",
        )
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        label: day.toLocaleDateString("en", { weekday: "short" }),
        amount,
        isToday: dateKey === today(),
      };
    });
  }, [transactions]);

  const weeklyTotal = weeklySpending.reduce(
    (sum, item) => sum + item.amount,
    0,
  );
  const highestWeeklyDay = Math.max(
    ...weeklySpending.map((item) => item.amount),
    1,
  );

  const expenseBreakdown = useMemo(() => {
    const totals = new Map<string, number>();

    monthlyTransactions
      .filter((item) => item.type === "Expense")
      .forEach((item) => {
        totals.set(
          item.category,
          (totals.get(item.category) || 0) + item.amount,
        );
      });

    return Array.from(totals.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [monthlyTransactions]);

  const totalGoalTarget = goals.reduce(
    (sum, goal) => sum + goal.target,
    0,
  );
  const averageGoalProgress =
    goals.length === 0
      ? 0
      : Math.round(
          goals.reduce((sum, goal) => sum + goal.progress, 0) /
            goals.length,
        );

  function addTask(task: Omit<Task, "id" | "completed">) {
    setTasks((previous) => [
      ...previous,
      { ...task, id: makeId(), completed: false },
    ]);
    setShowTaskForm(false);
  }

  function toggleTask(id: string) {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  }

  function addTransaction(
    transaction: Omit<Transaction, "id">,
  ) {
    setTransactions((previous) => [
      { ...transaction, id: makeId() },
      ...previous,
    ]);
    setShowTransactionForm(false);
  }

  function deleteTransaction(id: string) {
    setTransactions((previous) =>
      previous.filter((item) => item.id !== id),
    );
  }

  function addGoal(goal: Omit<Goal, "id" | "progress">) {
    setGoals((previous) => [
      ...previous,
      { ...goal, id: makeId(), progress: 0 },
    ]);
    setShowGoalForm(false);
  }

  function updateGoalProgress(id: string, progress: number) {
    setGoals((previous) =>
      previous.map((goal) =>
        goal.id === id
          ? { ...goal, progress: Math.min(100, Math.max(0, progress)) }
          : goal,
      ),
    );
  }

  function deleteGoal(id: string) {
    setGoals((previous) => previous.filter((goal) => goal.id !== id));
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">L</span>
          <span>LifeFlow</span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="navigation" aria-label="Main navigation">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => setPage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
              {item.name === "Daily Planner" && todayTasks.length > 0 && (
                <span className="nav-count">{todayTasks.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-icon">✦</div>
            <strong>Make room for what matters</strong>
            <p>Small steps today. Better habits tomorrow.</p>
          </div>

          <div className="profile">
            <div className="avatar">Y</div>
            <div className="profile-info">
              <strong>My Workspace</strong>
              <span>Personal account</span>
            </div>
            <span className="profile-menu">···</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{page}</strong>
          </div>

          <div className="topbar-right">
            <span className="today-label">
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <button
              className="theme-toggle"
              type="button"
              onClick={() =>
                setTheme((current) =>
                  current === "light" ? "dark" : "light",
                )
              }
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? "☾" : "☀"}
            </button>
            <div className="top-avatar">Y</div>
          </div>
        </header>

        {page === "Dashboard" && (
          <section className="dashboard">
            <div className="welcome-section">
              <div>
                <p className="eyebrow">YOUR PERSONAL OVERVIEW</p>
                <h1>
                  Welcome back<span>.</span>
                </h1>
                <p className="welcome-description">
                  A little progress each day adds up to big results.
                  Here&apos;s how things are looking.
                </p>
              </div>
              <div className="welcome-date">
                <div className="date-icon">TODAY</div>
                <div>
                  <strong>{formatLongDate(new Date())}</strong>
                  <span>Your day, at a glance</span>
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                label="Monthly balance"
                value={formatMoney(balance)}
                icon="◈"
                variant="balance-card"
                footer="Income minus expenses this month"
              />
              <StatCard
                label="Monthly income"
                value={formatMoney(monthlyIncome)}
                icon="↗"
                iconClass="income-icon"
                footer="Recorded income this month"
              />
              <StatCard
                label="Monthly expenses"
                value={formatMoney(monthlyExpenses)}
                icon="↘"
                iconClass="expense-icon"
                footer="Recorded expenses this month"
              />
              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Today&apos;s tasks</span>
                  <span className="stat-icon tasks-icon">✓</span>
                </div>
                <h2>
                  {completedToday}
                  <span className="stat-denominator">
                    {" "}
                    / {todayTasks.length}
                  </span>
                </h2>
                <div className="stat-foot">
                  <span className="task-percentage">{taskPercentage}%</span>
                  <span>completed today</span>
                </div>
                <div className="stat-progress">
                  <span style={{ width: `${taskPercentage}%` }} />
                </div>
              </div>
            </div>

            <div className="content-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Spending breakdown</h3>
                    <p>Where your money went this month</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setPage("Budget")}
                    type="button"
                  >
                    View budget →
                  </button>
                </div>

                {expenseBreakdown.length === 0 ? (
                  <EmptyState
                    icon="◉"
                    title="No expenses recorded yet"
                    message="Add an expense in Budget to see your spending breakdown."
                  />
                ) : (
                  <>
                    <div className="spending-content">
                      <div className="donut-wrapper">
                        <div
                          className="donut-chart"
                          style={{
                            background: makeDonutGradient(expenseBreakdown),
                          }}
                        >
                          <div className="donut-hole">
                            <span>Total spent</span>
                            <strong>
                              {new Intl.NumberFormat("fr-TN", {
                                notation: "compact",
                                maximumFractionDigits: 1,
                              }).format(monthlyExpenses)}
                            </strong>
                            <small>TND</small>
                          </div>
                        </div>
                      </div>
                      <div className="spending-legend">
                        {expenseBreakdown.slice(0, 5).map((item, index) => (
                          <div className="legend-item" key={item.category}>
                            <span
                              className={`legend-dot color-${index % 5}`}
                            />
                            <span className="legend-name">
                              {item.category}
                            </span>
                            <strong>
                              {Math.round(
                                (item.amount / monthlyExpenses) * 100,
                              )}
                              %
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="panel-divider" />
                    <div className="budget-footer">
                      <div>
                        <span className="muted-label">Total expenses</span>
                        <strong>{formatMoney(monthlyExpenses)}</strong>
                      </div>
                      <div className="budget-footer-right">
                        <span className="muted-label">Categories</span>
                        <strong>{expenseBreakdown.length}</strong>
                      </div>
                    </div>
                  </>
                )}
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Weekly spending</h3>
                    <p>Your expenses over the current week</p>
                  </div>
                  <span className="period-select">This week</span>
                </div>

                <div className="weekly-chart">
                  <div className="chart-grid">
                    <span>High</span>
                    <span>Mid</span>
                    <span>Low</span>
                  </div>
                  <div className="chart-bars">
                    {weeklySpending.map((day) => (
                      <div className="chart-column" key={day.label}>
                        <div className="bar-track">
                          <div
                            className={`chart-bar ${day.isToday ? "highlight-bar" : ""}`}
                            style={{
                              height: `${Math.max(
                                day.amount > 0 ? 6 : 2,
                                (day.amount / highestWeeklyDay) * 100,
                              )}%`,
                            }}
                            title={`${day.label}: ${formatMoney(day.amount)}`}
                          />
                        </div>
                        <span>{day.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="activity-summary">
                  <div>
                    <span className="summary-dot" />
                    <span>Total spending this week</span>
                  </div>
                  <strong>{formatMoney(weeklyTotal)}</strong>
                </div>
              </section>
            </div>

            <div className="bottom-grid">
              <section className="panel tasks-panel">
                <div className="panel-header">
                  <div>
                    <h3>Today&apos;s tasks</h3>
                    <p>
                      {completedToday} of {todayTasks.length} tasks completed
                    </p>
                  </div>
                  <button
                    type="button"
                    className="add-task-button"
                    onClick={() => setShowTaskForm((value) => !value)}
                  >
                    <span>+</span> Add task
                  </button>
                </div>

                {showTaskForm && (
                  <TaskForm
                    initialDate={today()}
                    onSubmit={addTask}
                    onCancel={() => setShowTaskForm(false)}
                  />
                )}

                <TaskList
                  tasks={todayTasks}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />

                <button
                  className="planner-link"
                  type="button"
                  onClick={() => setPage("Daily Planner")}
                >
                  Open daily planner <span>→</span>
                </button>
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Your goals</h3>
                    <p>Keep moving toward what matters</p>
                  </div>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => setPage("Goals")}
                  >
                    View all →
                  </button>
                </div>

                {goals.length === 0 ? (
                  <EmptyState
                    icon="◎"
                    title="Your next milestone starts here"
                    message="Create a goal and track your progress as you go."
                  />
                ) : (
                  <div className="breakdown-list">
                    {goals.slice(0, 4).map((goal) => (
                      <div className="breakdown-item" key={goal.id}>
                        <div className="breakdown-top">
                          <div className="breakdown-name">
                            <span className="goal-dot" />
                            {goal.title}
                          </div>
                          <div className="breakdown-amount">
                            <strong>{goal.progress}%</strong>
                          </div>
                        </div>
                        <div className="breakdown-track">
                          <span
                            className="breakdown-fill"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {goals.length > 0 && (
                  <div className="activity-summary">
                    <div>
                      <span className="summary-dot" />
                      <span>Average goal progress</span>
                    </div>
                    <strong>{averageGoalProgress}%</strong>
                  </div>
                )}
              </section>
            </div>

            <Footer />
          </section>
        )}

        {page === "Budget" && (
          <section className="dashboard">
            <PageHeading
              eyebrow="YOUR FINANCES"
              title="Budget"
              description="Understand your money, one transaction at a time."
              action={
                <button
                  type="button"
                  className="add-task-button"
                  onClick={() => setShowTransactionForm((value) => !value)}
                >
                  <span>+</span> Add transaction
                </button>
              }
            />

            <div className="stats-grid">
              <StatCard
                label="Monthly balance"
                value={formatMoney(balance)}
                icon="◈"
                variant="balance-card"
                footer="Income minus expenses"
              />
              <StatCard
                label="Income this month"
                value={formatMoney(monthlyIncome)}
                icon="↗"
                iconClass="income-icon"
                footer="All recorded income"
              />
              <StatCard
                label="Expenses this month"
                value={formatMoney(monthlyExpenses)}
                icon="↘"
                iconClass="expense-icon"
                footer="All recorded expenses"
              />
              <StatCard
                label="Transactions this month"
                value={String(monthlyTransactions.length)}
                icon="▤"
                iconClass="tasks-icon"
                footer="Income and expenses"
              />
            </div>

            {showTransactionForm && (
              <TransactionForm
                onSubmit={addTransaction}
                onCancel={() => setShowTransactionForm(false)}
              />
            )}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Recent transactions</h3>
                  <p>Your newest income and expenses</p>
                </div>
                <span className="period-select">
                  {transactions.length} total
                </span>
              </div>

              {transactions.length === 0 ? (
                <EmptyState
                  icon="↗"
                  title="Your budget starts here"
                  message="No transactions yet. Add your first income or expense to see your financial overview."
                  action={
                    <button
                      type="button"
                      className="add-task-button"
                      onClick={() => setShowTransactionForm(true)}
                    >
                      <span>+</span> Add first transaction
                    </button>
                  }
                />
              ) : (
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>TRANSACTION</th>
                        <th>CATEGORY</th>
                        <th>DATE</th>
                        <th>TYPE</th>
                        <th>AMOUNT</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {[...transactions]
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((transaction) => (
                          <tr key={transaction.id}>
                            <td>
                              <div>{transaction.title}</div>
                            </td>
                            <td>{transaction.category}</td>
                            <td>{formatDate(transaction.date)}</td>
                            <td>
                              <span
                                className={`type-badge ${transaction.type.toLowerCase()}`}
                              >
                                {transaction.type}
                              </span>
                            </td>
                            <td
                              className={
                                transaction.type === "Income"
                                  ? "amount-income"
                                  : "amount-expense"
                              }
                            >
                              {transaction.type === "Income" ? "+" : "−"}
                              {formatMoney(transaction.amount)}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="delete-task-button"
                                onClick={() =>
                                  deleteTransaction(transaction.id)
                                }
                                aria-label={`Delete ${transaction.title}`}
                                title="Delete transaction"
                              >
                                ×
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="content-grid budget-lower-grid">
              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Spending by category</h3>
                    <p>This month&apos;s expenses</p>
                  </div>
                </div>
                {expenseBreakdown.length === 0 ? (
                  <EmptyState
                    icon="◉"
                    title="Nothing to break down yet"
                    message="Your expense categories will appear here."
                  />
                ) : (
                  <div className="breakdown-list">
                    {expenseBreakdown.map((item, index) => (
                      <div className="breakdown-item" key={item.category}>
                        <div className="breakdown-top">
                          <div className="breakdown-name">
                            <span className={`legend-dot color-${index % 5}`} />
                            {item.category}
                          </div>
                          <div className="breakdown-amount">
                            <strong>{formatMoney(item.amount)}</strong>
                            <span>
                              {monthlyExpenses > 0
                                ? Math.round(
                                    (item.amount / monthlyExpenses) * 100,
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="breakdown-track">
                          <span
                            className={`breakdown-fill color-${index % 5}`}
                            style={{
                              width: `${
                                monthlyExpenses > 0
                                  ? (item.amount / monthlyExpenses) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Budget snapshot</h3>
                    <p>A simple view of this month</p>
                  </div>
                </div>
                <div className="snapshot-list">
                  <SnapshotRow
                    label="Money coming in"
                    value={formatMoney(monthlyIncome)}
                    type="income"
                  />
                  <SnapshotRow
                    label="Money going out"
                    value={formatMoney(monthlyExpenses)}
                    type="expense"
                  />
                  <div className="panel-divider" />
                  <SnapshotRow
                    label="Net balance"
                    value={formatMoney(balance)}
                    type={balance >= 0 ? "income" : "expense"}
                  />
                </div>
              </section>
            </div>

            <Footer />
          </section>
        )}

        {page === "Daily Planner" && (
          <section className="dashboard">
            <PageHeading
              eyebrow="MAKE TODAY COUNT"
              title="Daily Planner"
              description="Plan your time, focus on priorities, and celebrate each completed task."
              action={
                <button
                  type="button"
                  className="add-task-button"
                  onClick={() => setShowTaskForm((value) => !value)}
                >
                  <span>+</span> Add task
                </button>
              }
            />

            <div className="planner-date-panel panel">
              <div>
                <span className="muted-label">Choose a day to plan</span>
                <strong>{formatDate(selectedDate)}</strong>
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label="Select planner date"
              />
            </div>

            <div className="stats-grid">
              <StatCard
                label="Tasks for this day"
                value={String(
                  tasks.filter((task) => task.date === selectedDate).length,
                )}
                icon="▦"
                iconClass="tasks-icon"
                footer="Tasks scheduled"
              />
              <StatCard
                label="Completed"
                value={String(
                  tasks.filter(
                    (task) => task.date === selectedDate && task.completed,
                  ).length,
                )}
                icon="✓"
                iconClass="income-icon"
                footer="Tasks finished"
              />
              <StatCard
                label="Still to do"
                value={String(
                  tasks.filter(
                    (task) => task.date === selectedDate && !task.completed,
                  ).length,
                )}
                icon="◷"
                iconClass="expense-icon"
                footer="Tasks remaining"
              />
              <div className="stat-card">
                <div className="stat-top">
                  <span className="stat-label">Daily progress</span>
                  <span className="stat-icon balance-icon">↗</span>
                </div>
                <h2>
                  {(() => {
                    const daily = tasks.filter(
                      (task) => task.date === selectedDate,
                    );
                    return daily.length
                      ? Math.round(
                          (daily.filter((task) => task.completed).length /
                            daily.length) *
                            100,
                        )
                      : 0;
                  })()}
                  %
                </h2>
                <div className="stat-progress">
                  <span
                    style={{
                      width: `${
                        tasks.filter((task) => task.date === selectedDate)
                          .length === 0
                          ? 0
                          : (tasks.filter(
                              (task) =>
                                task.date === selectedDate && task.completed,
                            ).length /
                              tasks.filter(
                                (task) => task.date === selectedDate,
                              ).length) *
                            100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {showTaskForm && (
              <TaskForm
                initialDate={selectedDate}
                onSubmit={addTask}
                onCancel={() => setShowTaskForm(false)}
              />
            )}

            <section className="panel tasks-panel">
              <div className="panel-header">
                <div>
                  <h3>Tasks for {formatDate(selectedDate)}</h3>
                  <p>Tick a task when you&apos;ve finished it</p>
                </div>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => setSelectedDate(today())}
                >
                  Go to today
                </button>
              </div>

              <TaskList
                tasks={tasks
                  .filter((task) => task.date === selectedDate)
                  .sort((a, b) => a.time.localeCompare(b.time))}
                onToggle={toggleTask}
                onDelete={deleteTask}
              />

              <button
                type="button"
                className="add-task-button planner-add-button"
                onClick={() => setShowTaskForm(true)}
              >
                <span>+</span> Create a task
              </button>
            </section>

            <section className="panel upcoming-panel">
              <div className="panel-header">
                <div>
                  <h3>Upcoming tasks</h3>
                  <p>Your next scheduled tasks that are not complete</p>
                </div>
              </div>

              {tasks.filter(
                (task) => !task.completed && task.date > today(),
              ).length === 0 ? (
                <EmptyState
                  icon="◷"
                  title="Nothing scheduled ahead"
                  message="Add tasks for upcoming days to get ready in advance."
                />
              ) : (
                <div className="task-list">
                  {tasks
                    .filter(
                      (task) => !task.completed && task.date > today(),
                    )
                    .sort(
                      (a, b) =>
                        a.date.localeCompare(b.date) ||
                        a.time.localeCompare(b.time),
                    )
                    .slice(0, 6)
                    .map((task) => (
                      <div className="task-item" key={task.id}>
                        <div className="task-date-chip">
                          {new Date(
                            `${task.date}T12:00:00`,
                          ).toLocaleDateString("en", {
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="task-details">
                          <span className="task-title">{task.title}</span>
                          <div className="task-meta">
                            <span className="task-time">{task.time}</span>
                            <span className="task-category">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <span className={`priority ${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </section>

            <Footer />
          </section>
        )}

        {page === "Goals" && (
          <section className="dashboard">
            <PageHeading
              eyebrow="YOUR FUTURE, BY DESIGN"
              title="Goals"
              description="Turn big ambitions into small steps you can take every day."
              action={
                <button
                  type="button"
                  className="add-task-button"
                  onClick={() => setShowGoalForm((value) => !value)}
                >
                  <span>+</span> New goal
                </button>
              }
            />

            <div className="stats-grid">
              <StatCard
                label="Active goals"
                value={String(goals.length)}
                icon="◎"
                iconClass="tasks-icon"
                footer="Goals you're working toward"
              />
              <StatCard
                label="Average progress"
                value={`${averageGoalProgress}%`}
                icon="↗"
                iconClass="income-icon"
                footer="Across all your goals"
              />
              <StatCard
                label="Completed goals"
                value={String(goals.filter((goal) => goal.progress === 100).length)}
                icon="✓"
                iconClass="income-icon"
                footer="Goals at 100% progress"
              />
              <StatCard
                label="Combined target"
                value={formatMoney(totalGoalTarget)}
                icon="◈"
                iconClass="balance-icon"
                footer="Sum of goal target amounts"
              />
            </div>

            {showGoalForm && (
              <GoalForm
                onSubmit={addGoal}
                onCancel={() => setShowGoalForm(false)}
              />
            )}

            {goals.length === 0 ? (
              <section className="panel">
                <EmptyState
                  icon="◎"
                  title="Start with a goal that matters to you"
                  message="Create your first goal, set a target, and track your progress over time."
                  action={
                    <button
                      type="button"
                      className="add-task-button"
                      onClick={() => setShowGoalForm(true)}
                    >
                      <span>+</span> Create your first goal
                    </button>
                  }
                />
              </section>
            ) : (
              <div className="goals-grid">
                {goals.map((goal) => (
                  <article className="panel goal-card" key={goal.id}>
                    <div className="goal-card-top">
                      <span className="goal-category">
                        {goal.category}
                      </span>
                      <button
                        type="button"
                        className="delete-task-button"
                        onClick={() => deleteGoal(goal.id)}
                        aria-label={`Delete ${goal.title}`}
                        title="Delete goal"
                      >
                        ×
                      </button>
                    </div>
                    <h3>{goal.title}</h3>
                    <p className="goal-description">
                      {goal.description || "One step closer every day."}
                    </p>

                    <div className="goal-progress-heading">
                      <span>Progress</span>
                      <strong>{goal.progress}%</strong>
                    </div>
                    <div
                      className="goal-progress-track"
                      role="progressbar"
                      aria-valuenow={goal.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${goal.title} progress`}
                    >
                      <span style={{ width: `${goal.progress}%` }} />
                    </div>

                    <div className="goal-progress-controls">
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          updateGoalProgress(goal.id, goal.progress - 10)
                        }
                        disabled={goal.progress === 0}
                      >
                        −10%
                      </button>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() =>
                          updateGoalProgress(goal.id, goal.progress + 10)
                        }
                        disabled={goal.progress === 100}
                      >
                        +10%
                      </button>
                    </div>

                    <div className="goal-card-footer">
                      <div>
                        <span className="muted-label">Target</span>
                        <strong>{formatMoney(goal.target)}</strong>
                      </div>
                      <div>
                        <span className="muted-label">Deadline</span>
                        <strong>{formatDate(goal.deadline)}</strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <Footer />
          </section>
        )}
      </main>
    </div>
  );
}

function makeDonutGradient(
  items: { category: string; amount: number }[],
): string {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  if (total <= 0) return "var(--color-surface-soft)";

  const colors = [
    "var(--color-chart-housing)",
    "var(--color-chart-food)",
    "var(--color-chart-transport)",
    "var(--color-chart-fun)",
    "var(--color-income)",
  ];

  let current = 0;
  const segments = items.map((item, index) => {
    const start = current;
    current += (item.amount / total) * 100;
    return `${colors[index % colors.length]} ${start}% ${current}%`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="welcome-section">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}<span>.</span></h1>
        <p className="welcome-description">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClass = "balance-icon",
  variant = "",
  footer,
}: {
  label: string;
  value: string;
  icon: string;
  iconClass?: string;
  variant?: string;
  footer: string;
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon ${iconClass}`}>{icon}</span>
      </div>
      <h2>{value}</h2>
      <div className="stat-foot">{footer}</div>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon: string;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-tasks">
      <span>{icon}</span>
      <p>{title}</p>
      <p>{message}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}

function TaskList({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="✓"
        title="Nothing on your list yet"
        message="Add a task to turn your plans into progress."
      />
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <div
          className={`task-item ${task.completed ? "completed" : ""}`}
          key={task.id}
        >
          <button
            type="button"
            className={`task-checkbox ${task.completed ? "checked" : ""}`}
            onClick={() => onToggle(task.id)}
            aria-label={
              task.completed
                ? `Mark ${task.title} incomplete`
                : `Complete ${task.title}`
            }
          >
            {task.completed ? "✓" : ""}
          </button>
          <div className="task-details">
            <span className="task-title">{task.title}</span>
            <div className="task-meta">
              <span className="task-time">{task.time}</span>
              <span className="task-category">{task.category}</span>
              <span className={`priority ${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="delete-task-button"
            onClick={() => onDelete(task.id)}
            aria-label={`Delete ${task.title}`}
            title="Delete task"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function TaskForm({
  initialDate,
  onSubmit,
  onCancel,
}: {
  initialDate: string;
  onSubmit: (task: Omit<Task, "id" | "completed">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState("09:00");
  const [category, setCategory] = useState("Personal");
  const [priority, setPriority] = useState<Priority>("Medium");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      date,
      time,
      category,
      priority,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label htmlFor="task-title">Task name</label>
      <input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What do you need to do?"
        required
        maxLength={120}
      />

      <div className="task-form-row">
        <div>
          <label htmlFor="task-date">Date</label>
          <input
            id="task-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="task-time">Time</label>
          <input
            id="task-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="task-form-row">
        <div>
          <label htmlFor="task-category">Category</label>
          <select
            id="task-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>Personal</option>
            <option>Work</option>
            <option>Study</option>
            <option>Health</option>
            <option>Finance</option>
            <option>Family</option>
          </select>
        </div>
        <div>
          <label htmlFor="task-priority">Priority</label>
          <select
            id="task-priority"
            value={priority}
            onChange={(event) => setPriority(event.target.value as Priority)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button className="save-task-button" type="submit">
          Save task
        </button>
        <button
          className="cancel-button"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function TransactionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (transaction: Omit<Transaction, "id">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<TransactionType>("Expense");
  const [category, setCategory] = useState("Food");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());

  const categories =
    type === "Income" ? incomeCategories : expenseCategories;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!title.trim() || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      return;
    }

    onSubmit({
      title: title.trim(),
      type,
      category,
      amount: numericAmount,
      date,
    });
  }

  return (
    <form className="task-form transaction-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h3>New transaction</h3>
          <p>Enter the details below</p>
        </div>
      </div>

      <label htmlFor="transaction-title">Description</label>
      <input
        id="transaction-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Monthly salary"
        required
        maxLength={120}
      />

      <div className="task-form-row">
        <div>
          <label htmlFor="transaction-type">Type</label>
          <select
            id="transaction-type"
            value={type}
            onChange={(event) => {
              const nextType = event.target.value as TransactionType;
              setType(nextType);
              setCategory(nextType === "Income" ? "Salary" : "Food");
            }}
          >
            <option>Expense</option>
            <option>Income</option>
          </select>
        </div>
        <div>
          <label htmlFor="transaction-category">Category</label>
          <select
            id="transaction-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="task-form-row">
        <div>
          <label htmlFor="transaction-amount">Amount (TND)</label>
          <input
            id="transaction-amount"
            type="number"
            min="0.001"
            step="0.001"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.000"
            required
          />
        </div>
        <div>
          <label htmlFor="transaction-date">Date</label>
          <input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="save-task-button" type="submit">
          Save transaction
        </button>
        <button
          className="cancel-button"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function GoalForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (goal: Omit<Goal, "id" | "progress">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("Personal");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const targetAmount = Number(target);
    if (
      !title.trim() ||
      !Number.isFinite(targetAmount) ||
      targetAmount <= 0
    ) {
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      target: targetAmount,
      deadline,
      category,
    });
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="panel-header">
        <div>
          <h3>Create a goal</h3>
          <p>Define a target and track your progress</p>
        </div>
      </div>

      <label htmlFor="goal-title">Goal name</label>
      <input
        id="goal-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="e.g. Build an emergency fund"
        required
        maxLength={100}
      />

      <label htmlFor="goal-description">Description (optional)</label>
      <textarea
        id="goal-description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Why is this goal important to you?"
        rows={2}
        maxLength={300}
      />

      <div className="task-form-row">
        <div>
          <label htmlFor="goal-target">Target amount (TND)</label>
          <input
            id="goal-target"
            type="number"
            min="0.001"
            step="0.001"
            value={target}
            onChange={(event) => setTarget(event.target.value)}
            placeholder="1000.000"
            required
          />
        </div>
        <div>
          <label htmlFor="goal-deadline">Deadline</label>
          <input
            id="goal-deadline"
            type="date"
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
          />
        </div>
      </div>

      <label htmlFor="goal-category">Category</label>
      <select
        id="goal-category"
        value={category}
        onChange={(event) => setCategory(event.target.value)}
      >
        <option>Personal</option>
        <option>Finance</option>
        <option>Career</option>
        <option>Health</option>
        <option>Education</option>
        <option>Travel</option>
        <option>Other</option>
      </select>

      <div className="form-actions">
        <button className="save-task-button" type="submit">
          Create goal
        </button>
        <button
          className="cancel-button"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function SnapshotRow({
  label,
  value,
  type,
}: {
  label: string;
  value: string;
  type: "income" | "expense";
}) {
  return (
    <div className="snapshot-row">
      <span className={`snapshot-indicator ${type}`} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Footer() {
  return (
    <footer className="dashboard-footer">
      <span>LifeFlow · Make every day count.</span>
      <span>Your progress, at your pace.</span>
    </footer>
  );
}

export default App;
