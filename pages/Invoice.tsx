
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, getRandomInt } from '../utils/generators';
import { SANDHIYA_TAX_AMOUNT, PATHAN_TAX_AMOUNT, SURAT_AREAS, SURAT_LANDMARKS } from '../constants';
import { Bill, Product } from '../types';
import { Plus, Trash2, Save, MapPin, Users, User, X as XIcon, ChevronDown, Search, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Reusable Pinterest-Style Dropdown Component ---
const PinterestSelect = ({ label, value, onChange, options, placeholder }: { 
    label: string, value: string, onChange: (val: string) => void, options: string[], placeholder: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt: string) => 
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
        <label className="text-xs font-semibold text-gray-500 ml-2">{label}</label>
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full text-left pin-input flex items-center justify-between transition-all active:scale-[0.98] ${!value ? 'text-gray-500 font-normal' : 'text-[#111] dark:text-white font-semibold'}`}
            >
                <span className="truncate">{value || placeholder}</span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#E60023]' : ''}`} strokeWidth={2.5} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#191919] rounded-[24px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-[#333333] max-h-80 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-200 origin-top">
                    {/* Search Sticky Header */}
                    <div className="p-3 border-b border-gray-100 dark:border-[#333333] bg-white dark:bg-[#191919] sticky top-0 z-10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2.5} />
                            <input 
                                type="text"
                                autoFocus
                                placeholder="Type to search..."
                                className="w-full bg-[#F0F0F0] dark:bg-[#282828] rounded-full py-2.5 pl-9 pr-4 text-sm font-medium outline-none text-[#111] dark:text-white placeholder-gray-500 transition-colors focus:bg-[#E9E9E9] dark:focus:bg-[#333]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    
                    {/* Options List */}
                    <div className="overflow-y-auto p-2 custom-scrollbar flex-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt: string) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt);
                                        setIsOpen(false);
                                        setSearchTerm('');
                                    }}
                                    className={`w-full text-left px-4 py-3 rounded-[16px] text-sm font-semibold transition-all flex items-center justify-between mb-1 group
                                        ${value === opt 
                                            ? 'bg-[#111] text-white dark:bg-white dark:text-[#111] shadow-md transform scale-[1.02]' 
                                            : 'text-[#111] dark:text-white hover:bg-[#F0F0F0] dark:hover:bg-[#333]'
                                        }`}
                                >
                                    {opt}
                                    {value === opt && <Check className="w-4 h-4" strokeWidth={3} />}
                                </button>
                            ))
                        ) : (
                            <div className="p-8 text-center flex flex-col items-center text-gray-400">
                                <Search className="w-8 h-8 mb-2 opacity-20" />
                                <span className="text-xs font-medium">No matches found</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

// --- Reusable Address Form Component ---
const AddressFormSection = ({ 
    title, 
    name, setName, 
    flat, setFlat, 
    building, setBuilding, 
    landmark, setLandmark, 
    area, setArea 
  }: any) => (
    <div className="space-y-4 bg-[#F9F9F9] dark:bg-[#282828] p-6 md:p-8 rounded-[32px] transition-colors h-full">
       <h3 className="font-semibold text-[#111] dark:text-white text-lg pb-2 flex items-center">
         {title}
       </h3>
       
       <div className="space-y-2">
           <label className="text-xs font-semibold text-gray-500 ml-2">Full name <span className="text-red-500">*</span></label>
           <input 
             type="text" 
             required
             className="pin-input"
             placeholder="e.g. Ramesh Bhai Patel"
             value={name}
             onChange={(e) => setName(e.target.value)}
           />
       </div>

       <div className="grid grid-cols-3 gap-3">
          <div className="col-span-1 space-y-2">
             <label className="text-xs font-semibold text-gray-500 ml-2">Flat no.</label>
             <input 
                type="text" 
                className="pin-input"
                placeholder="A-101"
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
             />
          </div>
          <div className="col-span-2 space-y-2">
             <label className="text-xs font-semibold text-gray-500 ml-2">Building / house name <span className="text-red-500">*</span></label>
             <input 
                type="text" 
                required
                className="pin-input"
                placeholder="Gokuldham Society"
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
             />
          </div>
       </div>

       <div className="space-y-2">
           <PinterestSelect 
              label="Najik no vistar (optional)"
              value={landmark}
              onChange={setLandmark}
              options={SURAT_LANDMARKS.sort()}
              placeholder="Select Landmark"
           />
       </div>

       <div className="space-y-2">
           <PinterestSelect 
              label="Area / zone (optional)"
              value={area}
              onChange={setArea}
              options={SURAT_AREAS.sort()}
              placeholder="Select Area"
           />
       </div>
    </div>
);

const Invoice: React.FC = () => {
  const { addBill, employees } = useApp(); // Get employees to assign rooms dynamically
  const navigate = useNavigate();

  // New State for Invoice Type
  const [invoiceType, setInvoiceType] = useState<'standard' | 'self'>('standard');

  // Sender Details State
  const [senderName, setSenderName] = useState('');
  const [senderFlat, setSenderFlat] = useState('');
  const [senderBuilding, setSenderBuilding] = useState('');
  const [senderLandmark, setSenderLandmark] = useState('');
  const [senderArea, setSenderArea] = useState('');

  // Receiver Details State
  const [receiverName, setReceiverName] = useState('');
  const [receiverFlat, setReceiverFlat] = useState('');
  const [receiverBuilding, setReceiverBuilding] = useState('');
  const [receiverLandmark, setReceiverLandmark] = useState('');
  const [receiverArea, setReceiverArea] = useState('');

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<Product[]>([{ name: '', price: 0, gstRate: 0.18 }]);
  const [extraProductInput, setExtraProductInput] = useState('');
  const [extras, setExtras] = useState<string[]>([]);

  // Auto-fill receiver details when switching to Self
  useEffect(() => {
    if (invoiceType === 'self') {
      setReceiverName('Self (Cash)');
      setReceiverFlat('');
      setReceiverBuilding('Counter Sale');
      setReceiverLandmark('');
      setReceiverArea('');
    } else {
      setReceiverName('');
      setReceiverFlat('');
      setReceiverBuilding('');
      setReceiverLandmark('');
      setReceiverArea('');
    }
  }, [invoiceType]);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.price), 0);
    const gstAmount = subtotal * 0.18;
    const total = subtotal + gstAmount + SANDHIYA_TAX_AMOUNT + PATHAN_TAX_AMOUNT;
    return { subtotal, gstAmount, total };
  };

  const { subtotal, gstAmount, total } = calculateTotals();

  const handleAddItem = () => {
    setItems([...items, { name: '', price: 0, gstRate: 0.18 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof Product, value: string | number) => {
    const newItems = [...items];
    if (field === 'price') {
      newItems[index][field] = Number(value);
    } else {
      // @ts-ignore
      newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleAddExtra = () => {
    if (extraProductInput.trim()) {
      setExtras([...extras, extraProductInput.trim()]);
      setExtraProductInput('');
    }
  };

  const constructAddress = (flat: string, building: string, landmark: string, area: string) => {
    const parts = [];
    if (flat) parts.push(flat);
    if (building) parts.push(building);
    if (landmark) parts.push(landmark);
    if (area) parts.push(area);
    parts.push('Surat');
    return parts.join(', ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation Logic
    // SENDER: Name & Building required. Landmark/Area Optional.
    if (!senderName || !senderBuilding) {
        alert("Please enter Sender Name and Building Name.");
        return;
    }

    // RECEIVER: If standard, Name & Building required.
    if (invoiceType === 'standard' && (!receiverName || !receiverBuilding)) {
        alert("Please enter Receiver Name and Building Name.");
        return;
    }

    // ITEMS: Check if any item has no name or 0 price
    const invalidItems = items.some(i => !i.name.trim() || Number(i.price) <= 0);
    if (invalidItems) {
        alert("Please enter a valid Product Name and Price (greater than 0).");
        return;
    }

    // 2. Construct Addresses
    const finalSenderAddress = constructAddress(senderFlat, senderBuilding, senderLandmark, senderArea);
    
    let finalReceiverAddress = "Counter Sale (Cash)";
    if (invoiceType === 'standard') {
        finalReceiverAddress = constructAddress(receiverFlat, receiverBuilding, receiverLandmark, receiverArea);
    }

    // 3. Determine final values
    const finalReceiverName = invoiceType === 'self' ? "Self (Cash)" : receiverName;
    
    // DYNAMIC ROOM ASSIGNMENT LOGIC
    let assignedRoom = "101"; // Fallback default
    if (invoiceType === 'self') {
        assignedRoom = "340"; // Cash counter
    } else {
        // Standard Bill: Assign to a random available Sales Employee (Room != 340 and Room != 210)
        // This ensures the chat appears in a valid, active channel.
        const validEmployees = employees.filter(e => e.roomNumber && e.roomNumber !== '340' && e.roomNumber !== '210');
        
        if (validEmployees.length > 0) {
            const randomEmp = validEmployees[Math.floor(Math.random() * validEmployees.length)];
            assignedRoom = randomEmp.roomNumber;
        }
    }

    const newBill: Bill = {
      id: `MAN-${Date.now()}-${getRandomInt(100, 999)}`,
      senderName,
      senderAddress: finalSenderAddress,
      receiverName: finalReceiverName,
      receiverAddress: finalReceiverAddress,
      date: new Date(date).toISOString(),
      items,
      extraProducts: extras,
      subtotal,
      gstAmount,
      sandhiyaTax: SANDHIYA_TAX_AMOUNT,
      pathanTax: PATHAN_TAX_AMOUNT,
      totalAmount: total,
      isManual: true,
      timestamp: Date.now(),
      status: 'Verifying', // Must be 'Verifying' to trigger automation
      assignedRoom: assignedRoom
    };

    // 4. Save and Navigate
    addBill(newBill);
    navigate('/csl');
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 px-1">
        <h2 className="text-3xl font-semibold text-[#111] dark:text-white transition-colors">Create invoice</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Manually generate a bill.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#191919] rounded-[32px] shadow-sm border border-transparent dark:border-[#333333] overflow-visible transition-colors relative z-0">
        <div className="p-4 md:p-8 space-y-8">
          
          {/* Invoice Type Toggle */}
          <div className="flex justify-center mb-6">
              <div className="bg-[#E9E9E9] dark:bg-[#333333] p-1.5 rounded-full flex w-full md:w-auto space-x-1 transition-colors">
                  <button
                    type="button"
                    onClick={() => setInvoiceType('standard')}
                    className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-full text-sm font-semibold flex justify-center items-center transition-all ${
                        invoiceType === 'standard' 
                        ? 'bg-white dark:bg-[#111111] text-[#111] dark:text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                      <Users className="w-4 h-4 mr-2" strokeWidth={2.5} />
                      Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setInvoiceType('self')}
                    className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-full text-sm font-semibold flex justify-center items-center transition-all ${
                        invoiceType === 'self' 
                        ? 'bg-[#E60023] text-white shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}
                  >
                      <User className="w-4 h-4 mr-2" strokeWidth={2.5} />
                      Self / cash
                  </button>
              </div>
          </div>

          {/* Addresses Grid */}
          <div className={`grid gap-6 transition-all ${invoiceType === 'standard' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Sender Section (Always visible) */}
            <div className="relative z-20"> 
               <AddressFormSection 
                  title="Sender (dealer) details"
                  name={senderName} setName={setSenderName}
                  flat={senderFlat} setFlat={setSenderFlat}
                  building={senderBuilding} setBuilding={setSenderBuilding}
                  landmark={senderLandmark} setLandmark={setSenderLandmark}
                  area={senderArea} setArea={setSenderArea}
               />
            </div>

            {/* Receiver Section - Hidden if Self */}
            {invoiceType === 'standard' && (
                <div className="animate-in fade-in slide-in-from-right-4 transition-colors h-full relative z-10">
                    <AddressFormSection 
                        title="Receiver (customer) details"
                        name={receiverName} setName={setReceiverName}
                        flat={receiverFlat} setFlat={setReceiverFlat}
                        building={receiverBuilding} setBuilding={setReceiverBuilding}
                        landmark={receiverLandmark} setLandmark={setReceiverLandmark}
                        area={receiverArea} setArea={setReceiverArea}
                    />
                </div>
            )}
          </div>

          <div className="flex justify-end relative z-0">
             <div className="w-full md:w-1/3 space-y-2">
               <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-2">Invoice date</label>
               <input 
                 type="date" 
                 required
                 className="pin-input"
                 value={date}
                 onChange={(e) => setDate(e.target.value)}
               />
             </div>
          </div>

          {/* Items */}
          <div className="space-y-4 relative z-0">
             <div className="flex justify-between items-center pb-2">
               <h3 className="font-semibold text-xl text-[#111] dark:text-white">Products</h3>
               <button type="button" onClick={handleAddItem} className="text-sm text-[#111] dark:text-white bg-[#E9E9E9] dark:bg-[#333333] font-semibold flex items-center hover:bg-[#d1d1d1] dark:hover:bg-[#444] px-4 py-2 rounded-full transition pin-btn">
                 <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add item
               </button>
             </div>
             {items.map((item, index) => (
               <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-[#F9F9F9] dark:bg-[#282828] p-6 rounded-[32px] transition-colors">
                  <div className="flex-1 w-full">
                     <label className="text-xs text-gray-500 mb-1 block ml-2 font-semibold">Product name <span className="text-red-500">*</span></label>
                     <input 
                        type="text" 
                        required
                        className="pin-input"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                     />
                  </div>
                  <div className="w-full md:w-40">
                     <label className="text-xs text-gray-500 mb-1 block ml-2 font-semibold">Price (INR) <span className="text-red-500">*</span></label>
                     <input 
                        type="number" 
                        required
                        min="1"
                        className="pin-input text-right"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                     />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => handleRemoveItem(index)} className="p-3.5 bg-white dark:bg-[#111111] rounded-full text-gray-400 hover:text-[#E60023] hover:bg-[#FFF0F0] dark:hover:bg-[#330000] transition-colors">
                      <Trash2 className="w-5 h-5" strokeWidth={2} />
                    </button>
                  )}
               </div>
             ))}
          </div>

          {/* Extras */}
          <div className="space-y-2 relative z-0">
              <label className="text-sm font-semibold text-gray-500 dark:text-gray-400 ml-2">Extra added products (notes)</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="pin-input"
                  placeholder="Additional items included..."
                  value={extraProductInput}
                  onChange={(e) => setExtraProductInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExtra())}
                />
                <button type="button" onClick={handleAddExtra} className="bg-[#111] dark:bg-white px-6 rounded-full font-semibold text-white dark:text-black hover:opacity-90 transition-colors pin-btn">Add</button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {extras.map((ex, idx) => (
                  <span key={idx} className="bg-[#FFF0F0] dark:bg-[#330000] text-[#E60023] px-3 py-1.5 rounded-full text-sm font-semibold flex items-center transition-colors">
                    {ex} <button type="button" onClick={() => setExtras(extras.filter((_, i) => i !== idx))} className="ml-2 hover:scale-125 transition-transform"><XIcon className="w-4 h-4" /></button>
                  </span>
                ))}
              </div>
          </div>

          {/* Summary */}
          <div className="bg-[#111] dark:bg-[#111111] border border-transparent dark:border-[#333333] text-white p-6 md:p-8 rounded-[32px] space-y-4 transition-colors relative z-0">
             <div className="flex justify-between text-gray-400 text-sm font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
             </div>
             <div className="flex justify-between text-gray-400 text-sm font-medium">
                <span>Gst (18%)</span>
                <span>{formatCurrency(gstAmount)}</span>
             </div>
             <div className="flex justify-between text-[#E60023] font-semibold">
                <span>Sandhiya tax (fixed)</span>
                <span>{formatCurrency(SANDHIYA_TAX_AMOUNT)}</span>
             </div>
             <div className="flex justify-between text-[#E60023] font-semibold">
                <span>Pathan tax (fixed)</span>
                <span>{formatCurrency(PATHAN_TAX_AMOUNT)}</span>
             </div>
             <div className="border-t border-[#333] pt-4 flex justify-between items-center">
                <span className="text-xl font-semibold">Total payable</span>
                <span className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{formatCurrency(total)}</span>
             </div>
          </div>

        </div>
        <div className="p-6 bg-[#F9F9F9] dark:bg-[#282828] flex justify-end transition-colors relative z-0">
           <button 
             type="submit" 
             className="w-full md:w-auto bg-[#E60023] hover:bg-[#ad081b] text-white px-10 py-4 rounded-full font-semibold text-lg shadow-sm pin-btn flex justify-center items-center transition-colors"
           >
             <Save className="w-5 h-5 mr-2" strokeWidth={2.5} />
             Create invoice
           </button>
        </div>
      </form>
    </div>
  );
};

export default Invoice;
