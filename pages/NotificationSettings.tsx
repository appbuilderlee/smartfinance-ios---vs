import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarCheck } from 'lucide-react';

const NotificationSettings: React.FC = () => {
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState(true);
  const [time, setTime] = useState("20:00");

  // Function to generate and download ICS file for iOS Calendar
  const addToCalendar = () => {
    // Construct the event start date (today at the selected time)
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    now.setHours(hours, minutes, 0);
    
    // Format date for ICS (YYYYMMDDTHHMMSS)
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    // ICS Content
    // RRULE:FREQ=DAILY ensures it repeats every day
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SmartFinance//App//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@smartfinance.app`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(now)}`,
      'RRULE:FREQ=DAILY',
      'SUMMARY:SmartFinance 記帳提醒',
      'DESCRIPTION:記得記錄今天的收支喔！保持良好的理財習慣。',
      'BEGIN:VALARM',
      'TRIGGER:-PT5M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Reminder',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reminder.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background pt-safe-top">
      <div className="px-4 py-3 flex justify-between items-center sf-topbar sticky top-0 z-50">
        <button onClick={() => navigate(-1)} className="flex items-center text-primary">
          <ChevronLeft size={24} />
          <span>設定</span>
        </button>
        <h2 className="text-lg font-semibold">通知設定</h2>
        <div className="w-16"></div>
      </div>

      <div className="p-4 mt-2 space-y-6">
         <div>
            <p className="text-gray-500 text-xs mb-2 ml-4">記帳提醒</p>
            <div className="sf-panel overflow-hidden divide-y sf-divider">
                {/* Toggle Row */}
                <div className="flex justify-between items-center p-4">
                  <span className="text-white text-base">開啟記帳提醒</span>
                  <div 
                    onClick={() => setEnabled(!enabled)}
                    className={`w-12 h-7 rounded-full relative cursor-pointer transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                  >
                      <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-md transition-all ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                  </div>
                </div>

                {/* Detail Rows */}
                {enabled && (
                  <>
                    <div className="flex justify-between items-center p-4 active:bg-gray-700/50 transition-colors cursor-pointer">
                      <span className="text-white">提醒頻率</span>
                      <div className="flex items-center gap-2">
                          <span className="text-gray-400">每日</span>
                          <ChevronRight size={16} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 active:bg-gray-700/50 transition-colors cursor-pointer">
                      <span className="text-white">提醒時間</span>
                      <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="bg-transparent text-gray-400 focus:outline-none text-right"
                          />
                          <ChevronRight size={16} className="text-gray-500" />
                      </div>
                    </div>
                  </>
                )}
            </div>
         </div>

         {enabled && (
           <div className="animate-fade-in-up">
              <button 
                onClick={addToCalendar}
                className="w-full sf-panel border border-primary/50 text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/10 active:scale-[0.98] transition-all"
              >
                <CalendarCheck size={20} />
                加入 iPhone 行事曆
              </button>
              <p className="text-gray-500 text-xs mt-3 ml-4 leading-relaxed">
                點擊上方按鈕將下載日曆檔案 (.ics)。<br/>
                在 iPhone 上開啟後，請選擇「加入行事曆」即可在每天指定時間收到系統通知。
              </p>
            </div>
         )}
      </div>
    </div>
  );
};

export default NotificationSettings;
