import React, { useState, useEffect } from 'react';
import { Plus, Search, Ghost, Pencil, Trash2, Play } from 'lucide-react';

export default function RoomSelectionModal({
  showRoomModal,
  setShowRoomModal,
  mode, // "play" | "create"
  availableRooms,
  searchQuery,
  setSearchQuery,
  handleCreateRoom,
  setSelectedRoomObj,
  router,
  user,
  handleEditClick,
  handleDeleteRoom
}) {
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [inputDialogType, setInputDialogType] = useState('create'); // 'create' | 'edit'
  const [roomToEdit, setRoomToEdit] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Automatically open create input if mode is 'create'
  useEffect(() => {
    if (showRoomModal && mode === 'create') {
      setInputDialogType('create');
      setInputValue('');
      setShowInputDialog(true);
    } else {
      setShowInputDialog(false);
    }
  }, [showRoomModal, mode]);

  if (!showRoomModal) return null;

  const handleOpenCreate = () => {
    setInputDialogType('create');
    setInputValue('');
    setShowInputDialog(true);
  };

  const handleOpenEdit = (room) => {
    setInputDialogType('edit');
    setRoomToEdit(room);
    setInputValue(room.name);
    setShowInputDialog(true);
  };

  const handleCloseInputDialog = () => {
    setShowInputDialog(false);
    // If the modal was opened specifically to Create, closing the dialog should close the main modal
    if (mode === 'create') {
      setShowRoomModal(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      alert("กรุณากรอกชื่อห้อง");
      return;
    }
    if (inputDialogType === 'create') {
      handleCreateRoom(inputValue);
    } else {
      handleEditClick(roomToEdit, inputValue);
    }
    setShowInputDialog(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* Hide main room list background only if we are strictly in create mode and showing the input dialog */}
      <div className={`bg-[#222222] rounded-[24px] p-6 max-w-sm w-full mx-4 flex flex-col gap-6 shadow-2xl font-sans relative transition-all ${
        (mode === 'create' && showInputDialog) ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}>
        
        <button 
          onClick={() => setShowRoomModal(false)}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          <Plus size={24} className="rotate-45" />
        </button>

        <h2 className="text-center text-white font-medium text-lg tracking-wide mt-2">
          เลือกห้องเพื่อเข้าเล่น
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white rounded-2xl flex items-center px-4 py-3">
            <Search size={18} className="text-zinc-500 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาห้อง..."
              className="flex-1 bg-transparent text-sm text-zinc-800 placeholder:text-zinc-500 outline-none"
            />
          </div>
          {mode !== 'play' && (
            <button 
              onClick={handleOpenCreate}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
            >
              <Plus size={24} className="text-black" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          {availableRooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
            <div className="w-full h-40 border-2 border-dashed border-[#294a5a] rounded-3xl flex flex-col items-center justify-center gap-3 mt-4">
              <Ghost size={32} className="text-cyan-400" />
              <span className="text-cyan-400 text-xs font-medium tracking-wide">ไม่มีห้องเซิร์ฟเวอร์ใดที่เปิดอยู่</span>
            </div>
          ) : (
            availableRooms
              .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((room) => (
                <div
                  key={room.id}
                  onClick={() => {
                    setSelectedRoomObj(room);
                    setTimeout(() => {
                      router.push(`/game?roomId=${room.id}`);
                    }, 50);
                  }}
                  className="w-full bg-[#52bbf1] hover:bg-[#45aeea] text-white rounded-[20px] px-6 py-4 flex items-center justify-between transition-transform active:scale-[0.98] cursor-pointer group"
                >
                  <span className="font-medium text-sm flex-1 text-left">{room.name}</span>
                  
                  <span className="text-xs font-medium flex-1 text-center opacity-90">
                    {room.playerCount || 0} / 6
                  </span>

                  <div className="flex-1 flex justify-end items-center gap-2">
                    {(room.hostId === user?.id || user?.roleName?.toLowerCase() === "admin") && (
                      <div className="flex gap-1.5 mr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(room);
                          }}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-white text-white hover:text-[#52bbf1] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          title="แก้ไขชื่อห้อง"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room.id, room.name);
                          }}
                          className="w-8 h-8 rounded-full bg-white/20 hover:bg-red-500 text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                          title="ลบห้องเซิร์ฟเวอร์"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                      <Play size={14} className="text-black fill-black ml-0.5" />
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Beautiful Custom Prompt Overlay */}
      {showInputDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-xs">
          <form 
            onSubmit={handleSubmit}
            className="bg-[#2a2a2a] border border-zinc-700/50 rounded-[24px] p-6 max-w-xs w-full mx-4 flex flex-col gap-4 shadow-2xl font-sans animate-in fade-in zoom-in-95 duration-150"
          >
            <h3 className="text-white font-medium text-base text-center">
              {inputDialogType === 'create' ? 'สร้างเซิร์ฟเวอร์รูมใหม่' : 'แก้ไขชื่อเซิร์ฟเวอร์รูม'}
            </h3>
            
            <p className="text-[11px] text-zinc-400 text-center">
              {inputDialogType === 'create' ? 'พิมพ์ชื่อห้องที่คุณต้องการสร้างด้านล่าง' : 'พิมพ์ชื่อห้องใหม่ที่ต้องการแก้ไข'}
            </p>

            <input
              autoFocus
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="ตัวอย่าง: Room 99"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-sky-500 transition-colors"
            />

            <div className="flex gap-2.5 mt-2">
              <button
                type="button"
                onClick={handleCloseInputDialog}
                className="flex-1 py-2.5 bg-zinc-700 hover:bg-zinc-650 text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#52bbf1] hover:bg-[#45aeea] text-white text-xs font-bold rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                {inputDialogType === 'create' ? 'สร้างห้อง' : 'บันทึก'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
