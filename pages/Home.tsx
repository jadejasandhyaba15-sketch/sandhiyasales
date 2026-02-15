
import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/generators';
import { Bell, ArrowRight, Lock, Unlock, ChevronRight, Wifi } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111111] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
         <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#E60023] rounded-full mx-auto flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(230,0,35,0.4)]">
                <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">Sandhiya System</h1>
            <p className="text-gray-400 font-medium">Secured Access Portal</p>
         </div>

         <form onSubmit={handleLogin} className="bg-[#191919] p-8 rounded-[32px] border border-[#333] shadow-2xl space-y-6">
             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-2">Security Pin</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(false); }}
                    className="w-full bg-[#222] text-white h-14 rounded-full pl-6 pr-12 text-lg font-bold tracking-widest outline-none border border-transparent focus:border-[#E60023] transition-colors placeholder-gray-600"
                    placeholder="Enter PIN"
                    autoFocus
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                     {pin.length > 0 && <div className="w-2 h-2 bg-[#E60023] rounded-full animate-pulse"></div>}
                  </div>
                </div>
             </div>

             {error && (
               <p className="text-red-500 text-sm font-semibold text-center animate-pulse">Incorrect PIN. Access Denied.</p>
             )}

             <button 
               type="submit"
               className="w-full h-14 bg-[#E60023] hover:bg-[#c5001e] text-white rounded-full font-bold text-lg shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2 group"
             >
                Unlock System
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
             </button>
         </form>

         <p className="text-center text-[#333] text-xs font-bold mt-8 uppercase tracking-widest">Authorized Personnel Only</p>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const { bills, employees, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Duplicate employees array to create seamless loop effect
  // If we have few employees, we duplicate them more times to fill width
  const marqueeList = employees.length > 0 
    ? [...employees, ...employees, ...employees, ...employees] 
    : [];

  return (
    <div className="space-y-6 md:space-y-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header Section with Marquee */}
      <header className="mb-4 md:mb-8 px-2 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
        <div className="flex-shrink-0">
          <h2 className="text-2xl md:text-4xl font-semibold text-[#111] dark:text-white transition-colors tracking-tight">Dashboard</h2>
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-lg md:text-xl text-[#E60023] font-bold tracking-wide">Jay Swaminarayan</p>
          </div>
        </div>

        {/* Employee Marquee Animation */}
        {employees.length > 0 && (
          <div className="flex-1 w-full overflow-hidden relative mask-linear-fade">
             <div className="flex items-center gap-4 animate-scroll w-max">
                {marqueeList.map((emp, index) => (
                  <div key={`${emp.id}-${index}`} className="flex items-center gap-3 bg-white dark:bg-[#191919] p-2 pr-4 rounded-full border border-gray-100 dark:border-[#333] shadow-sm flex-shrink-0">
                      <div className="relative">
                        <img 
                          src={emp.imageUrl} 
                          alt={emp.name} 
                          className="w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#333]"
                        />
                         <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#333] rounded-full"></div>
                      </div>
                      <div className="text-left">
                          <p className="text-xs font-bold text-[#111] dark:text-white truncate max-w-[100px]">{emp.name}</p>
                          <p className="text-[9px] text-gray-500 dark:text-gray-400 font-medium truncate max-w-[100px]">{emp.role}</p>
                      </div>
                  </div>
                ))}
             </div>
             {/* Gradient Masks for Fade Effect */}
             <div className="absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white dark:from-[#111] to-transparent pointer-events-none"></div>
             <div className="absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white dark:from-[#111] to-transparent pointer-events-none"></div>
          </div>
        )}
      </header>

      {/* Removed Total Revenue Stats Grid as requested */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mt-4">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm border border-transparent dark:border-[#333333] p-5 md:p-8 transition-colors">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-xl md:text-2xl font-semibold text-[#111] dark:text-white">Recent sales</h3>
            <Link to="/csl" className="px-4 py-2 md:px-5 md:py-3 rounded-full bg-[#E9E9E9] dark:bg-[#333333] text-[#111] dark:text-white font-semibold text-xs md:text-sm hover:bg-[#d1d1d1] dark:hover:bg-[#444] transition-colors pin-btn">
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {bills.slice(0, 5).map((bill) => (
              <div key={bill.id} className="flex items-center justify-between p-3 md:p-4 hover:bg-[#F9F9F9] dark:hover:bg-[#282828] rounded-[20px] md:rounded-[24px] transition-colors cursor-pointer group pin-btn">
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#F0F0F0] dark:bg-[#333333] flex items-center justify-center text-[#111] dark:text-white font-semibold text-base md:text-lg">
                    {bill.senderName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-semibold text-[#111] dark:text-white truncate w-32 md:w-auto group-hover:text-[#E60023] transition-colors">{bill.senderName}</p>
                    <div className="flex items-center text-xs md:text-sm font-medium text-gray-500">
                        <span className="truncate max-w-[80px] md:max-w-none">to {bill.receiverName}</span>
                        <span className="mx-1 md:mx-2">•</span>
                        <span>{new Date(bill.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm md:text-base font-semibold text-[#111] dark:text-white">{formatCurrency(bill.totalAmount)}</span>
              </div>
            ))}
            {bills.length === 0 && <p className="text-center text-gray-500 py-8 font-semibold">Waiting for sales data...</p>}
          </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm border border-transparent dark:border-[#333333] p-5 md:p-8 transition-colors flex flex-col gap-4 md:gap-6">
          <div>
              <h3 className="text-xl md:text-2xl font-semibold text-[#111] dark:text-white mb-3 md:mb-4">System status</h3>
              <div className="bg-[#E9F6FF] dark:bg-[#1A2A38] p-4 md:p-6 rounded-[24px] md:rounded-[32px] flex items-start gap-3 md:gap-4 transition-colors">
                <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/50 rounded-full flex-shrink-0 text-green-600 dark:text-green-400">
                    <Wifi className="h-5 w-5 md:h-6 md:w-6" strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className="font-semibold text-[#111] dark:text-white text-base md:text-lg">Online & Active</h4>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 mt-1 font-medium leading-relaxed">
                    Connected to cloud. Automation running for Leuva/Kadva Patel data. Persistence enabled.
                    </p>
                </div>
              </div>
          </div>
          
           <div className="p-4 md:p-6 bg-[#F9F9F9] dark:bg-[#282828] rounded-[24px] md:rounded-[32px] transition-colors flex-1">
              <h4 className="font-semibold text-[#111] dark:text-white mb-2 md:mb-3 text-base md:text-lg">Tax configuration</h4>
              <div className="flex justify-between items-center text-sm md:text-base mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">Fixed rate</span>
                  <span className="font-semibold text-[#111] dark:text-white">₹28,000.00</span>
              </div>
              <div className="w-full bg-[#E9E9E9] dark:bg-[#444] h-2 md:h-3 rounded-full mt-2 overflow-hidden">
                  <div className="bg-[#E60023] h-full rounded-full w-full"></div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-3 md:mt-4 font-semibold uppercase tracking-wide">Applied automatically</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
