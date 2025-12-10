import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/authService';
import { Mail, Lock, Eye, EyeOff, PlayCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, demoLogin, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      console.error(error);
      alert('登入失敗: ' + (error.message || '請檢查帳號密碼'));
    }
  };

  const handleDemo = () => {
    demoLogin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center mb-10 text-white">登入帳戶</h1>
        
        {/* Logo or Icon placeholder */}
        <div className="flex justify-center mb-10">
           <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center">
              {/* Stacked coins icon simulation */}
              <div className="space-y-1">
                 <div className="w-10 h-3 border-2 border-gray-400 rounded-full"></div>
                 <div className="w-10 h-3 border-2 border-gray-400 rounded-full bg-gray-600"></div>
                 <div className="w-10 h-3 border-2 border-gray-400 rounded-full"></div>
              </div>
           </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative group">
             <Mail className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white" size={20} />
             <input 
               type="email" 
               placeholder="電子郵件"
               value={email}
               onChange={e => setEmail(e.target.value)}
               className="w-full bg-transparent border border-gray-600 rounded-xl py-4 pl-12 text-white focus:border-white focus:outline-none transition-colors"
               required
             />
          </div>
          
          <div className="relative group">
             <Lock className="absolute left-4 top-4 text-gray-500 group-focus-within:text-white" size={20} />
             <input 
               type={showPw ? "text" : "password"} 
               placeholder="密碼"
               value={password}
               onChange={e => setPassword(e.target.value)}
               className="w-full bg-transparent border border-gray-600 rounded-xl py-4 pl-12 pr-12 text-white focus:border-white focus:outline-none transition-colors"
               required
             />
             <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-4 text-gray-500">
               {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
             </button>
          </div>

          <button type="submit" className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl mt-6 transition-all shadow-lg shadow-blue-500/20">
             登入
          </button>
        </form>

        <div className="mt-4 space-y-4">
           <button 
             type="button" 
             onClick={handleDemo}
             className="w-full bg-surface border border-gray-700 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
           >
             <PlayCircle size={18} />
             體驗模式 (Demo)
           </button>
           
           <div className="text-center">
              <button
                className="text-gray-400 text-sm underline"
                onClick={async () => {
                  if (!email) {
                    alert('請先輸入 Email 再點選重設密碼');
                    return;
                  }
                  try {
                    await resetPassword(email);
                    alert('已寄出重設密碼郵件，請到信箱查收');
                  } catch (err: any) {
                    alert('重設密碼失敗：' + (err?.message || '請稍後再試'));
                  }
                }}
              >
                忘記密碼？
              </button>
           </div>
        </div>

        <div className="mt-8 text-center">
           <p className="text-gray-500">還沒有帳號？ <button onClick={() => navigate('/signup')} className="text-white font-medium">前往註冊</button></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
