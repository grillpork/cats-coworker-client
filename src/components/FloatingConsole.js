"use client";

import React, { useRef, useEffect } from "react";

export default function FloatingConsole({
  history,
  onClear,
  onClose,
  input,
  onInputChange,
  onSubmitCommand,
  accentColor = "text-emerald-400",
}) {
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  return (
    <div className="fixed bottom-6 right-6 z-40 w-96 max-w-full h-64 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg shadow-2xl flex flex-col overflow-hidden text-slate-100 font-mono text-xs">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800 select-none">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-[11px] tracking-wide opacity-80">FLOATING CONSOLE</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClear}
            className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Terminal logs"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="text-[10px] text-slate-400 hover:text-rose-400 transition-colors"
            title="Minimize"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 bg-black/40">
        {history.length === 0 ? (
          <div className="text-slate-500 italic text-[11px]">Console idle. Ready for outputs...</div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="leading-relaxed break-all">
              {item.type === "cmd" && (
                <span className="text-slate-500">
                  $ <span className={accentColor}>{item.text}</span>
                </span>
              )}
              {item.type === "sys" && (
                <span className="text-blue-400 font-medium">{item.text}</span>
              )}
              {item.type === "out" && (
                <span className="text-slate-300">{item.text}</span>
              )}
              {item.type === "success" && (
                <span className="text-emerald-400 font-bold">✓ {item.text}</span>
              )}
              {item.type === "err" && (
                <span className="text-rose-500 font-semibold">✗ {item.text}</span>
              )}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>

      {/* Input Prompter */}
      <form onSubmit={onSubmitCommand} className="flex items-center px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80">
        <span className="text-emerald-400 mr-2">$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none font-mono text-xs text-white"
          placeholder="Type console command... (run, help, clear)"
        />
      </form>
    </div>
  );
}
