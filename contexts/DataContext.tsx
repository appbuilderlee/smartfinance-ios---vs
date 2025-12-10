
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Budget, Subscription, TransactionType, Currency } from '../types';
import { MOCK_TRANSACTIONS, CATEGORIES, MOCK_BUDGETS, MOCK_SUBSCRIPTIONS } from '../constants';

export interface CreditCard {
  id: string;
  name: string;
  lastFourDigits: string;
  annualFee: number;
  feeMonth: number;
  cashbackType: string;
  expiryDate: string;
  creditLimit?: number;
}

export type ThemeColor = 'blue' | 'red' | 'green' | 'purple' | 'orange' | 'pink' | 'ios26' | 'blackgold' | 'light';

interface DataContextType {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  subscriptions: Subscription[];
  currency: Currency;
  creditCards: CreditCard[];
  themeColor: ThemeColor;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  deleteSubscription: (id: string) => void;
  getCategory: (id: string) => Category | undefined;
  addBudget: (budget: Omit<Budget, 'spent'>) => void;
  deleteBudget: (categoryId: string) => void;
  updateBudget: (categoryId: string, limit: number) => void;
  deleteCategory: (id: string) => void;
  addCategory: (cat: Category) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  setCurrency: (c: Currency) => void;
  addCreditCard: (card: CreditCard) => void;
  deleteCreditCard: (id: string) => void;
  updateCreditCard: (id: string, updates: Partial<CreditCard>) => void;
  setCreditCards: (cards: CreditCard[]) => void;
  setThemeColor: (color: ThemeColor) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load data from localStorage or fallback to Mock Data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('smartfinance_transactions');
    return saved ? JSON.parse(saved) : MOCK_TRANSACTIONS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('smartfinance_categories');
    return saved ? JSON.parse(saved) : CATEGORIES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('smartfinance_budgets');
    return saved ? JSON.parse(saved) : MOCK_BUDGETS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('smartfinance_subscriptions');
    return saved ? JSON.parse(saved) : MOCK_SUBSCRIPTIONS;
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('smartfinance_currency');
    return (saved as Currency) || Currency.TWD;
  });

  const [creditCards, setCreditCards] = useState<CreditCard[]>(() => {
    const saved = localStorage.getItem('smartfinance_creditcards');
    return saved ? JSON.parse(saved) : [];
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    const saved = localStorage.getItem('smartfinance_themecolor');
    return (saved as ThemeColor) || 'blue';
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('smartfinance_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('smartfinance_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('smartfinance_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('smartfinance_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('smartfinance_currency', currency);
  }, [currency]);

  // Budget Spending Logic (Recalculate spent whenever transactions change)
  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // 1. Sync Categories to Budgets (Ensure every category has a budget)
    const existingBudgetIds = new Set(budgets.map(b => b.categoryId));
    const missingBudgets = categories
      .filter(c => !existingBudgetIds.has(c.id))
      .map(c => ({ categoryId: c.id, limit: 0, spent: 0 }));

    let nextBudgets = [...budgets, ...missingBudgets];

    // 2. Recalculate Spent
    nextBudgets = nextBudgets.map(budget => {
      const spent = transactions.reduce((total, t) => {
        const tDate = new Date(t.date);
        if (
          t.categoryId === budget.categoryId &&
          t.type === TransactionType.EXPENSE &&
          tDate.getMonth() === currentMonth &&
          tDate.getFullYear() === currentYear
        ) {
          return total + t.amount;
        }
        return total;
      }, 0);
      return { ...budget, spent };
    });

    // Only update if changed
    if (JSON.stringify(nextBudgets) !== JSON.stringify(budgets)) {
      setBudgets(nextBudgets);
    }
  }, [transactions, categories]); // Added categories dependency

  const addTransaction = (tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...tx,
      id: Math.random().toString(36).substr(2, 9),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addSubscription = (sub: Omit<Subscription, 'id'>) => {
    const newSub = { ...sub, id: Math.random().toString(36).substr(2, 9) };
    setSubscriptions(prev => [...prev, newSub]);
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);

  const updateBudget = (categoryId: string, limit: number) => {
    setBudgets(prev => prev.map(b => b.categoryId === categoryId ? { ...b, limit } : b));
  };

  const addBudget = (budget: Omit<Budget, 'spent'>) => {
    const newBudget = { ...budget, spent: 0 };
    setBudgets(prev => [...prev, newBudget]);
  };

  const deleteBudget = (categoryId: string) => {
    setBudgets(prev => prev.filter(b => b.categoryId !== categoryId));
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const addCategory = (cat: Category) => {
    setCategories(prev => [...prev, cat]);
    // Budget will be synced by the useEffect, but we can add it here optimistically if we want,
    // but the useEffect covering 'categories' change will handle it.
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const addCreditCard = (card: CreditCard) => {
    setCreditCards(prev => [...prev, card]);
  };

  const deleteCreditCard = (id: string) => {
    setCreditCards(prev => prev.filter(c => c.id !== id));
  };

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setCreditCards(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const resetData = () => {
    if (window.confirm("確定要重置所有資料？這將清除您的所有紀錄並恢復為範例資料。")) {
      localStorage.removeItem('smartfinance_transactions');
      localStorage.removeItem('smartfinance_categories');
      localStorage.removeItem('smartfinance_budgets');
      localStorage.removeItem('smartfinance_subscriptions');
      localStorage.removeItem('smartfinance_currency');
      localStorage.removeItem('smartfinance_creditcards');
      localStorage.removeItem('smartfinance_themecolor');
      setTransactions(MOCK_TRANSACTIONS);
      setCategories(CATEGORIES);
      setBudgets(MOCK_BUDGETS);
      setSubscriptions(MOCK_SUBSCRIPTIONS);
      setCurrencyState(Currency.TWD);
      setCreditCards([]);
      setThemeColorState('blue');
      alert("資料已重置");
    }
  };

  // Persistence for credit cards
  useEffect(() => {
    localStorage.setItem('smartfinance_creditcards', JSON.stringify(creditCards));
  }, [creditCards]);

  // Persistence and application of theme color
  useEffect(() => {
    localStorage.setItem('smartfinance_themecolor', themeColor);

    // Theme configurations
    const themes: Record<ThemeColor, { primary: string; bg: string; surface: string; text: string }> = {
      blue: { primary: '#3b82f6', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      red: { primary: '#ef4444', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      green: { primary: '#22c55e', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      purple: { primary: '#a855f7', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      orange: { primary: '#f97316', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      pink: { primary: '#ec4899', bg: '#0f172a', surface: '#1e293b', text: '#ffffff' },
      ios26: { primary: '#06b6d4', bg: 'rgba(15, 23, 42, 0.8)', surface: 'rgba(30, 41, 59, 0.6)', text: '#ffffff' },
      blackgold: { primary: '#d4af37', bg: '#0a0a0a', surface: '#1a1a1a', text: '#ffffff' },
      light: { primary: '#3b82f6', bg: '#f8fafc', surface: '#ffffff', text: '#1e293b' }
    };

    const theme = themes[themeColor];
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-bg', theme.bg);
    document.documentElement.style.setProperty('--color-surface', theme.surface);
    document.documentElement.style.setProperty('--color-text', theme.text);

    // Apply glassmorphism for iOS26 theme
    if (themeColor === 'ios26') {
      document.documentElement.classList.add('theme-ios26');
    } else {
      document.documentElement.classList.remove('theme-ios26');
    }

    // Apply light theme class
    if (themeColor === 'light') {
      document.documentElement.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
    }
  }, [themeColor]);

  // Auto-create expense transactions for due subscriptions
  useEffect(() => {
    if (!subscriptions.length) return;

    const todayStr = new Date().toISOString().split('T')[0];

    const addCycle = (date: Date, cycle: Subscription['billingCycle']) => {
      const d = new Date(date);
      if (cycle === 'Weekly') d.setDate(d.getDate() + 7);
      else if (cycle === 'BiWeekly') d.setDate(d.getDate() + 14);
      else if (cycle === 'Monthly') d.setMonth(d.getMonth() + 1);
      else if (cycle === 'Yearly') d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    };

    const pickCategoryId = (sub: Subscription) => {
      if (sub.categoryId) return sub.categoryId;
      const subscriptionCat = categories.find(c => c.name.includes('訂閱'));
      if (subscriptionCat) return subscriptionCat.id;
      const entertainment = categories.find(c => c.name.includes('娛樂'));
      const firstExpense = categories.find(c => c.type === TransactionType.EXPENSE);
      return (subscriptionCat || entertainment || firstExpense || categories[0])?.id || '';
    };

    let newTransactions: Transaction[] = [];
    let changed = false;

    const updatedSubs = subscriptions.map(sub => {
      const parsed = new Date(sub.nextBillingDate);
      if (isNaN(parsed.getTime())) return sub;

      let nextDate = parsed;
      let iterations = 0;
      let processed = false;

      while (nextDate.toISOString().split('T')[0] <= todayStr && iterations < 24) {
        if (sub.lastProcessedDate === todayStr) break; // already processed today

        const categoryId = pickCategoryId(sub);
        const dueStr = nextDate.toISOString().split('T')[0];

        const tx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          amount: sub.amount,
          date: dueStr,
          note: `訂閱：${sub.name}`,
          categoryId,
          type: TransactionType.EXPENSE,
          isRecurring: true,
          tags: ['subscription']
        };
        newTransactions.push(tx);
        processed = true;

        if (sub.autoRenewal === false) {
          // Stop after one-time posting when不自動續訂
          nextDate = parsed;
          break;
        }

        nextDate = new Date(addCycle(nextDate, sub.billingCycle));
        iterations += 1;
      }

      if (processed) {
        changed = true;
        const nextBilling = sub.autoRenewal === false ? '' : nextDate.toISOString().split('T')[0];
        return { ...sub, nextBillingDate: nextBilling, lastProcessedDate: todayStr };
      }

      return sub;
    });

    if (newTransactions.length) {
      setTransactions(prev => [...newTransactions, ...prev]);
    }
    if (changed) {
      setSubscriptions(updatedSubs);
    }
  }, [subscriptions, categories]);

  return (
    <DataContext.Provider value={{
      transactions,
      categories,
      budgets,
      subscriptions,
      currency,
      creditCards,
      themeColor,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      getCategory,
      addCategory,
      deleteCategory,
      updateCategory,
  addBudget,
  deleteBudget,
  updateBudget,
      addSubscription,
      deleteSubscription,
      updateSubscription,
      setCurrency: setCurrencyState,
      resetData,
      addCreditCard,
      deleteCreditCard,
      updateCreditCard,
      setCreditCards,
      setThemeColor: setThemeColorState
    }}>
      {children}
    </DataContext.Provider>
  );
};
