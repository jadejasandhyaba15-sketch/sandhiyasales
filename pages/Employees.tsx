
import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Employee } from '../types';
import { UserPlus, Upload, Save, X, Edit2, Users, Key, Move, ZoomIn, Check, RotateCw, RefreshCcw, ArrowDown, ChevronDown, Briefcase } from 'lucide-react';

// --- Official Blue Verified Badge (Perfect Round) ---
const VerifiedBadge = () => (
  <svg 
    viewBox="0 0 24 24" 
    className="w-4 h-4 md:w-5 md:h-5 ml-1 flex-shrink-0 text-[#0095F6] inline-block align-text-bottom" 
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Verified"
  >
    <title>Verified</title>
    {/* Solid Blue Circle filling the viewbox */}
    <circle cx="12" cy="12" r="12" fill="currentColor" />
    {/* White Checkmark */}
    <path d="M7 12.5L10 15.5L17 8.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Employees: React.FC = () => {
  const { employees, addEmployee, updateEmployee } = useApp();
  
  // UI State
  const [isFormOpen, setIsFormOpen] = useState(false); // Controls the main Add/Edit Modal
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEmployeeId, setCurrentEmployeeId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  
  // Dropdown States
  const [isRoomDropdownOpen, setIsRoomDropdownOpen] = useState(false); 
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false); // New state for role dropdown
  
  // Image State
  const [imageSrc, setImageSrc] = useState<string | null>(null); 
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Crop State
  const [showCropModal, setShowCropModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
  const [baseScale, setBaseScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Constants
  const roomOptions = useMemo(() => {
    const start = 110;
    const end = 1340;
    return Array.from({ length: end - start + 1 }, (_, i) => (start + i).toString());
  }, []);

  // Job Role Options
  const jobRoleOptions = useMemo(() => [
    "H.R.",
    "C.E.O.",
    "Employee",
    "Fund Manager",
    "Bank Manager",
    "Sandhiya Manager",
    "Pathan Manager"
  ], []);

  // Handlers
  const openAddModal = () => {
      setIsEditing(false);
      setCurrentEmployeeId(null);
      setName('');
      setRole('');
      setRoomNumber('');
      setIsRoomDropdownOpen(false);
      setIsRoleDropdownOpen(false);
      setPreviewUrl(null);
      setImageSrc(null);
      setIsFormOpen(true);
  };

  const openEditModal = (emp: Employee) => {
      setIsEditing(true);
      setCurrentEmployeeId(emp.id);
      setName(emp.name);
      setRole(emp.role);
      setRoomNumber(emp.roomNumber || '');
      setIsRoomDropdownOpen(false);
      setIsRoleDropdownOpen(false);
      setPreviewUrl(emp.imageUrl);
      setImageSrc(emp.imageUrl);
      setIsFormOpen(true);
  };

  const closeFormModal = () => {
      setIsFormOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setImageSrc(url);
      
      setZoom(1);
      setRotation(0);
      setCropPos({ x: 0, y: 0 });
      setBaseScale(1); 
      setShowCropModal(true); // Open Crop Modal (on top of Form Modal)
    }
  };

  // Called when image loads in the modal to determine initial fit
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { naturalWidth, naturalHeight } = e.currentTarget;
      const cropAreaSize = 300; 
      const scale = cropAreaSize / Math.min(naturalWidth, naturalHeight);
      setBaseScale(scale);
  };

  // Dragging Logic
  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragStart({ x: clientX - cropPos.x, y: clientY - cropPos.y });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); 
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setCropPos({ x: clientX - dragStart.x, y: clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const rotateImage = () => setRotation(prev => (prev + 90) % 360);
  const resetCrop = () => { setZoom(1); setRotation(0); setCropPos({ x: 0, y: 0 }); };

  const generateCroppedImage = () => {
      if (!imageSrc || !imgRef.current) return;
      const canvas = document.createElement('canvas');
      const size = 400; 
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const img = imgRef.current;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);
      const outputRatio = size / 300;
      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.translate(cropPos.x * outputRatio, cropPos.y * outputRatio);
      ctx.rotate((rotation * Math.PI) / 180);
      const finalScale = baseScale * zoom * outputRatio;
      ctx.scale(finalScale, finalScale);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
      ctx.restore();
      const base64Image = canvas.toDataURL('image/jpeg', 0.95);
      setPreviewUrl(base64Image);
      setShowCropModal(false);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !previewUrl || !roomNumber) {
      alert("Please provide name, role, room number and an image.");
      return;
    }

    if (isEditing && currentEmployeeId) {
       updateEmployee({
         id: currentEmployeeId,
         name,
         role,
         imageUrl: previewUrl,
         roomNumber
       });
    } else {
      addEmployee({
        id: `EMP-${Date.now()}`,
        name,
        role,
        imageUrl: previewUrl,
        roomNumber
       });
    }
    closeFormModal();
  };

  const getRoomStatus = (room: string) => {
    const owner = employees.find(e => e.roomNumber === room);
    if (owner && owner.id !== currentEmployeeId) {
        return { isTaken: true, ownerName: owner.name };
    }
    return { isTaken: false, ownerName: null };
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">
       {/* Header with Add Button */}
       <div className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-[#191919] p-5 md:p-8 rounded-[24px] md:rounded-[32px] shadow-sm border border-transparent dark:border-[#333333] transition-colors">
          <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-0 w-full md:w-auto">
             <div className="bg-[#F0F0F0] dark:bg-[#333333] p-2 md:p-3 rounded-full">
               <Users className="w-6 h-6 md:w-8 md:h-8 text-[#111] dark:text-white" strokeWidth={2.5} />
             </div>
             <div>
               <h2 className="text-2xl md:text-3xl font-semibold text-[#111] dark:text-white">Employees</h2>
               <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">Manage staff access and profiles</p>
             </div>
          </div>
          <button 
            onClick={openAddModal}
            className="w-full md:w-auto bg-[#E60023] hover:bg-[#ad081b] text-white px-6 py-3 md:px-8 md:py-3.5 rounded-full font-semibold flex items-center justify-center shadow-sm pin-btn transition-colors text-base md:text-lg active:scale-95 transform duration-150"
          >
             <UserPlus className="w-5 h-5 md:w-6 md:h-6 mr-2" strokeWidth={2.5} />
             Add employee
          </button>
       </div>

       {/* Employee Grid */}
       <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
         {employees.map(emp => (
            <div key={emp.id} className="bg-white dark:bg-[#191919] rounded-[24px] md:rounded-[32px] shadow-sm border border-transparent dark:border-[#333333] overflow-hidden group hover:shadow-lg hover:border-[#E9E9E9] dark:hover:border-[#3f3f3f] transition-all duration-300 animate-pop">
               {/* Banner/Background */}
               <div className="h-20 md:h-28 bg-[#F0F0F0] dark:bg-[#282828] relative">
                   <button 
                     onClick={() => openEditModal(emp)}
                     className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2.5 bg-white dark:bg-[#333333] hover:scale-110 rounded-full text-[#111] dark:text-white shadow-sm transition-transform z-10 pin-btn"
                   >
                      <Edit2 className="w-3 h-3 md:w-4 md:h-4" strokeWidth={2.5} />
                   </button>
               </div>
               
               <div className="px-3 pb-4 md:px-8 md:pb-8 relative text-center">
                   {/* Avatar overlapping banner */}
                   <div className="-mt-10 md:-mt-14 mb-2 md:mb-4 relative inline-block">
                       <img src={emp.imageUrl} alt={emp.name} className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover border-4 border-white dark:border-[#191919] shadow-sm bg-white dark:bg-[#222]" />
                       <div className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-green-500 border-4 border-white dark:border-[#191919] w-4 h-4 md:w-6 md:h-6 rounded-full"></div>
                   </div>
                   
                   <div>
                      <div className="flex items-center justify-center mb-0.5 md:mb-1">
                          <h3 className="text-base md:text-xl font-semibold text-[#111] dark:text-white truncate font-sans max-w-[120px] md:max-w-none">
                              {emp.name}
                          </h3>
                          <VerifiedBadge />
                      </div>
                      
                      <p className="text-gray-500 dark:text-gray-400 font-medium text-xs md:text-sm mb-3 md:mb-6 font-sans truncate">{emp.role}</p>
                      
                      <div className="bg-[#F9F9F9] dark:bg-[#282828] rounded-[16px] md:rounded-[24px] p-2 md:p-4 flex items-center justify-between border border-transparent dark:border-[#333333]">
                          <div className="flex items-center text-gray-500 dark:text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-wider">
                             <Key className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                             Room
                          </div>
                          <span className="font-mono font-semibold text-[#111] dark:text-white text-sm md:text-base">{emp.roomNumber}</span>
                      </div>
                   </div>
               </div>
            </div>
         ))}
         
         {employees.length === 0 && (
            <div className="col-span-full py-24 text-center">
                <div className="inline-flex bg-[#E9E9E9] dark:bg-[#2F2F2F] p-6 rounded-full mb-6">
                    <Users className="w-12 h-12 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-semibold text-[#111] dark:text-white font-sans">No employees yet</h3>
                <p className="text-gray-500 dark:text-gray-400 text-lg mt-2 font-sans">Click "Add employee" at the top right to get started.</p>
            </div>
         )}
       </div>

       {/* --- ADD / EDIT FORM MODAL --- */}
       {isFormOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#191919] rounded-[32px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-transparent dark:border-[#333333] animate-pop">
               <div className="p-6 border-b border-[#F0F0F0] dark:border-[#333333] flex justify-between items-center bg-white dark:bg-[#191919] sticky top-0 z-10">
                  <h3 className="text-xl md:text-2xl font-semibold text-[#111] dark:text-white flex items-center font-sans">
                     {isEditing ? 'Edit profile' : 'New employee'}
                  </h3>
                  <button onClick={closeFormModal} className="w-10 h-10 rounded-full bg-[#E9E9E9] dark:bg-[#333333] flex items-center justify-center hover:bg-[#d1d1d1] dark:hover:bg-[#444] transition-colors pin-btn">
                     <X className="w-5 h-5 text-[#111] dark:text-white" strokeWidth={2.5} />
                  </button>
               </div>

               <div className="p-6 md:p-8">
                  <form onSubmit={handleSaveEmployee} className="space-y-6 md:space-y-8">
                      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                         {/* Image Upload Section */}
                         <div className="flex flex-col items-center space-y-4 w-full md:w-auto">
                             <div 
                               onClick={() => fileInputRef.current?.click()}
                               className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-dashed border-gray-300 dark:border-[#444] flex items-center justify-center bg-[#F9F9F9] dark:bg-[#282828] overflow-hidden relative group cursor-pointer hover:border-[#E60023] transition-colors pin-btn"
                             >
                                {previewUrl ? (
                                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-center p-4">
                                     <Upload className="w-8 h-8 md:w-10 md:h-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" strokeWidth={2} />
                                     <span className="text-xs text-gray-500 font-semibold uppercase font-sans">Upload</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                                    <div className="bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                       <Edit2 className="w-5 h-5 text-[#111]" />
                                    </div>
                                </div>
                             </div>
                             <input 
                               type="file" 
                               ref={fileInputRef} 
                               className="hidden" 
                               accept="image/*" 
                               onChange={handleFileChange} 
                             />
                         </div>

                         {/* Input Fields */}
                         <div className="flex-1 space-y-4 md:space-y-6 w-full">
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-4 font-sans">Full name</label>
                                <input 
                                  type="text" 
                                  className="pin-input"
                                  placeholder="e.g. Rahul Patel"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            
                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-4 font-sans">Job role</label>
                                <div className="relative">
                                    {/* Role Dropdown Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                                        className={`w-full p-4 pl-14 pr-12 bg-[#E9E9E9] dark:bg-[#333333] hover:bg-[#d1d1d1] dark:hover:bg-[#444] border-none rounded-full outline-none font-semibold text-[#111] dark:text-white cursor-pointer transition-all font-sans text-left flex items-center relative z-10 pin-input`}
                                    >
                                        <Briefcase className={`absolute left-6 w-5 h-5 transition-colors ${role ? 'text-[#E60023]' : 'text-gray-500'}`} />
                                        <span className={role ? 'text-[#111] dark:text-white' : 'text-gray-500'}>
                                            {role || 'Select job role'}
                                        </span>
                                        <ChevronDown className={`absolute right-6 w-5 h-5 text-gray-500 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
                                    </button>

                                    {/* Role Dropdown Options */}
                                    {isRoleDropdownOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-0" 
                                                onClick={() => setIsRoleDropdownOpen(false)}
                                            ></div>
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#191919] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-[#333333] max-h-64 overflow-y-auto z-20 p-2 animate-in slide-in-from-top-2 fade-in duration-200 custom-scrollbar">
                                                {jobRoleOptions.map((job) => {
                                                    const isSelected = role === job;
                                                    return (
                                                        <button
                                                            key={job}
                                                            type="button"
                                                            onClick={() => {
                                                                setRole(job);
                                                                setIsRoleDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-3 rounded-[16px] font-semibold font-sans text-sm flex justify-between items-center transition-all mb-1 pin-btn
                                                                ${isSelected 
                                                                    ? 'bg-[#111] text-white dark:bg-white dark:text-[#111] shadow-sm' 
                                                                    : 'text-[#111] dark:text-white hover:bg-[#E9E9E9] dark:hover:bg-[#333333]'
                                                                }
                                                            `}
                                                        >
                                                            <span>{job}</span>
                                                            {isSelected && <Check className="w-4 h-4" strokeWidth={4} />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="relative group">
                                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 ml-4 font-sans">Assign room</label>
                                <div className="relative">
                                    {/* Custom Dropdown Trigger */}
                                    <button
                                        type="button"
                                        onClick={() => setIsRoomDropdownOpen(!isRoomDropdownOpen)}
                                        className={`w-full p-4 pl-14 pr-12 bg-[#E9E9E9] dark:bg-[#333333] hover:bg-[#d1d1d1] dark:hover:bg-[#444] border-none rounded-full outline-none font-semibold text-[#111] dark:text-white cursor-pointer transition-all font-sans text-left flex items-center relative z-10 pin-input`}
                                    >
                                        <Key className={`absolute left-6 w-5 h-5 transition-colors ${roomNumber ? 'text-[#E60023]' : 'text-gray-500'}`} />
                                        <span className={roomNumber ? 'text-[#111] dark:text-white' : 'text-gray-500'}>
                                            {roomNumber ? `Room ${roomNumber}` : 'Select room number'}
                                        </span>
                                        <ChevronDown className={`absolute right-6 w-5 h-5 text-gray-500 transition-transform duration-200 ${isRoomDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
                                    </button>

                                    {/* Custom Dropdown Options */}
                                    {isRoomDropdownOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-0" 
                                                onClick={() => setIsRoomDropdownOpen(false)}
                                            ></div>
                                            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-[#191919] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 dark:border-[#333333] max-h-64 overflow-y-auto z-20 p-2 animate-in slide-in-from-top-2 fade-in duration-200 custom-scrollbar">
                                                {roomOptions.map((room) => {
                                                    const status = getRoomStatus(room);
                                                    const isSelected = roomNumber === room;
                                                    return (
                                                        <button
                                                            key={room}
                                                            type="button"
                                                            disabled={status.isTaken}
                                                            onClick={() => {
                                                                setRoomNumber(room);
                                                                setIsRoomDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-5 py-3 rounded-[16px] font-semibold font-sans text-sm flex justify-between items-center transition-all mb-1 pin-btn
                                                                ${status.isTaken 
                                                                    ? 'opacity-40 cursor-not-allowed bg-gray-50 dark:bg-[#282828] text-gray-400' 
                                                                    : isSelected 
                                                                        ? 'bg-[#111] text-white dark:bg-white dark:text-[#111] shadow-sm' 
                                                                        : 'text-[#111] dark:text-white hover:bg-[#E9E9E9] dark:hover:bg-[#333333]'
                                                                }
                                                            `}
                                                        >
                                                            <span>Room {room}</span>
                                                            {status.isTaken ? (
                                                                <span className="text-[10px] font-extrabold uppercase bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-full">Booked</span>
                                                            ) : isSelected ? (
                                                                <Check className="w-4 h-4" strokeWidth={4} />
                                                            ) : null}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t border-[#F0F0F0] dark:border-[#333333] flex justify-end gap-3">
                         <button 
                           type="button" 
                           onClick={closeFormModal}
                           className="px-8 py-3.5 rounded-full font-semibold text-[#111] dark:text-white bg-[#E9E9E9] dark:bg-[#333333] hover:bg-[#d1d1d1] dark:hover:bg-[#444] transition-colors pin-btn font-sans"
                         >
                           Cancel
                         </button>
                         <button 
                           type="submit" 
                           className="bg-[#E60023] text-white px-10 py-3.5 rounded-full font-semibold hover:bg-[#ad081b] transition shadow-sm flex items-center pin-btn font-sans"
                         >
                           {isEditing ? 'Save changes' : 'Create account'}
                         </button>
                      </div>
                  </form>
               </div>
            </div>
         </div>
       )}

       {/* --- CROP MODAL (High Z-Index) --- */}
       {showCropModal && imageSrc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
           <div className="bg-[#191919] rounded-[32px] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] border border-[#333] animate-pop">
              <div className="p-4 border-b border-[#333] flex justify-between items-center bg-[#191919]">
                 <h3 className="font-semibold text-white flex items-center text-lg ml-2 font-sans">
                    Adjust photo
                 </h3>
                 <button onClick={() => setShowCropModal(false)} className="p-2 hover:bg-[#333] rounded-full pin-btn">
                     <X className="w-6 h-6 text-white" />
                 </button>
              </div>
              
              <div 
                className="relative bg-black overflow-hidden cursor-move select-none touch-none h-[400px] flex items-center justify-center"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchMove={handleMouseMove}
                onTouchEnd={handleMouseUp}
              >
                 <img 
                   ref={imgRef}
                   src={imageSrc} 
                   alt="Crop Target"
                   onLoad={onImageLoad}
                   className="max-w-none absolute pointer-events-none origin-center"
                   style={{ 
                       transform: `translate(${cropPos.x}px, ${cropPos.y}px) rotate(${rotation}deg) scale(${baseScale * zoom})`,
                       maxWidth: 'none', 
                       maxHeight: 'none',
                       transition: isDragging ? 'none' : 'transform 0.1s' 
                   }}
                   onDragStart={(e) => e.preventDefault()}
                 />
                 
                 <div className="absolute inset-0 pointer-events-none z-10">
                    <div className="w-full h-full bg-black bg-opacity-60 flex items-center justify-center">
                         <div className="w-[300px] h-[300px] rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] relative overflow-hidden">
                             <div className="absolute top-1/3 left-0 w-full h-[1px] bg-white opacity-20"></div>
                             <div className="absolute top-2/3 left-0 w-full h-[1px] bg-white opacity-20"></div>
                             <div className="absolute top-0 left-1/3 w-[1px] h-full bg-white opacity-20"></div>
                             <div className="absolute top-0 left-2/3 w-[1px] h-full bg-white opacity-20"></div>
                             <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white opacity-40"></div>
                             <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white opacity-40"></div>
                         </div>
                    </div>
                 </div>
              </div>

              <div className="p-6 space-y-6 bg-[#191919]">
                 <div className="flex flex-col gap-6">
                    <div className="flex items-center space-x-4">
                        <ZoomIn className="w-6 h-6 text-gray-400" />
                        <input 
                          type="range" 
                          min="0.1" 
                          max="3" 
                          step="0.05" 
                          value={zoom} 
                          onChange={(e) => setZoom(parseFloat(e.target.value))}
                          className="w-full h-1 bg-[#333] rounded-lg appearance-none cursor-pointer accent-[#E60023]"
                        />
                    </div>
                    <div className="flex justify-center">
                        <button 
                            type="button"
                            onClick={rotateImage}
                            className="flex items-center px-6 py-3 bg-[#333] hover:bg-[#444] text-white rounded-full text-sm font-semibold transition pin-btn font-sans"
                        >
                            <RotateCw className="w-4 h-4 mr-2" /> Rotate 90°
                        </button>
                    </div>
                 </div>

                 <div className="flex gap-4 border-t border-[#333] pt-6">
                    <button 
                        onClick={() => setShowCropModal(false)} 
                        className="flex-1 py-3.5 text-white font-semibold bg-[#333] rounded-full hover:bg-[#444] transition pin-btn font-sans"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={generateCroppedImage} 
                        className="flex-1 py-3.5 text-white font-semibold bg-[#E60023] rounded-full hover:bg-[#ad081b] flex items-center justify-center transition pin-btn font-sans"
                    >
                        Save photo
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
