import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-between bg-gradient-to-b from-slate-900 to-black p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-20%] w-80 h-80 bg-purple-600/20 rounded-full blur-[100px]" />

      <div className="mt-12 z-10 text-center">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">歡迎使用</h1>
        <p className="text-gray-400 text-sm">您的個人智能財務管家</p>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center gap-8 z-10">
        <div className="relative w-64 h-64">
           {/* Mocking the isometric visual from screenshot 1 with CSS/Icons */}
           <div className="absolute inset-0 flex items-center justify-center">
              <TrendingUp size={120} className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
           </div>
           
           {/* Feature Callouts */}
           <div className="absolute top-0 right-0 flex items-center gap-2 animate-pulse">
             <div className="h-[1px] w-8 bg-gray-500"></div>
             <span className="text-xs text-gray-300">預算規劃</span>
           </div>
           <div className="absolute bottom-10 right-0 flex items-center gap-2">
             <div className="h-[1px] w-8 bg-gray-500"></div>
             <span className="text-xs text-gray-300">即時報表</span>
           </div>
           <div className="absolute top-1/2 left-0 flex items-center gap-2 -translate-x-full">
             <span className="text-xs text-gray-300">智能記帳</span>
             <div className="h-[1px] w-8 bg-gray-500"></div>
           </div>
        </div>

        <div className="text-center space-y-2 max-w-xs">
          <p className="text-gray-300 font-medium">掌握財務，實現目標。</p>
          <p className="text-gray-500 text-sm">離線功能、生物辨識、數據安全。</p>
        </div>
      </div>

      <div className="space-y-4 mb-8 z-10">
        <button 
          onClick={() => navigate('/signup')}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-full transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25"
        >
          註冊
        </button>
        <button 
          onClick={() => navigate('/login')}
          className="w-full bg-transparent border border-primary text-primary hover:bg-primary/10 font-bold py-4 rounded-full transition-all active:scale-[0.98]"
        >
          登入
        </button>
        <div className="text-center">
           <span className="text-xs text-gray-600">使用 Expo React Native 構建 (Simulated)</span>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
