
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, Plus, CreditCard, Users, MessageCircle, Sun, Moon, WifiOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import PullToRefresh from './PullToRefresh';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme, isOnline } = useApp();
  const location = useLocation();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  // Pinterest-style Icons & "First Letter Capital" Labels
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/csl', icon: Compass, label: 'Csl' }, // Pinterest 'Explore' vibe for Feed
    { to: '/invoice', icon: Plus, label: 'Create' }, // Pinterest 'Plus' style
    { to: '/payments', icon: CreditCard, label: 'Pay' },
    { to: '/chats', icon: MessageCircle, label: 'Chat' }, // Rounder message icon
  ];

  // Dummy refresh handler to simulate network request
  const handleRefresh = async () => {
     if (!isOnline) return;
     return new Promise<void>((resolve) => {
         setTimeout(() => {
             resolve();
         }, 1500);
     });
  };

  const isChatPage = location.pathname === '/chats';
  
  // Logic: Collapse is now GLOBAL on desktop. 
  // It is collapsed if the user is NOT hovering over it.
  const isCollapsed = !isSidebarHovered;

  return (
    <div className="flex h-[100dvh] bg-white dark:bg-[#111111] overflow-hidden transition-colors duration-300 relative">
      
      {/* OFFLINE BLOCKER OVERLAY */}
      {!isOnline && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
              <div className="w-24 h-24 bg-[#E60023] rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(230,0,35,0.6)] animate-pulse">
                  <WifiOff className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">No Internet Connection</h1>
              <p className="text-gray-400 text-lg max-w-md">
                  This system requires an active internet connection to synchronize data and process real-time automation.
              </p>
              <div className="mt-8 px-6 py-3 bg-[#333] rounded-full text-white text-sm font-semibold animate-pulse">
                  Reconnecting...
              </div>
          </div>
      )}

      {/* Sidebar (Desktop Only) with Next Level Animation */}
      <aside 
        className={`
            hidden md:flex flex-col z-20 transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
            bg-white dark:bg-[#111111] border-r border-transparent dark:border-[#333]
            ${isCollapsed ? 'w-[88px] px-3' : 'w-72 px-4'}
            py-6
        `}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-start px-2'} mb-8 transition-all duration-300`}>
          <div className="w-10 h-10 rounded-full bg-[#E60023] flex-shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-transform duration-300 hover:scale-110">
            S
          </div>
          <div className={`ml-3 overflow-hidden transition-all duration-500 ease-in-out ${isCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'}`}>
            <h1 className="text-xl font-bold text-[#E60023] tracking-tighter whitespace-nowrap">
              Sandhiya
            </h1>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <ul className="space-y-3">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center h-14 rounded-[20px] transition-all duration-300 group relative
                    ${isCollapsed ? 'justify-center w-full' : 'px-4 w-full'}
                    ${isActive 
                        ? 'bg-white dark:bg-[#1F1F1F] text-[#E60023] shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.6)] scale-105 z-10' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1F1F1F] hover:text-[#E60023] hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.6)] hover:scale-105 hover:z-10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Icon with Thinner Stroke */}
                      <item.icon 
                        className={`
                            flex-shrink-0 transition-all duration-300 
                            ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}
                            ${isCollapsed ? 'w-7 h-7' : 'w-6 h-6 mr-4'}
                        `} 
                        fill={isActive && (item.label === 'Home' || item.label === 'Chat' || item.label === 'Pay') ? "currentColor" : "none"}
                      />
                      
                      {/* Text Label Animation */}
                      <span 
                        className={`
                            text-[17px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            ${isCollapsed ? 'w-0 opacity-0 translate-x-4' : 'w-auto opacity-100 translate-x-0'}
                        `}
                      >
                        {item.label}
                      </span>

                      {/* Hover Tooltip for Collapsed Mode */}
                      {isCollapsed && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111] dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                              {item.label}
                          </div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            
            <li key="employees">
                <NavLink
                  to="/employees"
                  className={({ isActive }) =>
                    `flex items-center h-14 rounded-[20px] transition-all duration-300 group relative
                    ${isCollapsed ? 'justify-center w-full' : 'px-4 w-full'}
                    ${isActive 
                        ? 'bg-white dark:bg-[#1F1F1F] text-[#E60023] shadow-[0_8px_25px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.6)] scale-105 z-10' 
                        : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-[#1F1F1F] hover:text-[#E60023] hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_8px_20px_-5px_rgba(0,0,0,0.6)] hover:scale-105 hover:z-10'
                    }`
                  }
                >
                    {({ isActive }) => (
                    <>
                      <Users 
                        className={`
                            flex-shrink-0 transition-all duration-300 
                            ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}
                            ${isCollapsed ? 'w-7 h-7' : 'w-6 h-6 mr-4'}
                        `} 
                        fill={isActive ? "currentColor" : "none"}
                      />
                      <span 
                        className={`
                            text-[17px] font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                            ${isCollapsed ? 'w-0 opacity-0 translate-x-4' : 'w-auto opacity-100 translate-x-0'}
                        `}
                      >
                        Employees
                      </span>
                      {isCollapsed && (
                          <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#111] dark:bg-white text-white dark:text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-xl z-50">
                              Employees
                          </div>
                      )}
                    </>
                  )}
                </NavLink>
            </li>
          </ul>
        </nav>
        
        {/* Toggle Theme Section */}
        <div className="mt-4">
           <button 
             onClick={toggleTheme}
             className={`
                flex items-center h-14 rounded-full transition-all duration-300 group pin-btn
                ${isCollapsed ? 'justify-center w-full bg-transparent hover:bg-[#F2F2F2] dark:hover:bg-[#222]' : 'w-full px-2 bg-[#E9E9E9] dark:bg-[#333333] hover:bg-[#d1d1d1] dark:hover:bg-[#444]'}
             `}
           >
              <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'pl-0'}`}>
                 <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-500
                    ${theme === 'dark' ? 'bg-[#E60023]' : 'bg-[#111]'}
                    ${isCollapsed ? 'scale-100' : ''}
                 `}>
                    {theme === 'dark' ? <Moon className="w-5 h-5" strokeWidth={2.5} /> : <Sun className="w-5 h-5" strokeWidth={2.5} />}
                 </div>
                 
                 <div 
                    className={`
                        text-left overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
                        ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100 ml-3'}
                    `}
                 >
                    <p className="text-sm font-bold text-[#111] dark:text-white">
                        {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                    </p>
                 </div>
              </div>
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-white dark:bg-[#111111] transition-colors duration-300">
        
        {/* Mobile Header (Minimalist) */}
        {!isChatPage && (
            <div className="md:hidden bg-white/90 dark:bg-[#111111]/90 backdrop-blur-md text-[#111] dark:text-white px-4 py-3 flex justify-between items-center z-20 sticky top-0 border-b border-transparent">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white font-bold text-base">S</div>
            </div>
            
            <button onClick={toggleTheme} className="w-9 h-9 flex items-center justify-center bg-[#E9E9E9] dark:bg-[#333333] rounded-full pin-btn">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            </div>
        )}
        
        {/* Content Area */}
        <div className="flex-1 relative overflow-hidden flex flex-col">
            {isChatPage ? (
                // Chat Page: Direct render to support custom internal scrolling
                <div className="flex-1 h-full w-full overflow-hidden">
                    {children}
                </div>
            ) : (
                // Other Pages: Use PullToRefresh
                // INCREASED BOTTOM PADDING TO 36 (9rem) + Safe Area to prevent content hiding behind floating nav
                <PullToRefresh onRefresh={handleRefresh}>
                    <div className="pb-40 p-4 md:p-8 min-h-full pb-safe">
                        {children}
                    </div>
                </PullToRefresh>
            )}
        </div>

        {/* Mobile Floating Bottom Navigation (Pinterest Style) - Hidden on Chat Page */}
        {/* ADJUSTED: bottom position calculates 1.5rem + safe-area-inset-bottom */}
        {!isChatPage && (
            <div className="md:hidden fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-40 w-auto">
                 <div className="flex items-center justify-center bg-white dark:bg-[#222] shadow-[0_8px_30px_rgb(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)] rounded-full px-2 py-2 border border-gray-100 dark:border-[#333]">
                    {navItems.map((item) => (
                        <NavLink 
                            key={item.to} 
                            to={item.to}
                            className={({isActive}) => 
                                `flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 mx-0.5
                                ${isActive 
                                    ? 'bg-[#111] dark:bg-white text-white dark:text-[#111] shadow-md transform scale-105' 
                                    : 'text-gray-400 dark:text-gray-500 hover:bg-[#F5F5F5] dark:hover:bg-[#333]'
                                }`
                            }
                        >
                            {({isActive}) => (
                                <item.icon 
                                  className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} 
                                  fill={isActive && (item.label === 'Home' || item.label === 'Chat' || item.label === 'Pay') ? "currentColor" : "none"}
                                />
                            )}
                        </NavLink>
                    ))}
                    {/* Employees Link Mobile */}
                     <NavLink 
                        to="/employees"
                        className={({isActive}) => 
                            `flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 mx-0.5
                            ${isActive 
                                ? 'bg-[#111] dark:bg-white text-white dark:text-[#111] shadow-md transform scale-105' 
                                : 'text-gray-400 dark:text-gray-500 hover:bg-[#F5F5F5] dark:hover:bg-[#333]'
                            }`
                        }
                    >
                        {({isActive}) => (
                            <Users 
                              className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'}`} 
                              fill={isActive ? "currentColor" : "none"}
                            />
                        )}
                    </NavLink>
                 </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Layout;
