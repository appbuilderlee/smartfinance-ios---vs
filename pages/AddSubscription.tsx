
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { TransactionType } from '../types';
import { getCurrencySymbol } from '../utils/currency';

const SERVICE_ICON_PRESETS = [
  { label: 'Netflix', value: 'emoji:🎬' },
  { label: 'Spotify', value: 'emoji:🎵' },
  { label: 'YouTube', value: 'emoji:▶️' },
  { label: 'Disney+', value: 'emoji:🧞' },
  { label: 'Apple / iCloud', value: 'emoji:🍎' },
  { label: 'HBO / Max', value: 'emoji:📺' },
  { label: 'Prime', value: 'emoji:📦' },
  { label: 'ChatGPT', value: 'emoji:🤖' },
  { label: 'Dropbox', value: 'emoji:🗄️' },
  { label: '其他', value: '' },
];

const AddSubscription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { addSubscription, updateSubscription, deleteSubscription, subscriptions, currency, categories } = useData();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'Monthly' | 'Yearly' | 'Weekly' | 'BiWeekly'>('Monthly');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notify, setNotify] = useState(true);
  const [daysBefore, setDaysBefore] = useState('3');
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [notes, setNotes] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const isEdit = Boolean(id);
  const [fromPath] = useState(() => (location.state as any)?.from || window.history.state?.usr?.from || '');
  const [returnTo] = useState(() => (location.state as any)?.returnTo || '/subscriptions');
  const [icon, setIcon] = useState<string>('');

  // Prefill when editing
  useEffect(() => {
    if (!isEdit) return;
    const target = subscriptions.find(s => s.id === id);
    if (!target) return;
    setName(target.name);
    setAmount(String(target.amount));
    setCycle(target.billingCycle);
    setDate(target.nextBillingDate || '');
    setAutoRenewal(target.autoRenewal ?? true);
    setNotify(target.notify ?? true);
    setDaysBefore(String(target.daysBefore ?? 3));
    setNotes(target.notes || '');
    setCategoryId(target.categoryId || '');
    setIcon(target.icon || '');
  }, [isEdit, id, subscriptions]);

  // Default to first expense category for quick entry
  useEffect(() => {
    if (categoryId) return;
    const firstExpense = categories.find(c => c.type === TransactionType.EXPENSE);
    if (firstExpense) setCategoryId(firstExpense.id);
  }, [categories, categoryId]);

  const handleSave = () => {
    if (!name || !amount) {
      alert("請輸入名稱與金額");
      return;
    }

    if (!categoryId) {
      alert("請選擇分類");
      return;
    }

    if (isEdit && id) {
      updateSubscription(id, {
        name,
        amount: parseFloat(amount),
        billingCycle: cycle,
        nextBillingDate: date,
        autoRenewal,
        notify,
        daysBefore: Number(daysBefore) || 0,
        notes,
        categoryId,
        icon
      });
    } else {
      addSubscription({
        name,
        amount: parseFloat(amount),
        billingCycle: cycle,
        nextBillingDate: date,
        autoRenewal,
        notify,
        daysBefore: Number(daysBefore) || 0,
        notes,
        categoryId,
        icon
      });
    }

    navigate(returnTo, { replace: true, state: { from: fromPath || '/settings' } });
  };

  const handleDelete = () => {
    if (!isEdit || !id) return;
    if (window.confirm('確定要刪除這筆訂閱嗎？')) {
      deleteSubscription(id);
      navigate(returnTo, { replace: true, state: { from: fromPath || '/settings' } });
    }
  };

  const handleBack = () => {
    navigate(returnTo, { replace: true, state: { from: fromPath || '/settings' } });
  };

  return (
    <div className="min-h-screen bg-background pt-safe-top pb-10">
      {/* Header */}
      <div className="px-4 py-3 flex justify-between items-center sf-topbar sticky top-0 z-50">
        <button onClick={handleBack} className="flex items-center text-primary">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-white">{isEdit ? '編輯訂閱' : '新增訂閱'}</h2>
        <div className="w-8"></div>
      </div>

      <div className="p-4 space-y-6">

        {/* Name */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">訂閱名稱</label>
          <div className="sf-control rounded-xl px-4 py-3">
            <input
              type="text"
              placeholder="例如：Netflix"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">金額</label>
          <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
            <span className="text-gray-400 text-sm">{getCurrencySymbol(currency)}</span>
          </div>
        </div>

        {/* Cycle */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">扣款週期</label>
          <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as 'Monthly' | 'Yearly' | 'Weekly' | 'BiWeekly')}
              className="bg-transparent text-white focus:outline-none appearance-none w-full"
            >
              <option value="Weekly" className="bg-surface">每週</option>
              <option value="BiWeekly" className="bg-surface">每2週</option>
              <option value="Monthly" className="bg-surface">每月</option>
              <option value="Yearly" className="bg-surface">每年</option>
            </select>
            {/* Mock dropdown indicator */}
            <div className="w-4 h-4 bg-gray-500/50 rounded-sm flex items-center justify-center pointer-events-none">
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">分類</label>
          <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            >
              {categories.filter(c => c.type === TransactionType.EXPENSE).map(cat => (
                <option key={cat.id} value={cat.id} className="bg-surface">
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="w-4 h-4 bg-gray-500/50 rounded-sm flex items-center justify-center pointer-events-none">
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">首次扣款日期</label>
          <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            />
            <Calendar size={18} className="text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Notes (Optional) */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">備註 (選填)</label>
          <div className="sf-control rounded-xl px-4 py-3">
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none h-20 resize-none"
              placeholder="例如：家庭方案共有 ..."
            />
          </div>
        </div>

        <div className="pt-4 pb-2">
          <div className="h-[1px] sf-divider w-full"></div>
        </div>

        {/* Icon preset */}
        <div>
          <label className="text-gray-400 text-xs ml-1 mb-2 block">服務圖示 (可選)</label>
          <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-full"
            >
              {SERVICE_ICON_PRESETS.map(opt => (
                <option key={opt.value || opt.label} value={opt.value} className="bg-surface">
                  {opt.label} {opt.value.startsWith('emoji:') ? opt.value.replace('emoji:', '') : ''}
                </option>
              ))}
            </select>
            <div className="w-4 h-4 bg-gray-500/50 rounded-sm flex items-center justify-center pointer-events-none">
              <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-white"></div>
            </div>
          </div>
          {icon && (
            <p className="text-xs text-primary mt-2">已選：{icon.startsWith('emoji:') ? icon.replace('emoji:', '') : icon}</p>
          )}
        </div>

        {/* Auto Renewal */}
        <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-white">自動續訂</span>
          <div
            onClick={() => setAutoRenewal(!autoRenewal)}
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${autoRenewal ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-all ${autoRenewal ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
          </div>
        </div>

        {/* Notification Toggle */}
        <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
          <span className="text-white">扣款前通知</span>
          <div
            onClick={() => setNotify(!notify)}
            className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${notify ? 'bg-green-500' : 'bg-gray-600'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-all ${notify ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
          </div>
        </div>

        {/* Reminder Time */}
        {notify && (
          <div className="animate-fade-in-down">
            <label className="text-gray-400 text-xs ml-1 mb-2 block">提醒時間</label>
            <div className="sf-control rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-white">提前 {daysBefore} 天</span>
              <div className="flex gap-2">
                <button onClick={() => setDaysBefore(String(Math.max(1, parseInt(daysBefore) - 1)))} className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">-</button>
                <button onClick={() => setDaysBefore(String(parseInt(daysBefore) + 1))} className="w-6 h-6 bg-gray-600 rounded flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl mt-8 transition-all active:scale-[0.99] shadow-lg shadow-green-500/20"
        >
          {isEdit ? '更新' : '儲存'}
        </button>

        {isEdit && (
          <button
            onClick={handleDelete}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.99] shadow-lg shadow-red-500/20"
          >
            刪除訂閱
          </button>
        )}

      </div>
    </div>
  );
};

export default AddSubscription;
