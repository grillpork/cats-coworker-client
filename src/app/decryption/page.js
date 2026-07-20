"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../components/auth/hook/useAuth";
import { catsService } from "../../services/cats.service";
import { authServices } from "../../services/auth.service";
import { GAME_LEVELS } from "../../data/levels";
import CodeEditor from "../../components/CodeEditor";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function DecryptionPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [userCodes, setUserCodes] = useState({});
  const [levelStatus, setLevelStatus] = useState({});
  const [currentOutput, setCurrentOutput] = useState(["", "", "", "", "", ""]);
  const [gameStatus, setGameStatus] = useState("idle"); // 'idle', 'playing', 'failed', 'completed'
  const [timeLeft, setTimeLeft] = useState(60); // 60s timer
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [spPoints, setSpPoints] = useState(0);
  const [catPool, setCatPool] = useState([]);
  const [candyProgress, setCandyProgress] = useState(10); // 10% base progress
  const [serverTime, setServerTime] = useState(0.00);
  const [hasInitializedSp, setHasInitializedSp] = useState(false);
  const [gameResult, setGameResult] = useState(null); // { status: 'success' | 'fail', cat?: any, error?: string }

  const currentLevel = GAME_LEVELS[currentLevelIdx];
  const activeTestCase = currentLevel?.testCases[activeTestCaseIdx];
  const cipherText = activeTestCase ? activeTestCase.input[0] : "";
  const formattedCipherText = typeof cipherText === "string" ? cipherText.split("").join(" - ") : "";
  const subText = activeTestCase ? `พารามิเตอร์นำเข้า: ${activeTestCase.input.map(x => typeof x === 'object' ? JSON.stringify(x) : x).join(', ')}` : "X - Y";
  const editorRef = useRef(null);

  const activeCode = userCodes[currentLevel?.id] || "";

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && user === null) {
      router.push("/auth/sign-in");
    }
  }, [isAuthenticated, user, router]);

  // Load SP from user profile
  useEffect(() => {
    if (isAuthenticated && user && user.sp !== undefined && !hasInitializedSp) {
      setSpPoints(user.sp);
      setHasInitializedSp(true);
    }
  }, [user, isAuthenticated, hasInitializedSp]);

  // Load cat pool
  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await catsService.getAll();
        const cats = res?.data || res || [];
        setCatPool(cats);
      } catch (error) {
        console.error("Failed to load cats:", error);
      }
    };
    loadCats();
  }, []);

  // Debounced Auto-save SP
  useEffect(() => {
    if (!isAuthenticated || !hasInitializedSp) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        await authServices.updateSp(spPoints);
      } catch (err) {
        console.error("Failed to auto-save SP:", err);
      }
    }, 2000);

    return () => clearTimeout(delayDebounceFn);
  }, [spPoints, isAuthenticated, hasInitializedSp]);

  // Poll SP
  useEffect(() => {
    if (!isAuthenticated || !hasInitializedSp) return;

    const interval = setInterval(async () => {
      try {
        const res = await authServices.getSp();
        const serverSp = res?.data?.sp !== undefined ? res.data.sp : res?.sp;
        if (serverSp !== undefined && serverSp !== spPoints) {
          setSpPoints(serverSp);
        }
      } catch (err) {
        console.error("Failed to poll SP:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, hasInitializedSp, spPoints]);

  // Initialize codes
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

  // Timer countdown
  useEffect(() => {
    if (gameStatus !== "playing") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameStatus("failed");
          return 0;
        }
        return prev - 1;
      });
      setServerTime((prev) => parseFloat((prev + 0.1).toFixed(2)));
    }, 100);

    return () => clearInterval(timer);
  }, [gameStatus]);

  const handleCodeChange = (e) => {
    const nextVal = e.target.value;
    setUserCodes((prev) => ({
      ...prev,
      [currentLevel.id]: nextVal,
    }));
  };

  const handleStartPlay = () => {
    if (!currentLevel) return;
    const randomIdx = Math.floor(Math.random() * currentLevel.testCases.length);
    setActiveTestCaseIdx(randomIdx);
    setCurrentOutput(["", "", "", "", "", ""]);
    setTimeLeft(60);
    setGameStatus("playing");
    setIsGameActive(true);
  };

  const runTestCases = () => {
    if (!currentLevel) return;
    setIsRunning(true);

    setTimeout(() => {
      const userCode = userCodes[currentLevel.id] || "";
      let overallSuccess = true;
      let outputStr = "ERROR!";

      const evalSandbox = () => {
        try {
          const fnString = `${userCode}; ${currentLevel.functionName};`;
          return eval(fnString);
        } catch (e) {
          return null;
        }
      };

      try {
        const userFunc = evalSandbox();
        if (typeof userFunc !== "function") {
          throw new Error(`ฟังก์ชัน '${currentLevel.functionName}' ไม่ถูกสร้างไว้`);
        }

        const primaryTestCase = currentLevel.testCases[0];
        const resultOutput = userFunc(...(primaryTestCase ? primaryTestCase.input : []));
        
        if (typeof resultOutput === "string") {
          outputStr = resultOutput.padEnd(6, " ").substring(0, 6);
        } else if (resultOutput !== undefined) {
          outputStr = String(resultOutput).padEnd(6, " ").substring(0, 6);
        }

        currentLevel.testCases.forEach((tc) => {
          const inputClone = JSON.parse(JSON.stringify(tc.input));
          const output = userFunc(...inputClone);
          const passed = typeof output === "string" && output === tc.expected;
          if (!passed) overallSuccess = false;
        });

      } catch (err) {
        overallSuccess = false;
        setIsRunning(false);
        setLevelStatus({ ...levelStatus, [currentLevel.id]: "fail" });
        setCurrentOutput(["E", "R", "R", "O", "R", "!"]);
        setGameResult({
          status: "fail",
          error: `เกิดข้อผิดพลาดในการรัน: ${err.message}`,
        });
        return;
      }

      setCurrentOutput(outputStr.split(""));

      if (overallSuccess) {
        let rolledCat = null;
        if (catPool.length > 0) {
          const rawCat = catPool[Math.floor(Math.random() * catPool.length)];
          rolledCat = { ...rawCat, id: Date.now() };

          // Save to DB
          if (isAuthenticated) {
            catsService.addCatToInventory(rawCat.id).catch((err) => {
              console.error("Failed to save rolled cat to inventory DB:", err);
            });
          }
        }
        
        setSpPoints((prev) => prev + 100);
        setCandyProgress((prev) => Math.min(prev + 15, 100));

        setGameResult({
          status: "success",
          cat: rolledCat,
          sp: 100,
        });
      } else {
        setLevelStatus({ ...levelStatus, [currentLevel.id]: "fail" });
        setGameResult({
          status: "fail",
          error: "ฟังก์ชันคืนค่าผลลัพธ์ไม่ตรงตามเงื่อนไขทดสอบ กรุณาตรวจสอบผลลัพธ์การรันอีกครั้ง",
        });
      }

      setIsRunning(false);
    }, 600);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative w-screen h-screen bg-[#101114] text-slate-100 font-sans overflow-hidden select-none">
      <div className="w-full h-full flex flex-col bg-[#141517] z-50 relative">
        {/* Header for Full Screen Mode */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#101114] border-b border-zinc-900 shadow-xl z-50">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg text-zinc-300 hover:text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            ← กลับไปห้องเซิร์ฟเวอร์
          </button>
          <div className="text-rose-500 font-black tracking-widest text-base">
            💻 เทอร์มินัลถอดรหัส - {currentLevel?.title || "ระดับปัจจุบัน"}
          </div>
          <div className={`text-xs font-black px-4 py-2 rounded-lg border tracking-wider ${
            timeLeft < 10 ? "text-red-400 border-red-500/20 bg-red-500/10 animate-pulse" : "text-amber-400 border-zinc-800 bg-zinc-900/50"
          }`}>
            ⏱️ ล็อกดาวน์ใน: {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative bg-[#141517] p-8 flex flex-col items-center gap-6">
          
          <div className="flex flex-col items-center gap-4 w-full max-w-xl">
            {/* Dashboard from Server Map */}
            <div className="w-full bg-[#101114]/80 backdrop-blur-md border border-zinc-900 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-2xl">
              <div className="flex items-center justify-between w-full font-mono text-[11px] text-zinc-400 border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-bold tracking-wider">เซิร์ฟเวอร์ A</span>
                </div>
                <div className="text-zinc-500">เวลาทำงาน: <span className="text-amber-500 font-bold font-mono">{serverTime} วินาที</span></div>
                <div>
                  แต้มสะสม: <span className="text-emerald-400 font-black font-mono">{spPoints} SP</span>
                </div>
              </div>

              <div className="w-full font-sans text-xs space-y-2">
                <div className="flex justify-between text-zinc-500 font-bold text-[10px] uppercase tracking-wider">
                  <span>ความก้าวหน้าการผลิตลูกอม</span>
                  <span className="text-zinc-300 font-mono">10% ⇒ {candyProgress}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800/50">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500" 
                    style={{ width: `${candyProgress}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Target Cipher Key */}
            <div className="w-full text-center select-none bg-[#101114]/90 border border-zinc-900 rounded-2xl px-8 py-5 shadow-2xl flex flex-col items-center gap-2">
              <span className="text-[10px] text-rose-500 font-black tracking-widest uppercase bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                📡 รหัสผ่านเป้าหมาย
              </span>
              <div className="text-4xl font-black tracking-[0.2em] text-zinc-100 drop-shadow-[0_0_10px_rgba(255,255,255,0.05)] py-2 font-mono">
                {formattedCipherText || "???"}
              </div>
              <div className="text-[11px] text-zinc-400 font-medium tracking-wide bg-zinc-900/60 border border-zinc-850 px-3 py-1 rounded-lg">
                {subText}
              </div>
            </div>

            {/* Play Button if Idle */}
            {gameStatus === "idle" && (
              <button
                onClick={handleStartPlay}
                className="px-8 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl text-sm transition-all active:scale-95 shadow-xl"
              >
                เริ่มถอดรหัสผ่าน 🔑
              </button>
            )}
          </div>

          {gameStatus !== "idle" && (
            <div className="w-full max-w-4xl flex-1 min-h-0">
               <CodeEditor
                 code={activeCode}
                 onCodeChange={handleCodeChange}
                 onRun={runTestCases}
                 isRunning={isRunning}
                 editorRef={editorRef}
                 description={currentLevel?.description}
                 onClose={() => router.push("/")}
                 isFullScreen={true}
               />
            </div>
          )}
        </div>
      </div>

      {/* Game Result Modal Popup */}
      {gameResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`max-w-sm w-full bg-[#101114] border ${gameResult.status === 'success' ? 'border-emerald-500/20' : 'border-red-500/20'} rounded-3xl p-6 relative flex flex-col gap-4 font-sans shadow-2xl text-center`}>
            
            {gameResult.status === 'success' ? (
              <>
                <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-1">
                  <CheckCircle2 className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h2 className="text-lg font-black tracking-wider text-emerald-400 uppercase">
                  ถอดรหัสผ่านสำเร็จ! 🎉
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  ยินดีด้วย! คุณสามารถถอดรหัสผ่านเซิร์ฟเวอร์ระบบสำเร็จและยับยั้งภัยคุกคามได้!
                </p>

                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 my-1 text-left space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">รางวัลที่ได้รับ:</span>
                    <span className="text-emerald-400 font-bold font-mono">+{gameResult.sp} SP</span>
                  </div>

                  {gameResult.cat && (
                    <div className="flex items-center gap-3 bg-[#141517] p-2.5 rounded-xl border border-zinc-900">
                      <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 overflow-hidden relative">
                        {gameResult.cat.image ? (
                          <img src={gameResult.cat.image} alt={gameResult.cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg">🐱</span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{gameResult.cat.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          ระดับ: <span className="font-bold text-rose-500">{gameResult.cat.rarity}</span> | +{gameResult.cat.spRate} SP/วินาที
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setIsGameActive(false);
                    setGameStatus("idle");
                    setCurrentOutput(["", "", "", "", "", ""]);
                    setGameResult(null);
                    router.push("/");
                  }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-[#101114] font-black rounded-xl text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  ดำเนินการต่อ
                </button>
              </>
            ) : (
              <>
                <div className="mx-auto w-14 h-14 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-1">
                  <AlertCircle className="w-7 h-7 stroke-[1.5]" />
                </div>
                <h2 className="text-lg font-black tracking-wider text-red-500 uppercase">
                  ถอดรหัสผ่านล้มเหลว! ❌
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  ระบบตรวจพบผลลัพธ์ของฟังก์ชันไม่ถูกต้องตามชุดทดสอบ
                </p>
                <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 my-1 text-xs text-red-400 leading-relaxed text-center font-mono">
                  {gameResult.error}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => {
                      setIsGameActive(false);
                      setGameStatus("idle");
                      setCurrentOutput(["", "", "", "", "", ""]);
                      setGameResult(null);
                      router.push("/");
                    }}
                    className="flex-1 py-3 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-xl text-[10px] font-bold text-zinc-400"
                  >
                    กลับห้องเซิร์ฟเวอร์
                  </button>
                  <button
                    onClick={() => setGameResult(null)}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-[10px] transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </main>
  );
}
