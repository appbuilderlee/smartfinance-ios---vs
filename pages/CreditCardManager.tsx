
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, CreditCard, Trash2, X, Pencil, ArrowUp, ArrowDown } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface CreditCardType {
    id: string;
    name: string;
    lastFourDigits: string;
    annualFee: number;
    feeMonth: number; // 1-12
    cashbackType: string;
    expiryDate: string; // YYYY-MM
    creditLimit?: number;
}

const CreditCardManager: React.FC = () => {
    const navigate = useNavigate();
    const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard, setCreditCards } = useData();

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<CreditCardType>>({
        name: '',
        lastFourDigits: '',
        annualFee: 0,
        feeMonth: 1,
        cashbackType: '',
        expiryDate: '',
        creditLimit: undefined
    });

    const openAddModal = () => {
        setEditingId(null);
        setFormData({ name: '', lastFourDigits: '', annualFee: 0, feeMonth: 1, cashbackType: '', expiryDate: '', creditLimit: undefined });
        setShowModal(true);
    };

    const openEditModal = (card: CreditCardType) => {
        setEditingId(card.id);
        setFormData({ ...card });
        setShowModal(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.lastFourDigits) {
            alert('請填寫卡片名稱與末四碼');
            return;
        }

        if (editingId) {
            updateCreditCard(editingId, formData);
        } else {
            addCreditCard({
                ...formData,
                id: Math.random().toString(36).substr(2, 9)
            } as CreditCardType);
        }

        setShowModal(false);
    };

    const moveCard = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === creditCards.length - 1) return;

        const newCards = [...creditCards];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newCards[index], newCards[targetIndex]] = [newCards[targetIndex], newCards[index]];

        setCreditCards(newCards);
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return (
        <div className="min-h-screen bg-background pb-20 pt-safe-top">
            {/* Header */}
            <div className="px-4 py-3 flex justify-between items-center bg-surface sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="flex items-center text-primary">
                    <ChevronLeft size={24} />
                </button>
                <h2 className="text-lg font-semibold text-white">信用卡管理</h2>
                <button onClick={openAddModal} className="text-primary">
                    <Plus size={24} />
                </button>
            </div>

            <div className="p-4 space-y-4">
                {creditCards.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                        <p>尚未新增信用卡</p>
                        <button
                            onClick={openAddModal}
                            className="mt-4 text-primary"
                        >
                            + 新增信用卡
                        </button>
                    </div>
                ) : (
                    creditCards.map((card, index) => (
                        <div key={card.id} className="bg-surface rounded-2xl p-4 border border-gray-800 relative group">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <CreditCard size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{card.name}</h3>
                                        <p className="text-gray-500 text-sm">**** {card.lastFourDigits}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex flex-col mr-2">
                                        <button
                                            onClick={() => moveCard(index, 'up')}
                                            disabled={index === 0}
                                            className={`p-1 ${index === 0 ? 'text-gray-700' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <ArrowUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveCard(index, 'down')}
                                            disabled={index === creditCards.length - 1}
                                            className={`p-1 ${index === creditCards.length - 1 ? 'text-gray-700' : 'text-gray-400 hover:text-white'}`}
                                        >
                                            <ArrowDown size={16} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => openEditModal(card)}
                                        className="text-blue-400 p-2 hover:bg-white/5 rounded-full"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (window.confirm('確定要刪除此卡片嗎？')) {
                                                deleteCreditCard(card.id);
                                            }
                                        }}
                                        className="text-red-500 p-2 hover:bg-white/5 rounded-full"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-gray-500">年費</p>
                                    <p className="text-white">${card.annualFee.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">收費月份</p>
                                    <p className="text-white">{card.feeMonth}月</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">信用額度</p>
                                    <p className="text-white">{card.creditLimit ? `$${card.creditLimit.toLocaleString()}` : '未設定'}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-gray-500">回贈優惠</p>
                                    <p className="text-white whitespace-pre-line">{card.cashbackType || '無'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">到期日</p>
                                    <p className="text-white">{card.expiryDate || '未設定'}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-end">
                    <div className="bg-surface w-full rounded-t-3xl p-6 pb-safe-bottom animate-slide-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-white">{editingId ? '編輯信用卡' : '新增信用卡'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">卡片名稱</label>
                                <input
                                    type="text"
                                    placeholder="例如: 渣打 Simply Cash"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-background rounded-xl p-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">卡號末四碼</label>
                                <input
                                    type="text"
                                    placeholder="1234"
                                    maxLength={4}
                                    value={formData.lastFourDigits}
                                    onChange={e => setFormData({ ...formData, lastFourDigits: e.target.value })}
                                    className="w-full bg-background rounded-xl p-3 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">年費</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        value={formData.annualFee}
                                        onChange={e => setFormData({ ...formData, annualFee: Number(e.target.value) })}
                                        className="w-full bg-background rounded-xl p-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">信用額度</label>
                                    <input
                                        type="number"
                                        placeholder="例如 200000"
                                        value={formData.creditLimit ?? ''}
                                        onChange={e => setFormData({ ...formData, creditLimit: e.target.value === '' ? undefined : Number(e.target.value) })}
                                        className="w-full bg-background rounded-xl p-3 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-sm mb-1 block">收費月份</label>
                                    <select
                                        value={formData.feeMonth}
                                        onChange={e => setFormData({ ...formData, feeMonth: Number(e.target.value) })}
                                        className="w-full bg-background rounded-xl p-3 text-white"
                                    >
                                        {months.map(m => (
                                            <option key={m} value={m}>{m}月</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">回贈優惠 (每行一項)</label>
                                <textarea
                                    placeholder="例如:&#10;餐飲 4%&#10;網購 2%&#10;其他 1%"
                                    rows={3}
                                    value={formData.cashbackType}
                                    onChange={e => setFormData({ ...formData, cashbackType: e.target.value })}
                                    className="w-full bg-background rounded-xl p-3 text-white resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-gray-400 text-sm mb-1 block">到期日</label>
                                <input
                                    type="month"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full bg-background rounded-xl p-3 text-white"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                className="w-full bg-primary py-4 rounded-xl font-bold text-white mt-4"
                            >
                                {editingId ? '儲存變更' : '新增'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditCardManager;
