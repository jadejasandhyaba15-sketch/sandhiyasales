
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Bill, Employee, ChatMessage } from '../types';
import { generateAutoBill, generateSmartChatSequence, generateInternalEmployeeChat } from '../utils/generators';

export interface TypingInfo {
  name: string;
  isEmployee: boolean;
  channel: string;
}

// Interface to store totals of deleted bills
interface ArchivedStats {
  revenue: number;
  sandhiya: number;
  pathan: number;
}

interface AppContextType {
  bills: Bill[];
  employees: Employee[];
  messages: ChatMessage[];
  addBill: (bill: Bill) => void;
  addEmployee: (employee: Employee) => void;
  updateEmployee: (employee: Employee) => void;
  addMessage: (msg: ChatMessage) => void;
  markBillAsVerified: (billId: string) => void; 
  totalRevenue: number;
  totalSandhiyaTax: number;
  totalPathanTax: number;
  typingUsers: { [key: string]: TypingInfo | null };
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  isOnline: boolean; // New State
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Timer Configurations for Bill Generation
const TIMERS = [
  { interval: 25000, min: 10000, max: 100000 },          // Fast small orders
  { interval: 40000, min: 100000, max: 1000000 },        
  { interval: 60000, min: 1000000, max: 3000000 },       
  { interval: 90000, min: 3000000, max: 6000000 },      
  { interval: 120000, min: 6000000, max: 10000000 },     
];

// Helper to safely parse JSON from localStorage
const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error loading ${key} from storage`, error);
    return fallback;
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- PERSISTENT STATE INITIALIZATION ---
  const [bills, setBills] = useState<Bill[]>(() => loadFromStorage('sandhiya_bills', []));
  const [employees, setEmployees] = useState<Employee[]>(() => loadFromStorage('sandhiya_employees', []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadFromStorage('sandhiya_messages', []));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadFromStorage('sandhiya_theme', 'dark'));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadFromStorage('sandhiya_auth', false));
  
  // Archived Stats: Stores total amounts of deleted bills
  const [archivedStats, setArchivedStats] = useState<ArchivedStats>(() => loadFromStorage('sandhiya_archived_stats', { revenue: 0, sandhiya: 0, pathan: 0 }));

  // Network Status
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  const [typingUsers, setTypingUsers] = useState<{ [key: string]: TypingInfo | null }>({});

  // Queue State: Room ID -> Array of Bills waiting to be processed
  const [roomQueues, setRoomQueues] = useState<Record<string, Bill[]>>({});
  // Busy State: Room ID -> boolean (is currently playing a chat sequence)
  const [roomBusy, setRoomBusy] = useState<Record<string, boolean>>({});

  const employeesRef = useRef(employees);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isOnlineRef = useRef(isOnline); // Ref to access current online state inside intervals
  
  // Update refs
  useEffect(() => {
    employeesRef.current = employees;
  }, [employees]);

  useEffect(() => {
    isOnlineRef.current = isOnline;
  }, [isOnline]);

  // --- NETWORK LISTENERS ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // --- PERSISTENCE EFFECTS (SAVE ON CHANGE) ---
  useEffect(() => {
    localStorage.setItem('sandhiya_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('sandhiya_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('sandhiya_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('sandhiya_auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('sandhiya_archived_stats', JSON.stringify(archivedStats));
  }, [archivedStats]);

  useEffect(() => {
    localStorage.setItem('sandhiya_theme', JSON.stringify(theme));
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const login = useCallback((password: string) => {
    if (password === 'Sandhiya') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  // Revenue sums up ALL verified bills (Active + Archived)
  const verifiedBills = bills.filter(bill => bill.status === 'Verified');
  const totalRevenue = archivedStats.revenue + verifiedBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const totalSandhiyaTax = archivedStats.sandhiya + verifiedBills.reduce((sum, bill) => sum + (bill.sandhiyaTax || 0), 0);
  const totalPathanTax = archivedStats.pathan + verifiedBills.reduce((sum, bill) => sum + (bill.pathanTax || 0), 0);

  const addBill = useCallback((bill: Bill) => {
    setBills(prev => [bill, ...prev]);
    // Also add to queue logic to trigger chat automation for manual bills
    // Only queue if it's in 'Verifying' state
    if (bill.status === 'Verifying') {
        setRoomQueues(prev => ({
            ...prev,
            [bill.assignedRoom]: [...(prev[bill.assignedRoom] || []), bill]
        }));
    }
  }, []);

  const addEmployee = useCallback((employee: Employee) => {
    setEmployees(prev => [...prev, employee]);
  }, []);

  const updateEmployee = useCallback((updatedEmployee: Employee) => {
    setEmployees(prev => prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
  }, []);

  const addMessage = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // Mark verified and set timestamp
  const markBillAsVerified = useCallback((billId: string) => {
      setBills(prev => prev.map(bill => 
          bill.id === billId ? { ...bill, status: 'Verified', verifiedTimestamp: Date.now() } : bill
      ));
  }, []);

  const setTypingForChannel = useCallback((channel: string, info: TypingInfo | null) => {
      setTypingUsers(prev => ({ ...prev, [channel]: info }));
  }, []);

  const clearMessagesForChannel = useCallback((channel: string) => {
      setMessages(prev => prev.filter(msg => msg.channel !== channel));
  }, []);

  // --- AUTO DELETE LOGIC ---
  // Checks every 30 seconds for bills verified > 40 minutes ago
  useEffect(() => {
      const interval = setInterval(() => {
          const now = Date.now();
          const TIME_LIMIT = 40 * 60 * 1000; // 40 minutes

          setBills(currentBills => {
              // Find bills that are verified and older than 40 mins
              const billsToRemove = currentBills.filter(b => 
                  b.status === 'Verified' && 
                  b.verifiedTimestamp && 
                  (now - b.verifiedTimestamp >= TIME_LIMIT)
              );

              if (billsToRemove.length > 0) {
                  // Calculate totals of deleting bills
                  const statsToAdd = billsToRemove.reduce((acc, b) => ({
                      revenue: acc.revenue + b.totalAmount,
                      sandhiya: acc.sandhiya + b.sandhiyaTax,
                      pathan: acc.pathan + b.pathanTax
                  }), { revenue: 0, sandhiya: 0, pathan: 0 });

                  // Update archived stats (side-effect in setter is safe here for this scale)
                  setArchivedStats(prev => ({
                      revenue: prev.revenue + statsToAdd.revenue,
                      sandhiya: prev.sandhiya + statsToAdd.sandhiya,
                      pathan: prev.pathan + statsToAdd.pathan
                  }));

                  // Remove bills from main list
                  return currentBills.filter(b => !billsToRemove.includes(b));
              }
              return currentBills;
          });
      }, 30000);

      return () => clearInterval(interval);
  }, []);


  // --- 1. Bill Generation (Producer) ---
  useEffect(() => {
    let isMounted = true;
    const intervalIds: ReturnType<typeof setInterval>[] = [];

    const generateAndQueueBill = (config: typeof TIMERS[0]) => {
         // Strict Check: Must be Online to generate bills
         if (!isMounted || !isOnlineRef.current || employeesRef.current.length === 0) return;

         // Generate Bill
         const newBill = generateAutoBill(config.min, config.max);
         
         // Assign Room logic
         let assignedEmp: Employee;
         if (newBill.receiverName === "Self (Cash)") {
             newBill.assignedRoom = "340";
             assignedEmp = employeesRef.current[0]; 
         } else {
             assignedEmp = employeesRef.current[Math.floor(Math.random() * employeesRef.current.length)];
             newBill.assignedRoom = assignedEmp.roomNumber || "101";
         }
         
         // Add to Global Bills List (For Revenue)
         setBills(prev => [newBill, ...prev]);

         // Add to Queue for that Room
         setRoomQueues(prev => ({
             ...prev,
             [newBill.assignedRoom]: [...(prev[newBill.assignedRoom] || []), newBill]
         }));
    };

    TIMERS.forEach(config => {
        const initialDelay = Math.random() * 5000;
        const t = setTimeout(() => {
             generateAndQueueBill(config); 
             const interval = setInterval(() => generateAndQueueBill(config), config.interval);
             intervalIds.push(interval);
        }, initialDelay);
        timeoutsRef.current.push(t);
    });

    return () => {
      isMounted = false;
      intervalIds.forEach(clearInterval);
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // --- 2. Queue Processor (Consumer) ---
  // Watches roomQueues and roomBusy states to process bills sequentially per room
  useEffect(() => {
    const processQueues = () => {
        // Strict Check: Must be Online to process chats
        if (!isOnlineRef.current) return;

        // Iterate over all rooms pending in queues
        Object.keys(roomQueues).forEach(roomId => {
            // If room is busy, skip
            if (roomBusy[roomId]) return;

            // If queue empty, skip
            const queue = roomQueues[roomId];
            if (!queue || queue.length === 0) return;

            // -- START PROCESSING --
            
            // 1. Mark Room Busy & Pop Bill
            setRoomBusy(prev => ({ ...prev, [roomId]: true }));
            const billToProcess = queue[0];
            
            // Remove from queue immediately so we don't process it again
            setRoomQueues(prev => ({
                ...prev,
                [roomId]: prev[roomId].slice(1)
            }));

            // 2. Generate Chat Sequence
            const assignedEmp = employeesRef.current.find(e => e.roomNumber === roomId) || employeesRef.current[0];
            const financeEmp = employeesRef.current.find(e => e.roomNumber === '210');
            
            if (!assignedEmp) {
                 // Safety release if no emp found
                 setRoomBusy(prev => ({ ...prev, [roomId]: false }));
                 return;
            }

            const chatSequence = generateSmartChatSequence(
                 billToProcess, 
                 assignedEmp.id, 
                 assignedEmp.name, 
                 roomId,
                 financeEmp?.name || "Head Finance"
            );

            // 3. Play Chat Sequence
            let maxDelay = 0;
            
            chatSequence.forEach(msg => {
                const delay = msg.timestamp;
                if (delay > maxDelay) maxDelay = delay;

                // Typing Indicator
                const typingStart = Math.max(0, delay - 2000);
                const t1 = setTimeout(() => {
                     // Check online status before showing typing
                     if(!isOnlineRef.current) return;
                     setTypingForChannel(roomId, { 
                        name: msg.senderName, 
                        isEmployee: msg.isEmployee, 
                        channel: roomId 
                    });
                }, typingStart);
                timeoutsRef.current.push(t1);

                // Add Message
                const t2 = setTimeout(() => {
                    // Check online status before adding message
                    if(!isOnlineRef.current) return;

                    setTypingForChannel(roomId, null);
                    addMessage({ ...msg, timestamp: Date.now() });

                    // Verification Hook
                    if (msg.messageType === 'finance_approval' && msg.metadata?.billId) {
                        markBillAsVerified(msg.metadata.billId);
                    }
                }, delay);
                timeoutsRef.current.push(t2);
            });

            // 4. End Sequence: Delete Chat -> Round Anim -> Next Order Text -> Free Room
            const cleanupDelay = maxDelay + 4000; // Wait 4s after last message (Transaction Closed)

            const tCleanup = setTimeout(() => {
                if(!isOnlineRef.current) {
                    setRoomBusy(prev => ({ ...prev, [roomId]: false }));
                    return;
                }

                // A. Delete Chat Messages
                clearMessagesForChannel(roomId);

                // B. Add "Round" Loader Animation
                const loaderId = `loader-${Date.now()}`;
                addMessage({
                    id: loaderId,
                    channel: roomId,
                    senderId: 'system',
                    senderName: 'System',
                    text: 'Processing...',
                    timestamp: Date.now(),
                    isEmployee: false,
                    messageType: 'round_loader'
                });

                // C. After 3s, Remove Loader & Show "Next Order Hire"
                const tNextOrder = setTimeout(() => {
                    if(!isOnlineRef.current) return;
                    // Clear loader (by clearing channel again is safest/easiest)
                    clearMessagesForChannel(roomId);

                    const nextOrderId = `next-${Date.now()}`;
                    addMessage({
                        id: nextOrderId,
                        channel: roomId,
                        senderId: 'system',
                        senderName: 'System',
                        text: 'Next Order Hire',
                        timestamp: Date.now(),
                        isEmployee: false,
                        messageType: 'next_order_hire'
                    });

                    // D. After 3s, Clear "Next Order" & Free Room
                    const tFreeRoom = setTimeout(() => {
                        clearMessagesForChannel(roomId);
                        setRoomBusy(prev => ({ ...prev, [roomId]: false }));
                    }, 3000);
                    timeoutsRef.current.push(tFreeRoom);

                }, 3000);
                timeoutsRef.current.push(tNextOrder);

            }, cleanupDelay);
            timeoutsRef.current.push(tCleanup);
        });
    };

    // Run processor every 1s (polling queues)
    const interval = setInterval(processQueues, 1000);
    return () => clearInterval(interval);

  }, [roomQueues, roomBusy, employees]); // Dependencies

  return (
    <AppContext.Provider value={{ bills, employees, messages, addBill, addEmployee, updateEmployee, addMessage, markBillAsVerified, totalRevenue, totalSandhiyaTax, totalPathanTax, typingUsers, theme, toggleTheme, isAuthenticated, login, isOnline }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
