"use client";

import React from "react";

export default function CodeEditor({
  code,
  onCodeChange,
  onRun,
  isRunning,
  editorRef,
  onClose,
  description,
  isFullScreen = false
}) {
  return (
    <div className={`${isFullScreen ? "w-full h-full bg-[#17181a] border border-zinc-800 rounded-lg shadow-2xl" : "fixed bottom-6 left-6 z-40 w-[550px] max-w-full h-80 bg-[#202124]/95 backdrop-blur-md border border-zinc-800 rounded-lg shadow-2xl"} flex flex-col overflow-hidden text-slate-100 font-mono`}>
      {/* Header Info Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#17181a] border-b border-zinc-800 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wide text-zinc-400">main.js (เครื่องมือแก้ไขโค้ด)</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRun}
            disabled={isRunning}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-0.5 rounded text-[11px] font-bold active:scale-95 transition-all"
          >
            {isRunning ? "กำลังตรวจสอบ..." : "รันระบบ"}
          </button>
          <button
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-rose-400 transition-colors"
            title="ย่อขนาด"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Decryption Instruction Banner */}
      <div className="bg-[#1b2b40]/80 backdrop-blur border-b border-zinc-800/80 px-4 py-2.5 text-xs text-emerald-450 select-none flex items-start gap-2">
        <span className="text-sm">💡</span>
        <div>
          <span className="font-black text-zinc-100 uppercase tracking-wider text-[9px] bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded mr-2">
            ภารกิจถอดรหัส
          </span>
          <span className="text-zinc-300 font-sans leading-relaxed text-xs">
            {description}
          </span>
        </div>
      </div>

      {/* Code Input Area */}
      <div className="flex-1 flex overflow-hidden bg-black/25">
        {/* Line Numbers */}
        <div className="py-3 select-none text-right opacity-25 w-10 border-r border-zinc-800/80 overflow-hidden flex flex-col items-end pr-2.5 bg-black/10 text-[11px] leading-5">
          {code.split("\n").map((_, i) => (
            <div key={i} className="h-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={editorRef}
          value={code}
          onChange={onCodeChange}
          spellCheck="false"
          className="flex-1 p-3 bg-transparent outline-none border-none resize-none text-[11px] leading-5 text-[#c5c6c7] h-full w-full overflow-y-auto"
          style={{ tabSize: 2 }}
        />
      </div>
    </div>
  );
}
