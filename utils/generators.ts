
import { Bill, Product, CommunityType, ChatMessage, Employee } from '../types';
import { 
  SANDHIYA_TAX_AMOUNT, 
  PATHAN_TAX_AMOUNT,
  LEUVA_SURNAMES,
  KADVA_SURNAMES,
  MODERN_GIRL_NAMES,
  TRADITIONAL_WOMEN_NAMES,
  SWAMINARAYAN_WOMEN_NAMES,
  DARBAR_WOMEN_NAMES,
  PRODUCT_NAMES, 
  SURAT_AREAS,
  SURAT_SOCIETIES,
  SURAT_LANDMARKS,
  MUSLIM_NAMES,
  MUSLIM_SURNAMES
} from '../constants';

export const getRandomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const generateSuratAddress = () => {
  const buildingNo = getRandomInt(1, 500);
  const buildingBlock = String.fromCharCode(65 + getRandomInt(0, 5)); // A, B, C, D, E
  const society = SURAT_SOCIETIES[getRandomInt(0, SURAT_SOCIETIES.length - 1)];
  const landmark = SURAT_LANDMARKS[getRandomInt(0, SURAT_LANDMARKS.length - 1)];
  const area = SURAT_AREAS[getRandomInt(0, SURAT_AREAS.length - 1)];
  return `${buildingBlock}-${buildingNo}, ${society}, ${landmark}, ${area}, Surat`;
};

export const generateRandomName = () => {
  const randGroup = Math.random();

  // 20% Chance for Darbar/Jadeja Mix (Jadeja + DarbarWoman + MuslimMan)
  if (randGroup < 0.20) {
      const surname = "Jadeja";
      const womanName = DARBAR_WOMEN_NAMES[getRandomInt(0, DARBAR_WOMEN_NAMES.length - 1)];
      const muslimName = MUSLIM_NAMES[getRandomInt(0, MUSLIM_NAMES.length - 1)];
      // Ensure 'bhai' suffix for the man's name if not present (stylistic choice for names)
      const manNameFormatted = muslimName.toLowerCase().endsWith('bhai') ? muslimName : `${muslimName}bhai`;
      
      // Format: Jadeja Sandhiyaba Abdulbhai
      return { 
          fullName: `${surname} ${womanName} ${manNameFormatted}`, 
          community: CommunityType.DARBAR 
      };
  }

  // Remaining 80% split between Leuva and Kadva Patel
  const isLeuva = Math.random() > 0.5;
  const community = isLeuva ? CommunityType.LEUVA : CommunityType.KADVA;
  
  // 2. Pick Surname based on Community
  const surnameList = isLeuva ? LEUVA_SURNAMES : KADVA_SURNAMES;
  const surname = surnameList[getRandomInt(0, surnameList.length - 1)];
  
  // 3. Determine Name Type (Modern, Traditional, or Swaminarayan)
  const rand = Math.random();
  let firstName = "";
  
  if (rand < 0.25) {
     // 25% Chance: Swaminarayan Religious Name
     const baseName = SWAMINARAYAN_WOMEN_NAMES[getRandomInt(0, SWAMINARAYAN_WOMEN_NAMES.length - 1)];
     firstName = baseName.toLowerCase().endsWith('ben') ? baseName : `${baseName}ben`;
     if (Math.random() > 0.7) firstName = baseName; 
  } else if (rand < 0.60) {
     // 35% Chance: Traditional Woman (Older)
     const baseName = TRADITIONAL_WOMEN_NAMES[getRandomInt(0, TRADITIONAL_WOMEN_NAMES.length - 1)];
     firstName = baseName.toLowerCase().endsWith('ben') ? baseName : `${baseName}ben`;
  } else {
     // 40% Chance: Modern Girl
     firstName = MODERN_GIRL_NAMES[getRandomInt(0, MODERN_GIRL_NAMES.length - 1)];
  }

  const fullName = `${surname} ${firstName}`;
  return { fullName, community };
};

export const generateBillId = () => {
  const random7 = Math.floor(1000000 + Math.random() * 9000000);
  return `SDMPO${random7}`;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const generateAutoBill = (minAmount: number, maxAmount: number): Bill => {
  // 1. Calculate Base Price first to determine total
  const adjustedMin = Math.max(0, (minAmount - 28000 - 19000) / 1.18);
  const adjustedMax = Math.max(0, (maxAmount - 28000 - 19000) / 1.18);
  const basePrice = getRandomInt(adjustedMin, adjustedMax);
  
  const product: Product = {
    name: PRODUCT_NAMES[getRandomInt(0, PRODUCT_NAMES.length - 1)],
    price: basePrice,
    gstRate: 0.18
  };

  const gstAmount = basePrice * product.gstRate;
  const total = basePrice + gstAmount + SANDHIYA_TAX_AMOUNT + PATHAN_TAX_AMOUNT;
  
  // 2. Determine Room & Type based on strict rules
  let assignedRoom = "101"; 
  let isSingleParty = false;

  if (total >= 10000000) {
      // High Value (1Cr - 2Cr) -> Room 450
      assignedRoom = "450";
      isSingleParty = Math.random() < 0.2; // Mostly dual, small chance of self
  } else {
      // Standard Range (10k - 99L)
      if (Math.random() < 0.3) {
          // Self/Cash -> Room 340
          isSingleParty = true;
          assignedRoom = "340"; 
      } else {
          // Standard Dual -> Room 110 to 200
          isSingleParty = false;
          assignedRoom = getRandomInt(110, 200).toString(); 
      }
  }
  
  let sender = generateRandomName();
  let receiver: { fullName: string; community: CommunityType };
  let receiverAddress: string;

  if (isSingleParty) {
    receiver = { fullName: "Self (Cash)", community: sender.community };
    receiverAddress = "Counter Sale (Cash)";
  } else {
    receiver = generateRandomName();
    while (sender.fullName === receiver.fullName) {
      receiver = generateRandomName();
    }
    receiverAddress = generateSuratAddress();
  }
  
  const senderAddress = generateSuratAddress();

  return {
    id: generateBillId(),
    senderName: sender.fullName,
    senderAddress: senderAddress,
    receiverName: receiver.fullName,
    receiverAddress: receiverAddress,
    date: new Date().toISOString(),
    items: [product],
    extraProducts: [],
    subtotal: basePrice,
    gstAmount: gstAmount,
    sandhiyaTax: SANDHIYA_TAX_AMOUNT,
    pathanTax: PATHAN_TAX_AMOUNT,
    totalAmount: total,
    isManual: false,
    timestamp: Date.now(),
    status: 'Verifying',
    assignedRoom: assignedRoom 
  };
};

// --- Helper Functions ---

const getBenName = (fullName: string) => {
  if (fullName.includes('Self')) return 'Sir/Ma\'am';
  
  const parts = fullName.split(' ');
  // Handle new Jadeja format: "Jadeja [Name] [MuslimName]"
  // The person's actual name is the second word (Index 1)
  if (parts[0] === "Jadeja" && parts.length >= 2) {
      return parts[1]; // Return "Sandhiyaba" directly, no 'ben' needed usually for 'ba' names
  }

  // Standard Format: "Surname Firstname"
  const firstName = parts.length > 1 ? parts[1] : parts[0];
  // Simple check if it already ends in ben
  if (firstName.toLowerCase().endsWith('ben')) return firstName;
  // If it ends in 'ba', return as is
  if (firstName.toLowerCase().endsWith('ba')) return firstName;

  return `${firstName}ben`;
};

// --- MAIN GENERATOR ---

export const generateSmartChatSequence = (
  bill: Bill, 
  salesEmpId: string, 
  salesEmpName: string, 
  salesRoom: string,
  financeEmpName: string = "Finance Manager"
): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  let currentTime = 0;
  
  // Standard slow pace for reading
  const addMsg = (msg: Omit<ChatMessage, 'timestamp' | 'id'>, customDelay?: number) => {
    const gap = customDelay || getRandomInt(6000, 10000); 
    currentTime += gap;
    messages.push({
      ...msg,
      id: `chat-${bill.id}-${messages.length}`,
      timestamp: currentTime
    });
  };

  const isSelf = bill.receiverName === "Self (Cash)";
  const senderName = bill.senderName;
  const receiverName = bill.receiverName;
  const senderBen = getBenName(senderName);
  
  const bankCharge = isSelf ? 0 : 389; 
  // Ensure totals match the bill object
  const finalTotal = bill.totalAmount + bankCharge;

  const breakdownData = {
      total: bill.subtotal,
      sandhiyaTax: bill.sandhiyaTax,
      pathanTax: bill.pathanTax,
      bankCharge: bankCharge,
      finalTotal: finalTotal
  };

  // --- COMMON FLOW START (Sales Room) ---
  
  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `GENERATING INVOICE #${bill.id}...`,
      messageType: 'csl_intro', metadata: { billId: bill.id }
  }, 1000);

  if (salesRoom === '450') {
      addMsg({
           senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
           text: `Welcome ${senderName} (VIP). Priority handling active.`
      });
  } else if (salesRoom === '340') {
      addMsg({
           senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
           text: `Counter Sales: ${senderName}.`
      });
  } else {
      addMsg({
           senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
           text: `${senderBen}, receipt ne details verify karavo.`
      });
  }

  // Dealer Action - UPDATED TO INCLUDE BILL
  addMsg({
      senderId: 'dealer', senderName: `${senderName}`, isEmployee: false, channel: salesRoom,
      text: `Details sent.`,
      messageType: 'receipt_anim',
      metadata: { bill: bill } // Pass the full bill object
  });

  // Breakdown in Sales Room
  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `Calculated Final Amount:`,
      messageType: 'bill_breakdown',
      metadata: { breakdown: breakdownData }
  }, 4000);

  // OTP Step - UPDATED
  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `OTP Request`,
      messageType: 'otp_req' // CHANGED FROM TEXT TO ANIMATION
  });

  const otp = getRandomInt(100000, 999999);
  addMsg({
      senderId: isSelf ? 'dealer' : 'customer', 
      senderName: isSelf ? senderName : receiverName, 
      isEmployee: false, channel: salesRoom,
      text: `OTP: ${otp}`,
      messageType: 'otp_verify_anim'
  });

  // Bank Step
  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `OTP Matched. Sending to Finance (Room 210) for approval.`
  });

  addMsg({
      senderId: 'system', senderName: 'System', isEmployee: false, channel: salesRoom,
      text: 'Waiting for Room 210...',
      messageType: 'bank_verification_waiting'
  });

  // --- ROOM 210 (FINANCE) INTERACTION ---
  
  const addFinanceMsg = (msg: Omit<ChatMessage, 'timestamp' | 'id'>, customDelay?: number) => {
      const gap = customDelay || getRandomInt(4000, 7000);
      currentTime += gap;
      messages.push({
          ...msg,
          id: `chat-fin-${bill.id}-${messages.length}`,
          timestamp: currentTime,
          channel: '210' // Explicitly set to Finance Room
      });
  };

  // Switch context to Finance
  addFinanceMsg({
      senderId: 'system', senderName: 'System', isEmployee: false, channel: '210',
      text: `Incoming Request: Invoice #${bill.id} from Room ${salesRoom}`,
      messageType: 'text'
  }, 100);

  addFinanceMsg({
      senderId: 'finance_emp', senderName: financeEmpName, isEmployee: true, channel: '210',
      text: `Checking payment details for ${formatCurrency(finalTotal)}...`
  });

  addFinanceMsg({
      senderId: 'finance_emp', senderName: financeEmpName, isEmployee: true, channel: '210',
      text: `Payment Received via IMPS.`,
      messageType: 'bank_verification_success'
  });

  addFinanceMsg({
      senderId: 'finance_emp', senderName: financeEmpName, isEmployee: true, channel: '210',
      text: `Approving`,
      messageType: 'approving_anim' // CHANGED FROM TEXT TO ANIMATION
  });

  // --- BACK TO SALES ROOM ---
  
  // Need to sync timestamp so sales room waits for finance
  // currentTime is already incremented by addFinanceMsg

  addMsg({
      senderId: 'system', senderName: 'System', isEmployee: false, channel: salesRoom,
      text: 'Payment Verified by Finance.',
      messageType: 'bank_verification_success'
  }, 500); // Small delay after finance finishes

  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `Transaction Approved.`,
      messageType: 'finance_approval',
      metadata: { billId: bill.id }
  });

  addMsg({
      senderId: salesEmpId, senderName: salesEmpName, isEmployee: true, channel: salesRoom,
      text: `Thank you, ${senderBen}. Have a good day.`
  });

  return messages;
};

export const generateInternalEmployeeChat = (emp1: Employee, emp2: Employee): ChatMessage[] => {
    // Placeholder for internal chats if needed later
    return [];
};
