"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import FloatingConsole from "../components/FloatingConsole";
import CodeEditor from "../components/CodeEditor";
import GameOverOverlays from "../components/GameOverOverlays";
import CatWorkingGrid from "../components/CatWorkingGrid";
import InventoryPanel from "../components/InventoryPanel";
import ServerRoomMap from "../components/ServerRoomMap";
import CollectionModal from "../components/CollectionModal";
import { GAME_LEVELS } from "../data/levels";
import { useAuth } from "../components/auth/hook/useAuth";
import { useRouter } from "next/navigation";
import { Sparkles, BookOpen, Cat, Package, Terminal, Users, LogOut, User } from "lucide-react";
import NumberFlow from '@number-flow/react';

// Random cats pool
const CAT_POOL = [
  { name: "Tabby Cat", rarity: "COMMON", type: "standard", spRate: 10 },
  { name: "Siamese Cat", rarity: "COMMON", type: "standard", spRate: 12 },
  { name: "Persian Cat", rarity: "RARE", type: "diamond", spRate: 16 },
  { name: "Sphynx Cat", rarity: "RARE", type: "diamond", spRate: 20 },
];

export default function DecryptionGame() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const userDropdownRef = useRef(null);

  // Click outside detection for user dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowFriendBonusTooltip(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  
  // Game states
  const [userCodes, setUserCodes] = useState({});
  const [levelStatus, setLevelStatus] = useState({});
  const [currentOutput, setCurrentOutput] = useState(["", "", "", "", "", ""]);
  const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'failed', 'completed'
  const [timeLeft, setTimeLeft] = useState(120); // 120s timer
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Custom Game Tab and SP Systems
  const [activeTab, setActiveTab] = useState("terminal"); // "terminal", "shop"
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [spPoints, setSpPoints] = useState(0);
  const [deployedCats, setDeployedCats] = useState([null, null, null, null, null, null]);
  const [accumulatedSp, setAccumulatedSp] = useState([0, 0, 0, 0, 0, 0]);
  const [inventory, setInventory] = useState([
    { name: "Normal Brainrot", rarity: "COMMON", type: "standard", spRate: 10, id: 999 },
    { name: "Golden Brainrot", rarity: "RARE", type: "standard", spRate: 20, id: 1000 },
    { name: "Diamond Brainrot", rarity: "RARE", type: "diamond", spRate: 50, id: 1001 },
    { name: "Lava Brainrot", rarity: "EPIC", type: "standard", spRate: 100, id: 1002 },
    { name: "Rainbow Brainrot", rarity: "LEGENDARY", type: "standard", spRate: 500, id: 1003 },
    { name: "Galaxy Brainrot", rarity: "MYTHIC", type: "standard", spRate: 1000, id: 1004 }
  ]);
  const [heldCat, setHeldCat] = useState(null);
  const [candyProgress, setCandyProgress] = useState(10); // 10% base progress
  const [serverTime, setServerTime] = useState(0.00);
  const [isDayShift, setIsDayShift] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [showFriendBonusTooltip, setShowFriendBonusTooltip] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [showRebirthModal, setShowRebirthModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Console state
  const [consoleHistory, setConsoleHistory] = useState([
    { type: "sys", text: "Code Decryptor Engine initialized." },
    { type: "sys", text: "Deploy cats on Server A to farm SP automatically." },
  ]);
  const [consoleInput, setConsoleInput] = useState("");

  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const activeTestCase = currentLevel?.testCases[activeTestCaseIdx];
  const cipherText = activeTestCase ? activeTestCase.input[0] : "";
  const formattedCipherText = typeof cipherText === "string" ? cipherText.split("").join(" - ") : "";
  const subText = activeTestCase ? `Parameters: ${activeTestCase.input.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(', ')}` : "X - Y";
  const editorRef = useRef(null);

  // Initialize level starter code
  useEffect(() => {
    const codes = {};
    const statuses = {};
    GAME_LEVELS.forEach((level) => {
      codes[level.id] = level.starterCode;
      statuses[level.id] = "idle";
    });
    setUserCodes(codes);
    setLevelStatus(statuses);
  }, []);

  // Timer countdown and Server Clock hook
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus("failed");
          setConsoleHistory((hist) => [
            ...hist,
            { type: "err", text: "🚨 SYSTEM LOCKED DOWN! Reboot required." }
          ]);
          return 0;
        }
        return prev - 1;
      });

      // Increment server uptime milliseconds
      setServerTime((prev) => parseFloat((prev + 0.1).toFixed(2)));
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus]);

  // Desk SP accumulation hook (adds SP directly to each desk slot every 1 second)
  useEffect(() => {
    const interval = setInterval(() => {
      const activeMultiplier = 1 + friendCount * 0.1;
      setAccumulatedSp((prev) =>
        prev.map((val, idx) => {
          const cat = deployedCats[idx];
          return cat ? val + Math.round(cat.spRate * activeMultiplier) : val;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [deployedCats, friendCount]);

  const activeCode = userCodes[currentLevel?.id] || "";

  const handleCodeChange = (e) => {
    setUserCodes({
      ...userCodes,
      [currentLevel.id]: e.target.value,
    });
  };

  const handleClearConsole = () => setConsoleHistory([]);

  // Select cat to hold
  const handleSelectCat = (invIdx) => {
    const catToHold = inventory[invIdx];
    const nextInv = [...inventory];
    
    if (heldCat) {
      // Swap held cat back to inventory
      nextInv[invIdx] = heldCat;
    } else {
      nextInv.splice(invIdx, 1);
    }
    
    setHeldCat(catToHold);
    setInventory(nextInv);
    setShowInventoryModal(false);

    setConsoleHistory((prev) => [
      ...prev,
      { type: "sys", text: `Holding ${catToHold.name}. Press 'E' near an empty desk to deploy.` }
    ]);
  };

  // Place held cat on a desk
  const handlePlaceCat = (slotIdx) => {
    if (!heldCat) return;

    const nextSlots = [...deployedCats];
    nextSlots[slotIdx] = heldCat;
    setDeployedCats(nextSlots);
    setHeldCat(null);

    setConsoleHistory((prev) => [
      ...prev,
      { type: "sys", text: `Deployed ${heldCat.name} to server slot ${slotIdx + 1}.` }
    ]);
  };

  // Recall working cat back to inventory
  const handleRecallCat = (slotIdx) => {
    const cat = deployedCats[slotIdx];
    if (!cat) return; // empty slot

    const nextSlots = [...deployedCats];
    nextSlots[slotIdx] = null;
    setDeployedCats(nextSlots);

    setInventory([...inventory, cat]);
    setConsoleHistory((prev) => [
      ...prev,
      { type: "sys", text: `Recalled ${cat.name} back to inventory.` }
    ]);
  };

  const handleUpgradeCat = (invIdx) => {
    const cat = inventory[invIdx];
    if (!cat) return;
    const level = cat.level || 1;
    const cost = level * 100;
    if (spPoints < cost) return;

    setSpPoints((prev) => prev - cost);
    setInventory((prev) => {
      const next = [...prev];
      next[invIdx] = {
        ...cat,
        level: level + 1,
        spRate: cat.spRate + 2,
      };
      return next;
    });

    setConsoleHistory((prev) => [
      ...prev,
      { type: "success", text: `Leveled up ${cat.name} to LV.${level + 1}! SP rate is now ${cat.spRate + 2} SP/s.` }
    ]);
  };

  const handleUpgradeDeployedCat = (slotIdx) => {
    const cat = deployedCats[slotIdx];
    if (!cat) return;
    const level = cat.level || 1;
    const cost = level * 100;
    if (spPoints < cost) return;

    setSpPoints((prev) => prev - cost);
    setDeployedCats((prev) => {
      const next = [...prev];
      next[slotIdx] = {
        ...cat,
        level: level + 1,
        spRate: cat.spRate + 2,
      };
      return next;
    });

    setConsoleHistory((prev) => [
      ...prev,
      { type: "success", text: `Leveled up deployed ${cat.name} to LV.${level + 1}! SP rate is now ${cat.spRate + 2} SP/s.` }
    ]);
  };

  const handleMoveSlot = (sourceIdx, targetIdx) => {
    setDeployedCats((prev) => {
      const next = [...prev];
      const temp = next[sourceIdx];
      next[sourceIdx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });

    setAccumulatedSp((prev) => {
      const next = [...prev];
      const temp = next[sourceIdx];
      next[sourceIdx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });

    setCurrentOutput((prev) => {
      const next = [...prev];
      const temp = next[sourceIdx];
      next[sourceIdx] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });

    setConsoleHistory((prev) => [
      ...prev,
      { type: "sys", text: `Moved desk slot ${sourceIdx + 1} to desk slot ${targetIdx + 1}.` }
    ]);
  };

  const runTestCases = () => {
    if (!currentLevel) return;
    setIsRunning(true);
    
    setConsoleHistory((prev) => [
      ...prev,
      { type: "cmd", text: `run getPassword() for Level ${currentLevel.id}` },
    ]);

    setTimeout(() => {
      const code = userCodes[currentLevel.id];
      let overallSuccess = true;
      let outputStr = "      ";

      try {
        const evalSandbox = new Function(
          `${code}; return ${currentLevel.functionName};`
        );
        const userFunc = evalSandbox();

        if (typeof userFunc !== "function") {
          throw new Error(`Function '${currentLevel.functionName}' is not defined.`);
        }

        const primaryTestCase = currentLevel.testCases[0];
        const testCaseInput = primaryTestCase ? primaryTestCase.input : [];
        const resultOutput = userFunc(...testCaseInput);
        
        if (typeof resultOutput === "string") {
          outputStr = resultOutput.padEnd(6, " ").substring(0, 6);
        } else if (resultOutput !== undefined) {
          outputStr = String(resultOutput).padEnd(6, " ").substring(0, 6);
        }

        // Run all test cases for verification
        currentLevel.testCases.forEach((tc) => {
          const inputClone = JSON.parse(JSON.stringify(tc.input));
          const output = userFunc(...inputClone);
          const passed = typeof output === "string" && /^\d{6}$/.test(output) && output === tc.expected;
          if (!passed) overallSuccess = false;
        });

      } catch (err) {
        overallSuccess = false;
        setConsoleHistory((prev) => [
          ...prev,
          { type: "err", text: `Compilation Error: ${err.message}` },
        ]);
        setIsRunning(false);
        setLevelStatus({ ...levelStatus, [currentLevel.id]: "fail" });
        setCurrentOutput(["E", "R", "R", "O", "R", "!"]);
        return;
      }

      // Update 6 password blocks display
      setCurrentOutput(outputStr.split(""));

      const newHistoryLogs = [];
      if (overallSuccess) {
        // Roll a random cat reward
        const rolledCat = { ...CAT_POOL[Math.floor(Math.random() * CAT_POOL.length)], id: Date.now() };
        
        newHistoryLogs.push({
          type: "success",
          text: `Level ${currentLevel.id} decrypted! Password: ${outputStr}`,
        });
        newHistoryLogs.push({
          type: "sys",
          text: `🎁 Rewards: Obtained Cat [${rolledCat.rarity}] ${rolledCat.name}! (+${rolledCat.spRate} SP/s)`,
        });

        const updatedStatus = { ...levelStatus, [currentLevel.id]: "pass" };
        setLevelStatus(updatedStatus);
        setInventory((prev) => [...prev, rolledCat]);
        setSpPoints((prev) => prev + 100);
        setCandyProgress((prev) => Math.min(prev + 15, 100)); // increment progress

        // Cycle to the next word and return to PLAY button screen
        setTimeout(() => {
          setIsGameActive(false);
          setGameStatus("idle");
          setCurrentOutput(["", "", "", "", "", ""]);
        }, 2000);
      } else {
        newHistoryLogs.push({
          type: "err",
          text: `Level ${currentLevel.id} verification failed.`,
        });
        setLevelStatus({ ...levelStatus, [currentLevel.id]: "fail" });
      }

      setConsoleHistory((prev) => [...prev, ...newHistoryLogs]);
      setIsRunning(false);
    }, 600);
  };

  const resetGame = () => {
    const codes = {};
    const statuses = {};
    GAME_LEVELS.forEach((level) => {
      codes[level.id] = level.starterCode;
      statuses[level.id] = "idle";
    });
    setUserCodes(codes);
    setLevelStatus(statuses);
    setCurrentLevelIdx(0);
    setTimeLeft(120);
    setGameStatus("idle");
    setIsGameActive(false);
    setCurrentOutput(["", "", "", "", "", ""]);
    setDeployedCats([null, null, null, null, null, null]);
    setAccumulatedSp([0, 0, 0, 0, 0, 0]);
    setInventory([{ name: "Tabby Cat", rarity: "COMMON", type: "standard", spRate: 10, id: 999 }]);
    setSpPoints(0);
    setCandyProgress(10);
    setServerTime(0);
    setConsoleHistory([
      { type: "sys", text: "System rebooted. Farm SP and decrypt passcodes." }
    ]);
  };

  const handleStartPlay = () => {
    if (!currentLevel) return;
    const randomIdx = Math.floor(Math.random() * currentLevel.testCases.length);
    setActiveTestCaseIdx(randomIdx);
    setCurrentOutput(["", "", "", "", "", ""]);
    setTimeLeft(120);
    setGameStatus("playing");
    setIsGameActive(true);
    setConsoleHistory((prev) => [
      ...prev,
      { type: "sys", text: `🎮 Decryption started! Target cipher: ${currentLevel.testCases[randomIdx].input[0]}` }
    ]);
  };

  const handleHarvestSP = (slotIdx, amount) => {
    setSpPoints((prev) => prev + amount);
    setAccumulatedSp((prev) => {
      const next = [...prev];
      next[slotIdx] = 0;
      return next;
    });
    setConsoleHistory((prev) => [
      ...prev,
      { type: "success", text: `Harvested +${amount} SP from Desk ${slotIdx + 1}!` }
    ]);
  };

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.trim().toLowerCase();
    const newHistory = [...consoleHistory, { type: "cmd", text: consoleInput }];

    if (cmd === "help") {
      newHistory.push({ type: "sys", text: "Commands: run, clear, reset" });
    } else if (cmd === "run") {
      setConsoleHistory(newHistory);
      setConsoleInput("");
      runTestCases();
      return;
    } else if (cmd === "clear") {
      setConsoleHistory([]);
      setConsoleInput("");
      return;
    } else if (cmd === "reset") {
      setConsoleHistory(newHistory);
      setConsoleInput("");
      resetGame();
      return;
    } else {
      newHistory.push({ type: "err", text: `command not found: ${cmd}` });
    }

    setConsoleHistory(newHistory);
    setConsoleInput("");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative w-screen h-screen bg-[#141517] text-slate-100 font-sans overflow-hidden select-none">
      {activeTab === "terminal" ? (
        <div className="w-full h-full flex flex-col bg-[#1e1e1e] z-50 relative">
          {/* Header for Full Screen Mode */}
          <div className="flex items-center justify-between p-4 bg-[#252526] border-b border-[#333] shadow-lg z-50">
            <button
              onClick={() => setActiveTab("inventory")}
              className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-white font-mono text-sm shadow-md transition-colors"
            >
              ← Back to Server Room
            </button>
            <div className="text-emerald-400 font-mono font-bold tracking-widest text-lg">
              DECRYPTION TERMINAL - {currentLevel?.title || "LEVEL"}
            </div>
            <div className={`text-[12px] font-black px-4 py-2 rounded-lg border ${
              timeLeft < 30 ? "text-rose-400 border-rose-450/20 bg-rose-500/10 animate-pulse" : "text-amber-400 border-amber-400/10 bg-black/45"
            }`}>
              ⏱ LOCKDOWN: {formatTime(timeLeft)}
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative bg-[#141517] p-8 flex flex-col items-center gap-6">
            
            <div className="flex flex-col items-center gap-4 w-full max-w-xl pt-4">
              {/* Dashboard from Server Map */}
              <div className="w-full bg-[#17181a]/90 backdrop-blur-md border border-zinc-800 rounded-lg p-3 flex flex-col items-center gap-3 shadow-2xl">
                <div className="flex items-center justify-between w-full font-mono text-xs text-zinc-500 border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>SERVER A</span>
                  </div>
                  <div className="text-amber-500 font-bold">{serverTime} s</div>
                  <div>
                    Score: <span className="text-emerald-400 font-black">{spPoints} SP</span>
                  </div>
                </div>

                <div className="w-full font-mono text-[10px] space-y-1.5">
                  <div className="flex justify-between text-zinc-500">
                    <span>CANDY RATIO</span>
                    <span>10% ⇒ {candyProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-500" 
                      style={{ width: `${candyProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Target Cipher Key */}
              <div className="w-3/4 text-center font-mono select-none bg-black/85 border-2 border-emerald-500/30 rounded-lg px-8 py-4 shadow-[0_0_15px_rgba(16,185,129,0.15)] flex flex-col items-center gap-2">
                <span className="text-[10px] text-emerald-500/60 font-bold tracking-widest uppercase">
                  📡 TARGET CIPHER KEY
                </span>
                <div className="text-3xl font-black tracking-[0.2em] text-emerald-400 drop-shadow-[0_0_6px_#34d399] animate-pulse">
                  {formattedCipherText || "???"}
                </div>
                <div className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-1">
                  {subText}
                </div>
              </div>
            </div>

            <div className="w-full max-w-4xl flex-1 min-h-0">
               <CodeEditor
                 code={activeCode}
                 onCodeChange={handleCodeChange}
                 onRun={runTestCases}
                 isRunning={isRunning}
                 editorRef={editorRef}
                 onClose={() => setActiveTab("inventory")}
                 isFullScreen={true}
               />
            </div>
          </div>
        </div>
      ) : (
      <>
      
      {/* 1. Fullscreen Server Room Map (Background z-0) */}
      <ServerRoomMap
        deployedCats={deployedCats}
        accumulatedSp={accumulatedSp}
        spPoints={spPoints}
        isDayShift={isDayShift}
        onHarvestSP={handleHarvestSP}
        onUpgradeSlot={handleUpgradeDeployedCat}
        onMoveSlot={handleMoveSlot}
        onPlaceCat={handlePlaceCat}
        onSlotClick={handleRecallCat}
        cipherText={formattedCipherText}
        subText={subText}
        heldCat={heldCat}
      />

      {/* 2.5. Floating Top-Right User & Utility Panel (z-40) */}
      <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-3 font-mono text-xs select-none">
        
        {/* Horizontal Row: Skip Tutorial, Coin display, Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Map Editor Button */}
          <Link
            href="/map-editor"
            className="px-3.5 py-1.5 bg-[#17181a]/95 text-slate-200 hover:text-white border border-zinc-800 hover:border-zinc-500 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="text-[12px]">🛠</span> Map Editor
          </Link>

          {/* Settings Button */}
          <button 
            onClick={() => {
              setConsoleHistory((prev) => [
                ...prev,
                { type: "sys", text: "Settings menu opened (Work in progress...)" }
              ]);
            }}
            className="px-3.5 py-1.5 bg-[#17181a]/95 text-slate-200 hover:text-white border border-zinc-800 hover:border-zinc-500 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1"
          >
            <span className="text-[12px]">⚙️</span> Settings
          </button>

          {/* Skip Tutorial Button */}
          <button 
            onClick={() => {
              setConsoleHistory((prev) => [
                ...prev,
                { type: "sys", text: "Tutorial skipped. Welcome to sandbox mode!" }
              ]);
            }}
            className="px-3.5 py-1.5 bg-[#17181a]/95 text-slate-200 hover:text-white border border-zinc-800 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all"
          >
            Skip Tutorial
          </button>

          {/* SP Coin Counter Display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 border border-yellow-500/30 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.1)]">
            <span className="text-[14px]">🪙</span>
            <span className="text-yellow-400 font-black text-[11px] min-w-[20px] text-center inline-block">
              <NumberFlow value={spPoints} />
            </span>
          </div>

          {/* User Profile Avatar Bubble / Login Button */}
          {!isAuthenticated ? (
            <Link 
              href="/auth/sign-in"
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-700 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center gap-1"
            >
              🔑 Log In
            </Link>
          ) : (
            <div 
              ref={userDropdownRef}
              className="relative cursor-pointer"
              onClick={() => setShowFriendBonusTooltip(prev => !prev)}
            >
              {/* Round Avatar Bubble */}
              <div className="w-11 h-11 rounded-full bg-blue-500/20 border-2 border-blue-400/80 flex items-center justify-center shadow-[0_0_12px_rgba(96,165,250,0.3)] overflow-hidden transition-all hover:scale-105 p-0.5">
                <img src="/mc-00.png" alt="User Avatar" className="w-full h-full object-cover rounded-full" />
              </div>

              {/* Friend Bonus & Session Tooltip Card */}
              {(showFriendBonusTooltip || friendCount > 0) && (
                <div className="absolute right-0 top-12 w-64 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.55)] flex flex-col gap-3.5 transition-all z-50">
                  {/* User Profile Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/35 flex items-center justify-center text-blue-400">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        Active Profile
                      </div>
                      <div className="text-xs font-semibold text-zinc-200 truncate">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-zinc-800/60" />

                  {/* Village Booster Status */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      Village Booster
                    </div>
                    
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        +{friendCount * 10}%
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">Friend Bonus</span>
                    </div>

                    <p className="text-[9px] text-zinc-450 leading-normal">
                      Earn +10% SP generation speed per active friend on the server. Invite friends to boost!
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-zinc-800/60">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (friendCount < 10) {
                            setFriendCount(prev => prev + 1);
                            setConsoleHistory(hist => [...hist, { type: "success", text: `Invited a friend! Booster multiplier increased to +${(friendCount + 1) * 10}%!` }]);
                          }
                        }}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider shadow-md shadow-blue-500/10 active:scale-[0.97] transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        ➕ Invite Friend
                      </button>
                      {friendCount > 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setFriendCount(0);
                            setConsoleHistory(hist => [...hist, { type: "sys", text: "Reset friend booster bonus back to 0%." }]);
                          }}
                          className="px-3 py-2 bg-zinc-850 hover:bg-zinc-800 text-zinc-400 rounded-xl text-[9px] font-bold transition-all active:scale-[0.97] cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        logout();
                      }}
                      className="w-full py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border border-rose-500/20 hover:border-transparent active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer mt-0.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vertical Stack: Sun light mode and Headphones Pink Bot buttons below the avatar */}
        <div className="flex flex-col gap-2 mt-1 mr-1">


          {/* REBIRTH Button */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <button
              onClick={() => setShowRebirthModal(true)}
              className="relative w-12 h-12 bg-blue-500 hover:bg-blue-400 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-blue-600 overflow-hidden group"
              title="Rebirth (Level Up Main Character)"
            >
              <img src="/rebirth.png" alt="Rebirth" className="w-full h-full object-cover rounded-lg" />
            </button>
            {/* Progress Bar */}
            <div className="w-10 h-2 bg-zinc-700 rounded-full overflow-hidden border border-zinc-800">
              <div 
                className="h-full bg-lime-500 transition-all duration-500"
                style={{ width: `${Math.min(100, (spPoints / (playerLevel * 1000)) * 100)}%` }}
              />
            </div>
            <div className="text-[7px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">
              LV {playerLevel}
            </div>
          </div>

          {/* Index Button */}
          <button
            onClick={() => setShowCollectionModal(true)}
            className="w-12 h-12 mx-auto bg-[#4fb5ff] hover:bg-[#3ca4ee] rounded-xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-[#3ca4ee] mt-1 relative"
            title="Collection Index"
          >
            <BookOpen className="w-5 h-5 text-white drop-shadow-md" />
          </button>

          {/* Cats Button */}
          <button
            onClick={() => setShowInventoryModal(true)}
            className="w-12 h-12 mx-auto bg-rose-600 hover:bg-rose-500 rounded-xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-rose-700 mt-1 relative"
            title="Cats Inventory"
          >
            <Cat className="w-5 h-5 text-white drop-shadow-md" />
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
              {inventory.length}
            </span>
          </button>

          {/* Shop Button */}
          <button
            onClick={() => setActiveTab("shop")}
            className="w-12 h-12 mx-auto bg-blue-600 hover:bg-blue-500 rounded-xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-blue-700 mt-1 relative"
            title="Shop"
          >
            <Package className="w-5 h-5 text-white drop-shadow-md" />
          </button>

          {/* Decrypt Button */}
          <button
            onClick={() => {
              setActiveTab("terminal");
              if (!isGameActive) handleStartPlay();
            }}
            className="w-12 h-12 mx-auto bg-emerald-600 hover:bg-emerald-500 rounded-xl flex flex-col items-center justify-center shadow-lg active:scale-95 transition-all border-2 border-emerald-700 mt-1 relative"
            title="Decrypt (Play)"
          >
            <Terminal className="w-5 h-5 text-white drop-shadow-md" />
          </button>
        </div>

      </div>



      {/* 4. Bottom Custom Retro Leather Toolbar (z-20) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-20 w-[600px] h-24 bg-[#5c4033] border-t-4 border-x-4 border-[#3e2723] rounded-t-2xl px-6 py-3 flex items-center justify-between gap-4 shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        {/* Center: Active Mode Box */}
        <div className="flex-1 h-full flex items-center justify-center overflow-hidden">
          {activeTab === "terminal" ? (
            isGameActive ? (
              <div className="flex flex-col items-center justify-center font-mono">
                <div className={`text-[10px] font-black px-3 py-1 rounded bg-black/45 border ${
                  timeLeft < 30 ? "text-rose-400 border-rose-450/20 animate-pulse" : "text-amber-400 border-amber-400/10"
                }`}>
                  ⏱ LOCKDOWN: {formatTime(timeLeft)}
                </div>
                <span className="text-[9px] text-[#bcaaa4] mt-1">Code editor active on bottom-left</span>
              </div>
            ) : (
              <button
                onClick={handleStartPlay}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-black text-xs rounded active:scale-95 transition-all tracking-[0.15em]"
              >
                START DECRYPTION
              </button>
            )
          ) : activeTab === "shop" ? (
            <div className="text-[10px] font-mono text-[#bcaaa4] uppercase tracking-wider text-center">
              🛒 SP Shop Closed. Collect more SP points to buy upgrades!
            </div>
          ) : null}
        </div>

      </div>

      {/* 4. Floating Console Output (z-40) */}
      {isConsoleOpen ? (
        <FloatingConsole
          history={consoleHistory}
          onClear={handleClearConsole}
          onClose={() => setIsConsoleOpen(false)}
          input={consoleInput}
          onInputChange={setConsoleInput}
          onSubmitCommand={handleConsoleSubmit}
          accentColor="text-emerald-400"
        />
      ) : (
        <button
          onClick={() => setIsConsoleOpen(true)}
          className="fixed bottom-6 right-6 z-30 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-lg shadow-xl text-[10px] font-mono text-emerald-400 font-bold active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Show Logs</span>
        </button>
      )}

      </>
      )}

      {/* 6. GameOverOverlays (z-50) */}
      <GameOverOverlays
        gameStatus={gameStatus}
        onReset={resetGame}
      />

      {/* 7. Rebirth Modal (z-50) */}
      {showRebirthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#17181a] border-2 border-blue-500 rounded-2xl p-6 shadow-[0_0_40px_rgba(59,130,246,0.3)] w-80 font-mono flex flex-col items-center text-center">
            <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">
              Rebirth
            </h2>
            <div className="w-16 h-16 bg-blue-500/20 border-2 border-blue-400 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            
            <p className="text-xs text-zinc-400 mb-4">
              Pay SP to level up your Main Character.
            </p>

            <div className="flex items-center gap-4 mb-6 bg-black/50 px-4 py-2 rounded-lg border border-zinc-800">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-zinc-500 uppercase">Current</span>
                <span className="text-xl font-black text-zinc-300">LV {playerLevel}</span>
              </div>
              <span className="text-zinc-600">➡️</span>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-400 uppercase">Next</span>
                <span className="text-xl font-black text-blue-400 animate-pulse">LV {playerLevel + 1}</span>
              </div>
            </div>

            <div className="text-sm font-bold text-yellow-400 mb-6 flex items-center gap-2">
              Cost: {playerLevel * 1000} SP 
              <span className="text-[16px]">🪙</span>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={() => setShowRebirthModal(false)}
                className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-lg transition-colors text-sm uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const cost = playerLevel * 1000;
                  if (spPoints >= cost) {
                    setSpPoints(prev => prev - cost);
                    setPlayerLevel(prev => prev + 1);
                    setShowRebirthModal(false);
                    setConsoleHistory(hist => [...hist, { type: "success", text: `🌟 REBIRTH SUCCESS! Leveled up to LV ${playerLevel + 1}!` }]);
                  } else {
                    setConsoleHistory(hist => [...hist, { type: "err", text: "❌ Not enough SP for Rebirth!" }]);
                    setShowRebirthModal(false);
                  }
                }}
                disabled={spPoints < playerLevel * 1000}
                className={`flex-1 py-2 font-black rounded-lg transition-all text-sm uppercase ${
                  spPoints >= playerLevel * 1000
                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] active:scale-95"
                    : "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                }`}
              >
                Level Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Collection Index Modal */}
      {showCollectionModal && (
        <CollectionModal onClose={() => setShowCollectionModal(false)} />
      )}

      {/* 6. Inventory Modal (z-50) */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1b1e] border-2 border-zinc-700 rounded-2xl w-full max-w-4xl p-6 relative shadow-[0_0_40px_rgba(0,0,0,0.8)]">
            {/* Close Button */}
            <button
              onClick={() => setShowInventoryModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 border border-zinc-600 text-zinc-400 hover:text-white hover:bg-rose-500 hover:border-rose-500 transition-colors z-10"
            >
              ✕
            </button>
            
            <h2 className="text-xl font-black font-mono text-white mb-4 flex items-center gap-2">
              <span className="text-2xl drop-shadow-md">🎒</span> INVENTORY
            </h2>

            <InventoryPanel
              inventory={inventory}
              spPoints={spPoints}
              onSelectCat={handleSelectCat}
              onUpgradeCat={handleUpgradeCat}
            />
          </div>
        </div>
      )}
    </main>
  );
}
