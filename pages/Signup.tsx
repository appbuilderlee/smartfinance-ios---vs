import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

const Signup: React.FC = () => {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPw, setConfirmPw] = useState('');
   const [showPw, setShowPw] = useState(false);
   const { register } = useAuth();
   const navigate = useNavigate();

   const handleSignup = async (e: React.FormEvent) => {
      e.preventDefault();
      if (password !== confirmPw) {
         alert("密碼不一致");
         return;
      }

   try {
         await register(email, password);
         alert('註冊成功，驗證信已寄出，請完成驗證後再登入');
         navigate('/login');
   } catch (error: any) {
         console.error(error);
         let msg = '註冊失敗';
         if (error.code === 'auth/email-already-in-use') {
            msg = '此電子郵件已被註冊，請直接登入';
         } else if (error.code === 'auth/weak-password') {
            msg = '密碼強度不足，請使用更強的密碼';
         } else if (error.message) {
            msg = error.message;
         }
         alert(msg);
      }
   };

   return (
      <div className="min-h-screen bg-background pt-safe-top flex flex-col">
         <div className="px-4 py-3 sf-topbar">
            <button onClick={() => navigate('/welcome')} className="flex items-center text-gray-400">
               <ChevronLeft /> 返回
            </button>
         </div>

         <div className="flex-1 flex flex-col justify-center px-6 pb-20">
            <h1 className="text-3xl font-bold mb-8 text-white">註冊帳戶</h1>

            <form onSubmit={handleSignup} className="space-y-4">
               <div className="sf-control rounded-xl px-4 py-2">
                  <label className="text-xs text-gray-500 block">電子郵件</label>
                  <input
                     type="email"
                     className="w-full bg-transparent text-white focus:outline-none py-1"
                     value={email}
                     onChange={e => setEmail(e.target.value)}
                     required
                  />
               </div>

               <div className="sf-control rounded-xl px-4 py-2 flex items-center justify-between">
                  <div className="flex-1">
                     <label className="text-xs text-gray-500 block">密碼</label>
                     <input
                        type={showPw ? "text" : "password"}
                        className="w-full bg-transparent text-white focus:outline-none py-1"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={6}
                     />
                  </div>
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-500">
                     {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
               </div>

               <div className="sf-control rounded-xl px-4 py-2">
                  <label className="text-xs text-gray-500 block">確認密碼</label>
                  <input
                     type="password"
                     className="w-full bg-transparent text-white focus:outline-none py-1"
                     value={confirmPw}
                     onChange={e => setConfirmPw(e.target.value)}
                     required
                  />
               </div>

               <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-full mt-8 shadow-lg">
                  註冊
               </button>
            </form>

            <div className="mt-6 text-center">
               <p className="text-gray-500 text-sm">已有帳戶？ <button onClick={() => navigate('/login')} className="text-primary">登入</button></p>
            </div>
         </div>
      </div>
   );
};

export default Signup;
