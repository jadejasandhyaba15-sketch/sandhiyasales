
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Send, Search, Users, Shield, User, Briefcase, ShoppingBag, Loader2, CheckCircle, FileText, ArrowRight, Building, Landmark, Check, ArrowDown, Clock, Receipt as ReceiptIcon, Heart, ArrowLeft, Phone, Video, RefreshCw, Smartphone } from 'lucide-react';
import { formatCurrency } from '../utils/generators';

// --- CUSTOM RENDERERS ---

// Reusing the Official Blue Verified Badge from Employees page
const VerifiedBadge = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-3 h-3 ml-1 flex-shrink-0 text-[#0095F6] inline-block align-middle" 
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    <path d="M7 12.5L10 15.5L17 8.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CSLCard = ({ msg, isRight }: { msg: any, isRight: boolean }) => (
    <div className={`mt-2 rounded-[24px] border border-transparent shadow-sm p-4 w-60 cursor-pointer transition-colors pin-btn ${isRight ? 'bg-white/10 text-white' : 'bg-white dark:bg-[#222] text-[#111] dark:text-white'}`}>
        <div className="flex items-center justify-between mb-2">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isRight ? 'bg-white/20 text-white' : 'bg-[#FFF0F0] dark:bg-[#330000] text-[#E60023]'}`}>Csl invoice</span>
            <FileText className={`w-3.5 h-3.5 ${isRight ? 'text-white/70' : 'text-gray-500'}`} />
        </div>
        <div className="text-lg font-semibold">#{msg.metadata?.billId}</div>
        <p className={`text-[10px] mt-1 ${isRight ? 'text-white/70' : 'text-gray-500'}`}>Tap to view full details</p>
    </div>
);

const ReceiptCard = ({ bill }: { bill: any }) => {
    if (!bill) return (
        <div className="mt-2 w-48 h-20 bg-[#F9F9F9] dark:bg-[#282828] rounded-[24px] flex items-center justify-center border border-transparent dark:border-[#333] text-gray-500 text-xs font-medium">
            No bill data
        </div>
    );

    return (
        <div className="mt-2 w-72 bg-white dark:bg-[#282828] rounded-[24px] shadow-sm border border-[#E9E9E9] dark:border-[#333] overflow-hidden relative animate-pop text-left">
             <div className="h-1.5 bg-[#E60023]"></div>
             
             <div className="p-4">
                 <div className="flex justify-between items-start mb-3 border-b border-[#F0F0F0] dark:border-[#333] pb-2">
                     <div>
                         <div className="flex items-center gap-1 text-[#E60023] font-semibold text-[10px] tracking-wide mb-0.5">
                            <ReceiptIcon className="w-3 h-3" /> Invoice
                         </div>
                         <div className="text-xs text-gray-500 font-medium">#{bill.id}</div>
                     </div>
                     <div className="text-right">
                         <div className="text-[10px] text-gray-500">Date</div>
                         <div className="text-xs font-medium text-[#111] dark:text-gray-300">{new Date(bill.timestamp).toLocaleDateString()}</div>
                     </div>
                 </div>

                 <div className="flex justify-between mb-3 text-[10px] text-gray-500 dark:text-gray-400">
                     <div>
                         <span className="block font-semibold text-[#111] dark:text-gray-300">From</span>
                         <span className="truncate w-24 block font-medium">{bill.senderName}</span>
                     </div>
                     <div className="text-right">
                         <span className="block font-semibold text-[#111] dark:text-gray-300">To</span>
                         <span className="truncate w-24 block font-medium">{bill.receiverName}</span>
                     </div>
                 </div>

                 <div className="bg-[#F9F9F9] dark:bg-[#1a1a1a] rounded-[12px] p-2.5 mb-3 border border-transparent dark:border-[#333]">
                     {bill.items.map((item: any, idx: number) => (
                         <div key={idx} className="flex justify-between text-xs mb-1 last:mb-0">
                             <span className="text-[#111] dark:text-gray-300 font-medium truncate w-36">{item.name}</span>
                             <span className="font-medium text-gray-600 dark:text-gray-500">{formatCurrency(item.price)}</span>
                         </div>
                     ))}
                 </div>

                 <div className="border-t border-dashed border-gray-300 dark:border-[#444] pt-2 mt-1">
                     <div className="flex justify-between items-center">
                         <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">Total</span>
                         <span className="text-lg font-semibold text-[#111] dark:text-white tracking-tight">{formatCurrency(bill.totalAmount)}</span>
                     </div>
                 </div>
             </div>
        </div>
    );
};


const GujaratiSignature = ({ name }: { name: string }) => {
    const displayName = name.split(' ')[0];
    return (
        <div className="mt-2 p-3 bg-white dark:bg-[#282828] border-2 border-dashed border-gray-300 dark:border-[#444] rounded-[20px] w-40 transform rotate-[-2deg] hover:rotate-0 transition-transform">
             <div className="text-2xl text-[#111] dark:text-gray-200 text-center" style={{ fontFamily: '"Noto Sans Gujarati", serif' }}>
                {displayName}
             </div>
             <p className="text-[8px] text-center mt-1 text-gray-400 dark:text-gray-500 font-semibold">Verified signature</p>
        </div>
    );
};

const SignatureVerifyAnim = () => {
    const [done, setDone] = useState(false);
    useEffect(() => { const t = setTimeout(() => setDone(true), 4000); return () => clearTimeout(t); }, []);
    
    if (!done) {
        return (
            <div className="mt-2 flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-full border border-transparent dark:border-yellow-800 w-fit">
                <Loader2 className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-500 animate-spin" />
                <span className="text-[10px] font-semibold text-yellow-700 dark:text-yellow-500">Verifying...</span>
            </div>
        );
    }
    return (
        <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full border border-transparent dark:border-green-800 w-fit animate-in zoom-in">
            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
            <span className="text-[10px] font-semibold text-green-700 dark:text-green-500">Matched</span>
        </div>
    );
};

const BillBreakdown = ({ data }: { data: any }) => (
    <div className="mt-2 w-64 bg-white dark:bg-[#191919] border border-transparent dark:border-[#333] rounded-[24px] overflow-hidden shadow-sm text-xs font-medium animate-pop text-left">
        <div className="bg-[#E9E9E9] dark:bg-[#111] p-2.5 font-semibold text-[#111] dark:text-gray-300 text-center text-[10px]">Bill summary</div>
        <div className="p-3 space-y-1.5">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Base amount</span>
                <span>{formatCurrency(data.total)}</span>
            </div>
            <div className="flex justify-between text-[#E60023] font-medium">
                <span>Sandhiya tax</span>
                <span>+{formatCurrency(data.sandhiyaTax)}</span>
            </div>
            <div className="flex justify-between text-purple-600 dark:text-purple-400 font-medium">
                <span>Pathan tax</span>
                <span>+{formatCurrency(data.pathanTax)}</span>
            </div>
             <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                <span>Bank charge</span>
                <span>+{formatCurrency(data.bankCharge)}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-[#333] pt-2 flex justify-between text-sm font-semibold text-[#111] dark:text-white">
                <span>Total</span>
                <span>{formatCurrency(data.finalTotal)}</span>
            </div>
        </div>
    </div>
);

// New OTP Request Animation (Employee side) - UPDATED with logic to stop animating when done
const OTPRequestAnim = ({ isLast }: { isLast: boolean }) => {
    // If it is the last message, we show the active pulsing animation
    // If it is NOT the last message (customer has replied), we show a static "Sent" state
    if (isLast) {
        return (
            <div className="mt-2 flex items-center gap-2 bg-[#F9F9F9] dark:bg-[#282828] px-4 py-3 rounded-[20px] w-fit animate-pulse border border-transparent dark:border-[#333]">
                <Smartphone className="w-4 h-4 text-[#E60023]" />
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">Requesting OTP from customer...</span>
            </div>
        );
    }
    
    return (
        <div className="mt-2 flex items-center gap-2 bg-[#F9F9F9] dark:bg-[#282828] px-4 py-3 rounded-[20px] w-fit border border-transparent dark:border-[#333] opacity-70">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">OTP Request Sent</span>
        </div>
    );
};

const OTPVerifyAnim = () => {
    const [done, setDone] = useState(false);
    useEffect(() => { const t = setTimeout(() => setDone(true), 2500); return () => clearTimeout(t); }, []);
    
    if(!done) {
        return (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-full w-fit">
                <Loader2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500 animate-spin" />
                <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400">Checking OTP...</span>
            </div>
        );
    }
    return (
        <div className="mt-2 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-full w-fit animate-in zoom-in">
             <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />
             <span className="text-[10px] font-semibold text-green-700 dark:text-green-500">Verified</span>
        </div>
    );
};

// Updated: Finance Workflow Animation (Pending -> Success)
const FinanceWorkflowAnim = () => {
    const [status, setStatus] = useState<'pending' | 'success'>('pending');

    useEffect(() => {
        // Automatically switch to success after 7 seconds (matching the generator logic)
        const t = setTimeout(() => {
            setStatus('success');
        }, 7000);
        return () => clearTimeout(t);
    }, []);

    if (status === 'pending') {
        return (
            <div className="my-4 mx-auto w-full max-w-sm bg-[#111] dark:bg-black rounded-[24px] p-6 shadow-2xl relative overflow-hidden animate-pop">
                 <div className="absolute top-0 right-0 p-16 bg-purple-600 dark:bg-purple-900 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
                 
                 <div className="flex flex-col items-center text-center relative z-10">
                     <div className="w-12 h-12 bg-[#222] dark:bg-gray-900 rounded-full flex items-center justify-center mb-3 relative">
                         <Landmark className="w-6 h-6 text-purple-400" />
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#111] animate-pulse"></div>
                     </div>
                     
                     <h3 className="text-white font-semibold text-lg mb-0.5">Approval pending</h3>
                     <p className="text-gray-400 dark:text-gray-500 text-xs mb-4 font-medium">Forwarded to Finance (Room 210)</p>
                     
                     <div className="w-full bg-[#222] dark:bg-gray-900 h-1.5 rounded-full overflow-hidden mb-2">
                         <div className="h-full bg-purple-500 dark:bg-purple-600 w-2/3 animate-[shimmer_2s_infinite]"></div>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="my-4 mx-auto w-full max-w-sm bg-green-50 dark:bg-green-900/10 rounded-[24px] p-6 shadow-sm relative overflow-hidden animate-in zoom-in duration-500 border border-green-200 dark:border-green-900/30">
             <div className="flex flex-col items-center text-center relative z-10">
                 <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mb-3">
                     <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-500" />
                 </div>
                 
                 <h3 className="text-green-900 dark:text-green-100 font-bold text-lg mb-0.5">Approved</h3>
                 <p className="text-green-700 dark:text-green-300 text-xs font-medium">Verified by Room 210</p>
             </div>
        </div>
    );
};

// New Approving Process Animation (Room 210)
const ApprovingProcessAnim = () => {
    const [done, setDone] = useState(false);
    useEffect(() => { const t = setTimeout(() => setDone(true), 2500); return () => clearTimeout(t); }, []);

    if (!done) {
        return (
            <div className="mt-2 flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 px-4 py-3 rounded-[20px] w-fit border border-transparent dark:border-purple-800">
                <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">Approving invoice details...</span>
            </div>
        );
    }

    return (
        <div className="mt-2 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 px-4 py-3 rounded-[20px] w-fit border border-transparent dark:border-green-800 animate-in zoom-in">
            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-500" />
            <span className="text-xs font-semibold text-green-700 dark:text-green-300">Invoice Approved</span>
        </div>
    );
};

const BankSuccess = () => (
    <div className="mt-2 flex items-center gap-3 bg-green-50 dark:bg-green-900/30 p-3 rounded-[20px] w-fit animate-[bounceIn_0.5s]">
        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
             <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
        <div>
             <div className="text-xs font-semibold text-green-800 dark:text-green-400">Payment verified</div>
             <div className="text-[9px] text-green-600 dark:text-green-600 font-medium">Transaction complete</div>
        </div>
    </div>
);

// --- NEW ANIMATIONS ---

const RoundLoaderAnim = () => (
    <div className="flex flex-col items-center justify-center py-10 w-full animate-in fade-in zoom-in duration-300">
        <div className="relative w-16 h-16">
             <div className="absolute inset-0 border-4 border-gray-200 dark:border-[#333] rounded-full"></div>
             <div className="absolute inset-0 border-4 border-[#E60023] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">Closing transaction...</p>
    </div>
);

const NextOrderAnim = () => (
    <div className="flex flex-col items-center justify-center py-20 w-full animate-in slide-in-from-bottom-10 fade-in duration-500">
        <div className="bg-[#111] dark:bg-white text-white dark:text-[#111] px-8 py-4 rounded-full shadow-2xl transform transition-transform hover:scale-105">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                Next Order Hire
                <ArrowRight className="w-6 h-6 animate-pulse" />
            </h2>
        </div>
        <p className="mt-3 text-xs text-gray-400 font-medium">Preparing queue...</p>
    </div>
);

// --- MAIN CHATS COMPONENT ---

const Chats: React.FC = () => {
  const { messages, employees, typingUsers } = useApp();
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Group messages by channel
  const groupedMessages = useMemo(() => {
     const groups: { [key: string]: typeof messages } = {};
     messages.forEach(msg => {
         if (!groups[msg.channel]) groups[msg.channel] = [];
         groups[msg.channel].push(msg);
     });
     return groups;
  }, [messages]);

  // Get list of channels (Rooms)
  const channels = useMemo(() => {
      const list = Object.keys(groupedMessages).sort();
      // Ensure '210' (Finance) is at top if exists
      return list.sort((a, b) => {
          if (a === '210') return -1;
          if (b === '210') return 1;
          return a.localeCompare(b);
      });
  }, [groupedMessages]);

  useEffect(() => {
      // Auto-select first channel on desktop if none selected
      if (!activeChannel && channels.length > 0 && window.innerWidth >= 768) {
          setActiveChannel(channels[0]);
      }
  }, [channels, activeChannel]);

  useEffect(() => {
      if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
  }, [messages, activeChannel]);

  const handleChannelSelect = (channel: string) => {
      setActiveChannel(channel);
      setMobileView('chat');
  };

  const currentMessages = activeChannel ? groupedMessages[activeChannel] || [] : [];
  const currentTyping = activeChannel ? typingUsers[activeChannel] : null;

  // Helper to get room name
  const getRoomName = (ch: string) => {
      if (ch === '210') return 'Finance Department';
      if (ch === '340') return 'Counter Sales';
      if (ch === '450') return 'VIP Lounge';
      return `Room ${ch}`;
  };

  // Helper to get active employee for a room
  const getEmployeeForRoom = (roomId: string) => {
      return employees.find(e => e.roomNumber === roomId);
  };

  // Helper to get last message for preview
  const getLastMessage = (ch: string) => {
      const msgs = groupedMessages[ch];
      if (!msgs || msgs.length === 0) return 'No messages';
      const last = msgs[msgs.length - 1];
      
      if (last.messageType === 'round_loader') return 'Processing...';
      if (last.messageType === 'next_order_hire') return 'Next order...';
      if (last.messageType === 'csl_intro') return 'Starting new invoice...';
      if (last.messageType === 'receipt_anim') return 'Receipt Generated';
      return last.text;
  };

  // Get current active employee if a channel is selected
  const activeEmployee = activeChannel ? getEmployeeForRoom(activeChannel) : null;

  return (
    <div className="h-full flex bg-white dark:bg-[#111111] overflow-hidden rounded-[32px] md:rounded-none">
        
        {/* --- LEFT SIDEBAR (Channel List) --- */}
        <div className={`
            flex-col w-full md:w-80 lg:w-96 border-r border-transparent dark:border-[#333] bg-[#F9F9F9] dark:bg-[#111]
            ${mobileView === 'list' ? 'flex' : 'hidden md:flex'}
        `}>
            <div className="p-6 pb-2">
                <h2 className="text-2xl font-bold text-[#111] dark:text-white mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search rooms..." 
                        className="w-full bg-white dark:bg-[#222] h-10 pl-10 pr-4 rounded-full text-sm font-medium outline-none border-none focus:ring-1 focus:ring-[#E60023]"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                {channels.map(ch => {
                    const roomEmp = getEmployeeForRoom(ch);
                    
                    return (
                        <button
                            key={ch}
                            onClick={() => handleChannelSelect(ch)}
                            className={`w-full flex items-center p-3 rounded-[20px] transition-all duration-200 group
                                ${activeChannel === ch 
                                    ? 'bg-white dark:bg-[#222] shadow-sm scale-[1.02]' 
                                    : 'hover:bg-white/50 dark:hover:bg-[#222]/50'
                                }
                            `}
                        >
                            {/* Room Avatar: Show Employee Image if assigned, else fallback icons */}
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mr-3 text-white font-bold text-lg shadow-sm overflow-hidden
                                ${ch === '210' ? 'bg-[#7B61FF]' : 'bg-[#E60023]'}
                            `}>
                                {roomEmp?.imageUrl ? (
                                    <img src={roomEmp.imageUrl} alt={roomEmp.name} className="w-full h-full object-cover" />
                                ) : (
                                    ch === '210' ? <Shield className="w-5 h-5" /> : ch.slice(0,2)
                                )}
                            </div>

                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h3 className={`text-sm font-bold truncate ${activeChannel === ch ? 'text-[#111] dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                        {getRoomName(ch)}
                                    </h3>
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {groupedMessages[ch]?.length > 0 
                                          ? new Date(groupedMessages[ch][groupedMessages[ch].length-1].timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                                          : ''}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-medium">
                                    {typingUsers[ch] ? (
                                        <span className="text-[#E60023] animate-pulse">Typing...</span>
                                    ) : getLastMessage(ch)}
                                </p>
                            </div>
                        </button>
                    );
                })}
                {channels.length === 0 && (
                    <div className="text-center mt-10 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No active chats</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- RIGHT MAIN CHAT --- */}
        <div className={`
            flex-1 flex flex-col bg-white dark:bg-[#111111] relative overflow-hidden
            ${mobileView === 'chat' ? 'flex' : 'hidden md:flex'}
        `}>
            {activeChannel ? (
                <>
                    {/* Header: Fixed Height, Flex-none (No Sticky) */}
                    <div className="h-16 flex-none border-b border-[#F0F0F0] dark:border-[#333] flex items-center px-4 md:px-6 justify-between bg-white dark:bg-[#111111] z-10">
                        <div className="flex items-center">
                            <button 
                                onClick={() => setMobileView('list')}
                                className="md:hidden mr-3 p-2 -ml-2 text-gray-600 dark:text-gray-400"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="relative">
                                {/* Header Avatar: Show Active Room Employee Image */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden
                                    ${activeChannel === '210' ? 'bg-[#7B61FF]' : 'bg-[#E60023]'}
                                `}>
                                    {activeEmployee?.imageUrl ? (
                                        <img src={activeEmployee.imageUrl} alt={activeEmployee.name} className="w-full h-full object-cover" />
                                    ) : (
                                        activeChannel === '210' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />
                                    )}
                                </div>
                                {activeChannel !== '210' && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-[#111] rounded-full"></div>
                                )}
                            </div>
                            <div className="ml-3">
                                <h3 className="font-bold text-[#111] dark:text-white text-base">
                                    {getRoomName(activeChannel)}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center">
                                    {activeChannel === '210' ? 'Secure channel' : 'Live interaction'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 transition-colors">
                                 <Phone className="w-5 h-5" />
                             </button>
                             <button className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] text-gray-400 transition-colors">
                                 <Video className="w-5 h-5" />
                             </button>
                        </div>
                    </div>

                    {/* Messages Area: Flex-1 to fill space, Overflow-y-auto to scroll */}
                    <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-6 custom-scrollbar bg-white dark:bg-[#111111]" ref={scrollRef}>
                        {currentMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <RefreshCw className="w-8 h-8 animate-spin mb-2 opacity-50" />
                                <p className="text-xs">Connecting...</p>
                            </div>
                        )}

                        {currentMessages.map((msg, index) => {
                            // Render Full Screen Animations separately
                            if (msg.messageType === 'round_loader') {
                                return <RoundLoaderAnim key={msg.id} />;
                            }
                            if (msg.messageType === 'next_order_hire') {
                                return <NextOrderAnim key={msg.id} />;
                            }

                            const isRight = !msg.isEmployee && msg.senderId !== 'system';
                            const isLast = index === currentMessages.length - 1;
                            
                            // Find employee object if it is an employee message
                            const employee = employees.find(e => e.id === msg.senderId || e.name === msg.senderName);

                            return (
                                <div key={msg.id} className={`flex ${isRight ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    
                                    {/* EMPLOYEE AVATAR (LEFT) */}
                                    {!isRight && (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] flex-shrink-0 mr-2 flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300 self-end mb-1 overflow-hidden">
                                            {employee && employee.imageUrl ? (
                                                <img src={employee.imageUrl} alt={employee.name} className="w-full h-full object-cover" />
                                            ) : (
                                                msg.senderName.charAt(0)
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className={`max-w-[85%] md:max-w-[65%] flex flex-col ${isRight ? 'items-end' : 'items-start'}`}>
                                        
                                        {/* NAME LABEL (BOTH SIDES NOW) */}
                                        <div className={`flex items-center mb-1 ${isRight ? 'mr-3 justify-end' : 'ml-3'}`}>
                                            <p className="text-[10px] text-gray-400 font-semibold">{msg.senderName}</p>
                                            {/* Only show badge for employees */}
                                            {!isRight && msg.isEmployee && <VerifiedBadge />}
                                        </div>

                                        {/* BUBBLE */}
                                        <div className={`px-5 py-3 text-sm font-medium shadow-sm relative group text-left
                                            ${isRight 
                                                ? 'bg-[#E60023] text-white rounded-[20px] rounded-br-[4px]' 
                                                : 'bg-[#F0F0F0] dark:bg-[#222] text-[#111] dark:text-white rounded-[20px] rounded-bl-[4px]'
                                            }
                                        `}>
                                            {msg.text}

                                            {/* Rich Content Renderers */}
                                            {msg.messageType === 'csl_intro' && <CSLCard msg={msg} isRight={isRight} />}
                                            {msg.messageType === 'receipt_anim' && <ReceiptCard bill={msg.metadata?.bill} />}
                                            {msg.messageType === 'signature_req' && <div className="mt-2 text-xs italic opacity-70">Waiting for signature...</div>}
                                            {msg.messageType === 'signature_submission' && <GujaratiSignature name={msg.senderName} />}
                                            {msg.messageType === 'signature_verify_anim' && <SignatureVerifyAnim />}
                                            {msg.messageType === 'bill_breakdown' && <BillBreakdown data={msg.metadata?.breakdown} />}
                                            
                                            {/* UPDATED ANIMATIONS */}
                                            {msg.messageType === 'otp_req' && <OTPRequestAnim isLast={isLast} />}
                                            {msg.messageType === 'otp_verify_anim' && <OTPVerifyAnim />}
                                            {msg.messageType === 'bank_verification_waiting' && <FinanceWorkflowAnim />}
                                            {msg.messageType === 'approving_anim' && <ApprovingProcessAnim />}
                                            
                                            {msg.messageType === 'bank_verification_success' && <BankSuccess />}
                                            {msg.messageType === 'finance_approval' && (
                                                <div className="mt-2 bg-[#7B61FF]/10 border border-[#7B61FF]/30 p-3 rounded-[16px] flex items-center gap-3">
                                                    <Shield className="w-5 h-5 text-[#7B61FF]" />
                                                    <div>
                                                        <div className="text-xs font-bold text-[#7B61FF]">Officially approved</div>
                                                        <div className="text-[10px] text-gray-500 dark:text-gray-400">Payment id: {msg.metadata?.billId}</div>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                        
                                        {/* TIME */}
                                        <p className={`text-[9px] text-gray-300 dark:text-gray-600 mt-1 ${isRight ? 'text-right mr-1' : 'ml-1'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </p>
                                    </div>

                                    {/* CUSTOMER AVATAR (RIGHT) - NEW */}
                                    {isRight && (
                                         <div className="w-8 h-8 rounded-full bg-[#FFE5E5] dark:bg-[#330000] border border-[#ffcccc] dark:border-[#550000] flex-shrink-0 ml-2 flex items-center justify-center text-xs font-bold text-[#E60023] self-end mb-1 overflow-hidden">
                                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {currentTyping && (
                            <div className="flex justify-start animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-[#333] mr-2 flex items-center justify-center text-xs self-end mb-1">
                                    ...
                                </div>
                                <div className="bg-[#F0F0F0] dark:bg-[#222] rounded-[20px] rounded-bl-[4px] px-4 py-3 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area: Added safe-area padding at bottom */}
                    <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex-none bg-white dark:bg-[#111] border-t border-[#F0F0F0] dark:border-[#333]">
                        <div className="flex items-center gap-3 max-w-4xl mx-auto">
                            <button className="p-2 bg-[#F0F0F0] dark:bg-[#222] rounded-full text-gray-500 hover:text-[#E60023] transition-colors">
                                <FileText className="w-5 h-5" />
                            </button>
                            <div className="flex-1 relative">
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    disabled
                                    className="w-full bg-[#F9F9F9] dark:bg-[#222] h-12 rounded-full pl-5 pr-12 outline-none text-sm font-medium text-gray-500 cursor-not-allowed"
                                />
                                <button className="absolute right-2 top-2 w-8 h-8 bg-[#E60023] rounded-full flex items-center justify-center text-white shadow-sm opacity-50 cursor-not-allowed">
                                    <Send className="w-4 h-4 ml-0.5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-gray-400 mt-2 font-medium">
                            Only automated system messages are active in demo mode.
                        </p>
                    </div>

                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#F9F9F9] dark:bg-[#111]">
                    <div className="w-24 h-24 bg-[#E9E9E9] dark:bg-[#222] rounded-full flex items-center justify-center mb-6 animate-pop">
                        <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#111] dark:text-white mb-2">Select a conversation</h2>
                    <p className="text-gray-500 max-w-xs">Choose a room from the left to monitor live sales verifications.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default Chats;
