
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bill } from '../types';
import { formatCurrency } from '../utils/generators';
import { Eye, X, Receipt, MapPin, CheckCircle, Clock } from 'lucide-react';

const CSL: React.FC = () => {
  const { bills } = useApp();
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  // Helper to extract area from full address for table display
  const getAreaFromAddress = (address: string) => {
    const parts = address.split(',');
    return parts.length > 2 ? parts[parts.length - 2].trim() : 'Surat';
  };

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto">
      <div className="mb-4 md:mb-6 flex justify-between items-center px-1 flex-shrink-0">
        <div>
           <h2 className="text-2xl md:text-3xl font-semibold text-[#111] dark:text-white transition-colors tracking-tight">Csl feed</h2>
           <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">Live transactions</p>
        </div>
        <div className="flex items-center space-x-2 text-[#E60023] dark:text-[#ff4d4d] bg-[#FFF0F0] dark:bg-[#330000] px-3 py-1.5 rounded-full border border-transparent">
            <span className="w-2 h-2 bg-[#E60023] rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-wide">Live</span>
        </div>
      </div>

      {/* --- DESKTOP TABLE VIEW (Hidden on Mobile) --- */}
      <div className="hidden md:block bg-white dark:bg-[#191919] shadow-sm border border-transparent dark:border-[#333333] rounded-[32px] flex flex-col transition-colors overflow-hidden">
        <div className="overflow-x-auto p-2">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white dark:bg-[#191919] border-b border-gray-100 dark:border-[#333]">
              <tr>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Time</th>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Sender</th>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider">Receiver</th>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider text-right">Amount</th>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider text-center">Status</th>
                <th className="p-5 text-xs font-semibold text-gray-500 dark:text-gray-400 tracking-wider text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-transparent">
              {bills.map((bill) => (
                <tr 
                  key={bill.id} 
                  className="hover:bg-[#F9F9F9] dark:hover:bg-[#282828] transition-colors group cursor-pointer rounded-[24px] animate-in slide-in-from-top-4 fade-in duration-500"
                  onClick={() => setSelectedBill(bill)}
                >
                  <td className="p-5 text-sm font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap rounded-l-[24px]">
                    {new Date(bill.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#111] dark:text-white">
                    <div className="flex flex-col">
                      <span>{bill.senderName}</span>
                      <span className="text-xs text-gray-500 font-medium">{getAreaFromAddress(bill.senderAddress)}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm text-[#111] dark:text-white">
                     <div className="flex flex-col">
                      <span className="font-semibold">{bill.receiverName}</span>
                      <span className="text-xs text-gray-500 font-medium">{getAreaFromAddress(bill.receiverAddress)}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-semibold text-[#111] dark:text-white text-right">
                    {formatCurrency(bill.totalAmount)}
                  </td>
                  <td className="p-5 text-center">
                    {bill.status === 'Verifying' ? (
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 border border-yellow-200 dark:border-yellow-800">
                          <Clock className="w-3 h-3 mr-1.5" /> Verifying
                       </span>
                    ) : (
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 border border-green-200 dark:border-green-800">
                          <CheckCircle className="w-3 h-3 mr-1.5" /> Verified
                       </span>
                    )}
                  </td>
                  <td className="p-5 text-center rounded-r-[24px]">
                    <button className="p-2 rounded-full bg-[#E9E9E9] dark:bg-[#333] hover:bg-[#d1d1d1] dark:hover:bg-[#444] transition-colors text-[#111] dark:text-white">
                        <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bills.length === 0 && (
             <div className="p-10 text-center text-gray-500 dark:text-gray-400 font-medium">
                No recent transactions found.
             </div>
          )}
          {/* Increased Spacer to h-32 to ensure bottom content is fully scrollable */}
          <div className="h-32"></div>
        </div>
      </div>

      {/* --- MOBILE CARD VIEW --- */}
      {/* Removed fixed overflow to allow Layout's PullToRefresh to handle scrolling naturally */}
      <div className="md:hidden space-y-3 pb-24 px-1">
          {bills.map((bill) => (
             <div 
                key={bill.id} 
                className="bg-white dark:bg-[#191919] p-4 rounded-[24px] shadow-sm border border-transparent dark:border-[#333333] active:scale-[0.98] transition-transform animate-in slide-in-from-top-12 fade-in duration-700"
                onClick={() => setSelectedBill(bill)}
             >
                <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-[#F5F5F5] dark:bg-[#282828] px-2 py-1 rounded-lg">
                        {new Date(bill.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    {bill.status === 'Verifying' ? (
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">Verifying</span>
                    ) : (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">Verified</span>
                    )}
                </div>
                
                <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">Sender:</span>
                        <span className="text-sm font-semibold text-[#111] dark:text-white truncate max-w-[180px]">{bill.senderName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-400 font-medium">Receiver:</span>
                        <span className="text-sm font-semibold text-[#111] dark:text-white truncate max-w-[180px]">{bill.receiverName}</span>
                    </div>
                </div>

                <div className="pt-3 border-t border-[#F5F5F5] dark:border-[#333] flex justify-between items-center">
                    <span className="text-lg font-bold text-[#111] dark:text-white">{formatCurrency(bill.totalAmount)}</span>
                    <button className="w-8 h-8 rounded-full bg-[#E60023] flex items-center justify-center text-white shadow-sm">
                        <Eye className="w-4 h-4" />
                    </button>
                </div>
             </div>
          ))}
          {/* Spacer to ensure last item is visible above mobile nav */}
          <div className="h-10"></div>
      </div>

      {/* --- DETAIL MODAL --- */}
      {selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#191919] rounded-[32px] w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl relative animate-pop border border-transparent dark:border-[#333]">
                <button 
                    onClick={() => setSelectedBill(null)}
                    className="absolute top-4 right-4 p-2 bg-[#F5F5F5] dark:bg-[#333] rounded-full hover:bg-[#E9E9E9] dark:hover:bg-[#444] transition-colors z-10"
                >
                    <X className="w-5 h-5 text-[#111] dark:text-white" />
                </button>

                <div className="p-6 md:p-8">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-[#FFF0F0] dark:bg-[#330000] rounded-full text-[#E60023] mb-3">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-semibold text-[#111] dark:text-white">Transaction details</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1">ID: {selectedBill.id}</p>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-[#F9F9F9] dark:bg-[#282828] rounded-[24px] space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Date</span>
                                <span className="font-semibold text-[#111] dark:text-white">{new Date(selectedBill.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Status</span>
                                <span className={`font-semibold ${selectedBill.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>{selectedBill.status}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 font-medium">Assigned room</span>
                                <span className="font-semibold text-[#111] dark:text-white">{selectedBill.assignedRoom}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                             <div className="flex-1 space-y-1">
                                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sender</span>
                                 <div className="font-semibold text-[#111] dark:text-white text-sm">{selectedBill.senderName}</div>
                                 <div className="text-xs text-gray-500 flex items-start gap-1">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {selectedBill.senderAddress}
                                 </div>
                             </div>
                             <div className="flex-1 space-y-1 text-right">
                                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Receiver</span>
                                 <div className="font-semibold text-[#111] dark:text-white text-sm">{selectedBill.receiverName}</div>
                                 <div className="text-xs text-gray-500 flex items-start gap-1 justify-end">
                                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {selectedBill.receiverAddress}
                                 </div>
                             </div>
                        </div>

                        <div className="border-t border-dashed border-gray-200 dark:border-[#444] pt-4">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</span>
                                 <span className="text-sm font-semibold text-[#111] dark:text-white">{formatCurrency(selectedBill.subtotal)}</span>
                             </div>
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Sandhiya tax</span>
                                 <span className="text-sm font-semibold text-[#E60023]">{formatCurrency(selectedBill.sandhiyaTax)}</span>
                             </div>
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Pathan tax</span>
                                 <span className="text-sm font-semibold text-purple-600">{formatCurrency(selectedBill.pathanTax)}</span>
                             </div>
                             <div className="flex justify-between items-center pt-2 mt-2 border-t border-[#F0F0F0] dark:border-[#333]">
                                 <span className="text-base font-bold text-[#111] dark:text-white">Total</span>
                                 <span className="text-xl font-bold text-[#111] dark:text-white">{formatCurrency(selectedBill.totalAmount)}</span>
                             </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button className="w-full py-4 bg-[#111] dark:bg-white text-white dark:text-[#111] rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                            Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default CSL;
