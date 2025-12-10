
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, X, Tag } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { Icon } from '../components/Icon';
import { getCurrencySymbol } from '../utils/currency';
import { TransactionType } from '../types';

const TransactionDetail: React.FC = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const { transactions, categories, updateTransaction, currency } = useData();
   const fileInputRef = useRef<HTMLInputElement>(null);

   const tx = transactions.find(t => t.id === id);

   // Local state for editing
   const [amount, setAmount] = useState(tx?.amount?.toString() || '0');
   const [selectedCategory, setSelectedCategory] = useState(tx?.categoryId || '');
   const [note, setNote] = useState(tx?.note || '');
   const [tags, setTags] = useState<string[]>(tx?.tags || []);
   const [tagInput, setTagInput] = useState('');
   const [receiptUrl, setReceiptUrl] = useState<string | undefined>(tx?.receiptUrl);
   const [isRecurring, setIsRecurring] = useState(tx?.isRecurring || false);
   const [date, setDate] = useState(tx?.date ? new Date(tx.date).toISOString().split('T')[0] : '');

   if (!tx) return <div className="pt-safe-top p-4 text-white">Not found</div>;

   const currentCategory = categories.find(c => c.id === selectedCategory);
   const transactionType = currentCategory?.type || tx.type;

   const handleSave = () => {
      const localDate = new Date(date + 'T00:00:00');
      updateTransaction(tx.id, {
         amount: parseFloat(amount) || tx.amount,
         categoryId: selectedCategory,
         note,
         tags,
         receiptUrl,
         isRecurring,
         date: localDate.toISOString(),
         type: transactionType
      });
      navigate(-1);
   };

   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
         const reader = new FileReader();
         reader.onloadend = () => {
            setReceiptUrl(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const addTag = () => {
      if (tagInput.trim() && !tags.includes(tagInput.trim())) {
         setTags([...tags, tagInput.trim()]);
         setTagInput('');
      }
   };

   const removeTag = (tagToRemove: string) => {
      setTags(tags.filter(t => t !== tagToRemove));
   };

   return (
      <div className="min-h-screen bg-background pb-safe-bottom">
         {/* Header */}
         <div className="pt-safe-top px-4 py-3 flex justify-between items-center bg-background/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5">
            <button onClick={() => navigate(-1)} className="flex items-center text-primary text-base active:opacity-70">
               <ChevronLeft size={24} />
               <span>返回</span>
            </button>
            <h2 className="text-lg font-semibold text-white">編輯帳目</h2>
            <button onClick={handleSave} className="text-primary font-bold text-base active:opacity-70">
               儲存
            </button>
         </div>

         <div className="p-4 space-y-6">
            {/* Amount Card - Editable */}
            <div className={`rounded-2xl p-6 text-center shadow-lg border border-gray-800 ${transactionType === TransactionType.INCOME ? 'bg-green-900/30' : 'bg-surface'}`}>
               <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl text-gray-400">{getCurrencySymbol(currency)}</span>
                  <input
                     type="number"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="text-4xl font-bold text-white bg-transparent text-center w-40 focus:outline-none border-b-2 border-gray-600 focus:border-primary"
                     inputMode="decimal"
                  />
               </div>

               {/* Category Selection */}
               <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-3">選擇分類</p>
                  <div className="flex flex-wrap justify-center gap-3">
                     {categories.filter(c => c.type === transactionType).map(cat => (
                        <button
                           key={cat.id}
                           onClick={() => setSelectedCategory(cat.id)}
                           className="flex flex-col items-center gap-1"
                        >
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${cat.id === selectedCategory
                                 ? `${cat.color} ring-2 ring-white scale-110`
                                 : 'bg-gray-700 text-gray-400'
                              }`}>
                              {cat.icon.startsWith('emoji:')
                                 ? <span className="text-lg">{cat.icon.replace('emoji:', '')}</span>
                                 : <Icon name={cat.icon} size={20} />}
                           </div>
                           <span className={`text-xs ${cat.id === selectedCategory ? 'text-white' : 'text-gray-500'}`}>{cat.name}</span>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Details List */}
            <div className="bg-surface rounded-2xl overflow-hidden divide-y divide-gray-800 border border-gray-800/50">
               <div className="p-4">
                  <span className="text-white text-base block mb-1">日期</span>
                  <input
                     type="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     className="w-full bg-transparent text-gray-400 focus:outline-none"
                  />
               </div>

               <div className="p-4">
                  <span className="text-white text-base block mb-1">備註</span>
                  <input
                     type="text"
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     className="w-full bg-transparent text-gray-400 focus:outline-none border-b border-gray-700 focus:border-blue-500 pb-1 transition-colors"
                  />
               </div>

               <div className="p-4">
                  <span className="text-white text-base block mb-3">標籤</span>
                  <div className="flex flex-wrap items-center gap-2">
                     {tags.map(tag => (
                        <span key={tag} className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                           {tag}
                           <button onClick={() => removeTag(tag)} className="hover:text-white"><X size={12} /></button>
                        </span>
                     ))}
                     <div className="flex items-center bg-gray-700/50 rounded-full px-2">
                        <Tag size={12} className="text-gray-500 mr-1" />
                        <input
                           type="text"
                           placeholder="新增"
                           value={tagInput}
                           onChange={e => setTagInput(e.target.value)}
                           onKeyDown={e => { if (e.key === 'Enter') addTag(); }}
                           onBlur={addTag}
                           className="bg-transparent text-white text-xs focus:outline-none w-16 py-1"
                        />
                     </div>
                  </div>
               </div>

               <div className="flex justify-between items-center p-4">
                  <span className="text-white text-base">週期性帳目</span>
                  <div
                     className="relative inline-block w-12 h-6 align-middle select-none transition duration-200 ease-in cursor-pointer"
                     onClick={() => setIsRecurring(!isRecurring)}
                  >
                     <div className={`absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-300 ${isRecurring ? 'translate-x-6 border-green-500' : 'translate-x-0 border-gray-400'}`}></div>
                     <div className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-300 ${isRecurring ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
               </div>

               {/* Receipt Editing */}
               <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-white text-base">收據照片</span>
                     <button onClick={() => fileInputRef.current?.click()} className="text-primary text-sm">
                        {receiptUrl ? '更換' : '新增'}
                     </button>
                  </div>

                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

                  {receiptUrl ? (
                     <div className="relative inline-block mt-2 w-full">
                        <img src={receiptUrl} alt="Receipt" className="h-48 w-full object-cover rounded-lg border border-gray-700 shadow-md" />
                        <button onClick={() => setReceiptUrl(undefined)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                           <X size={12} className="text-white" />
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-2 text-sm text-primary mt-1 border border-dashed border-gray-700 rounded-lg hover:bg-surface/50">
                           更換照片
                        </button>
                     </div>
                  ) : (
                     <div onClick={() => fileInputRef.current?.click()} className="h-32 rounded-lg border border-dashed border-gray-600 flex items-center justify-center text-gray-500 cursor-pointer mt-2 bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                        <Camera size={20} />
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
};

export default TransactionDetail;
