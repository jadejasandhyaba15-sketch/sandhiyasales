
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { IndianRupee, Landmark, ShieldCheck, TrendingUp } from 'lucide-react';

// Custom CountUp Component
const CountUp: React.FC<{ end: number; duration?: number; prefix?: string; className?: string }> = ({ end, duration = 2000, prefix = '', className='' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    const startValue = count; 

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(startValue + (end - startValue) * ease);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration]);

  return (
    <span className={className}>
      {prefix}{new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.floor(count))}
    </span>
  );
};

const Payments: React.FC = () => {
  const { totalRevenue, totalSandhiyaTax, totalPathanTax } = useApp();
  
  return (
    <div className="space-y-6 md:space-y-8 h-full p-2 max-w-[1600px] mx-auto">
       <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-8">
         <div className="p-3 md:p-4 bg-[#E9E9E9] dark:bg-[#333333] rounded-full text-[#111] dark:text-white transition-colors">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
         </div>
         <div>
            <h2 className="text-2xl md:text-4xl font-semibold text-[#111] dark:text-white transition-colors">Payments & taxes</h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium mt-1">Real-time revenue monitoring</p>
         </div>
       </div>

       {/* Professional Pinterest-Style Grid Layout */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          
          {/* Card 1: Total Collection (Green Theme) */}
          <div className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:h-64 relative overflow-hidden group border border-transparent dark:border-[#333333] hover:shadow-lg transition-all animate-pop">
              <div className="absolute -right-6 -top-6 w-20 h-20 md:w-32 md:h-32 bg-emerald-100 dark:bg-emerald-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div className="p-3 md:p-4 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400">
                      <IndianRupee className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 md:px-3 md:py-1 rounded-full">Revenue</p>
                  </div>
              </div>

              <div className="relative z-10 mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total payment</p>
                  <CountUp end={totalRevenue} prefix="₹" className="text-3xl md:text-5xl font-semibold text-[#111] dark:text-white tracking-tight" />
              </div>
              
              <div className="relative z-10 mt-auto pt-3 md:pt-4 border-t border-gray-100 dark:border-[#333]">
                  <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                    Verified transactions via room 210
                  </span>
              </div>
          </div>

          {/* Card 2: Sandhiya Tax (Pinterest Red Theme) */}
          <div className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:h-64 relative overflow-hidden group border border-transparent dark:border-[#333333] hover:shadow-lg transition-all animate-pop" style={{ animationDelay: '0.1s' }}>
              <div className="absolute -right-6 -top-6 w-20 h-20 md:w-32 md:h-32 bg-red-100 dark:bg-red-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div className="p-3 md:p-4 bg-red-100 dark:bg-red-900/30 rounded-full text-[#E60023] dark:text-red-400">
                      <Landmark className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] md:text-xs font-bold text-[#E60023] dark:text-red-400 uppercase tracking-wider bg-red-50 dark:bg-red-900/20 px-2 py-1 md:px-3 md:py-1 rounded-full">Community</p>
                  </div>
              </div>

              <div className="relative z-10 mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Sandhiya tax</p>
                  <CountUp end={totalSandhiyaTax} prefix="₹" className="text-3xl md:text-5xl font-semibold text-[#111] dark:text-white tracking-tight" />
              </div>

              <div className="relative z-10 mt-auto pt-3 md:pt-4 border-t border-gray-100 dark:border-[#333]">
                  <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                     Fixed contribution (સંધિયા ટેક્સ)
                  </span>
              </div>
          </div>

          {/* Card 3: Pathan Tax (Purple Theme) */}
          <div className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm p-5 md:p-8 flex flex-col justify-between min-h-[180px] md:h-64 relative overflow-hidden group border border-transparent dark:border-[#333333] hover:shadow-lg transition-all animate-pop" style={{ animationDelay: '0.2s' }}>
              <div className="absolute -right-6 -top-6 w-20 h-20 md:w-32 md:h-32 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 flex justify-between items-start">
                  <div className="p-3 md:p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full text-purple-600 dark:text-purple-400">
                      <ShieldCheck className="w-6 h-6 md:w-8 md:h-8" strokeWidth={2.5} />
                  </div>
                  <div className="text-right">
                      <p className="text-[10px] md:text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider bg-purple-50 dark:bg-purple-900/20 px-2 py-1 md:px-3 md:py-1 rounded-full">Security</p>
                  </div>
              </div>

              <div className="relative z-10 mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Pathan tax</p>
                  <CountUp end={totalPathanTax} prefix="₹" className="text-3xl md:text-5xl font-semibold text-[#111] dark:text-white tracking-tight" />
              </div>

              <div className="relative z-10 mt-auto pt-3 md:pt-4 border-t border-gray-100 dark:border-[#333]">
                  <span className="text-[10px] md:text-xs font-medium text-gray-400 dark:text-gray-500">
                     Protection fund (પઠાણ ટેક્સ)
                  </span>
              </div>
          </div>

       </div>
    </div>
  );
};

export default Payments;
