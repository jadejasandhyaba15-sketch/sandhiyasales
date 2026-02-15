
export interface Product {
  name: string;
  price: number;
  gstRate: number;
}

export interface Bill {
  id: string;
  senderName: string;
  senderAddress: string; // New field for full address
  receiverName: string; 
  receiverAddress: string; // New field for full address
  date: string;
  items: Product[];
  extraProducts: string[];
  subtotal: number;
  gstAmount: number;
  sandhiyaTax: number; // Fixed 28,000
  pathanTax: number;   // Fixed 19,000
  totalAmount: number;
  isManual: boolean;
  timestamp: number;
  status: 'Verifying' | 'Verified'; // New status field
  verifiedTimestamp?: number; // Added to track verification time for auto-deletion
  assignedRoom: string; // Room Number logic
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  roomNumber: string; // Added room number field
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'system' | 'user' | employee_id
  senderName: string;
  text: string;
  timestamp: number;
  isEmployee: boolean;
  avatar?: string;
  channel: string; // Now used for Room Number (e.g., '101', '210', '340')
  messageType?: 'text' | 'csl_intro' | 'receipt_anim' | 'signature_req' | 'signature_submission' | 'signature_verify_anim' | 
                'bill_breakdown' | 'otp_req' | 'otp_submission' | 'otp_verify_anim' | 
                'bank_details_submission' | 'bank_verification_waiting' | 'bank_verification_success' |
                'room_210_check' | 'room_210_success' | 'finance_approval' | 
                'round_loader' | 'next_order_hire' | 'approving_anim'; // Added approving_anim
  metadata?: {
    billId?: string;
    bill?: Bill; // Added full bill object
    amount?: number;
    senderName?: string;
    receiverName?: string;
    bankName?: string;
    accountLast4?: string;
    ifsc?: string;
    queuePosition?: number;
    approvedForRoom?: string;
    breakdown?: {
        total: number;
        sandhiyaTax: number;
        pathanTax: number;
        bankCharge: number;
        finalTotal: number;
    }
  };
}

export enum CommunityType {
  LEUVA = 'Leuva Patel',
  KADVA = 'Kadva Patel',
  DARBAR = 'Darbar'
}
