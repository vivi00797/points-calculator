import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, ChevronDown, Check, RefreshCw, Coins, Target, Activity } from "lucide-react";
import { providers, type LLMModel, type ModelProvider } from "./data/models";
import { cn } from "./lib/utils";

function App() {
  const [providersData, setProvidersData] = useState<ModelProvider[]>(providers);
  const [search, setSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<LLMModel | null>(null);
  const modelSelectAnchorRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ left: 0, top: 0, width: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  const [calcMode, setCalcMode] = useState<'tokens' | 'amount'>('tokens');
  const [inputAmount, setInputAmount] = useState<string>("");
  const [ratioIn, setRatioIn] = useState<string>("2");
  const [ratioOut, setRatioOut] = useState<string>("1");

  const [inputTokens, setInputTokens] = useState<string>("");
  const [outputTokens, setOutputTokens] = useState<string>("");
  const [inputPrice, setInputPrice] = useState<string>("");
  const [outputPrice, setOutputPrice] = useState<string>("");
  const [lossRate, setLossRate] = useState<string>("1.2");
  const [profitMargin, setProfitMargin] = useState<string>("1.5");
  const [pointCoefficient, setPointCoefficient] = useState<string>("0.02");

  const filteredProviders = useMemo(() => {
    if (!search) return providersData;
    const lowerSearch = search.toLowerCase();
    return providersData.map(provider => ({
      ...provider,
      models: provider.models.filter((m: LLMModel) => m.name.toLowerCase().includes(lowerSearch))
    })).filter(provider => provider.models.length > 0);
  }, [search, providersData]);

  const handleSelectModel = (model: LLMModel) => {
    setSelectedModel(model);
    setInputPrice(model.inputPrice.toString());
    setOutputPrice(model.outputPrice.toString());
    setIsDropdownOpen(false);
    setSearch("");
  };

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? "http://localhost:3001/api/prices/update" : "https://points-calculator-api.onrender.com/api/prices/update";
      
      const res = await fetch(apiUrl, { 
        method: "POST",
        cache: "no-store" 
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      
      if (data && data.data && Array.isArray(data.data)) {
        const grouped: Record<string, LLMModel[]> = {
          alibaba: [],
          volcengine: [],
          deepseek: []
        };

        data.data.forEach((item: any) => {
          if (item.provider && grouped[item.provider]) {
            // Check if model already exists in the provider's array to prevent duplicates
            if (!grouped[item.provider].some(m => m.id === item.id)) {
              grouped[item.provider].push({
                id: item.id,
                name: item.name,
                inputPrice: item.inputPrice,
                outputPrice: item.outputPrice
              });
            }
          }
        });

        setProvidersData(() => {
          return providers.map(provider => {
            // Start fresh from the original fallbacks defined in models.ts
            const existingModels = [...provider.models];
            const liveModels = grouped[provider.id] || [];
            
            liveModels.forEach(liveModel => {
              const existingIndex = existingModels.findIndex(m => m.id === liveModel.id);
              if (existingIndex >= 0) {
                existingModels[existingIndex] = liveModel; // Update price if already exists
              } else {
                existingModels.push(liveModel); // Add if it's a new model
              }
            });

            if (existingModels.length > 0) {
              // Sort models to ensure consistent order
              existingModels.sort((a, b) => a.name.localeCompare(b.name));
              return { ...provider, models: existingModels };
            }
            return provider;
          });
        });
      }
    } catch (err) {
      console.warn('Failed to update prices:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    // Use local dev server if running on localhost, otherwise use production API
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocalhost ? "http://localhost:3001/api/prices" : "https://points-calculator-api.onrender.com/api/prices";

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const load = async () => {
      for (let attempt = 0; attempt < 6; attempt++) {
        try {
          const res = await fetch(apiUrl, { cache: "no-store" });
          if (res.status === 503) {
            throw new Error("Service warming up");
          }
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }
          const data = await res.json();

          if (data && data.data && Array.isArray(data.data)) {
            const grouped: Record<string, LLMModel[]> = {
              alibaba: [],
              volcengine: [],
              deepseek: []
            };

            data.data.forEach((item: any) => {
              if (item.provider && grouped[item.provider]) {
                // Check if model already exists in the provider's array to prevent duplicates
                if (!grouped[item.provider].some(m => m.id === item.id)) {
                  grouped[item.provider].push({
                    id: item.id,
                    name: item.name,
                    inputPrice: item.inputPrice,
                    outputPrice: item.outputPrice
                  });
                }
              }
            });

            setProvidersData(() => {
              return providers.map(provider => {
                // Start fresh from the original fallbacks defined in models.ts
                const existingModels = [...provider.models];
                const liveModels = grouped[provider.id] || [];
                
                liveModels.forEach(liveModel => {
                  const existingIndex = existingModels.findIndex(m => m.id === liveModel.id);
                  if (existingIndex >= 0) {
                    existingModels[existingIndex] = liveModel; // Update price if already exists
                  } else {
                    existingModels.push(liveModel); // Add if it's a new model
                  }
                });

                if (existingModels.length > 0) {
                  // Sort models to ensure consistent order
                  existingModels.sort((a, b) => a.name.localeCompare(b.name));
                  return { ...provider, models: existingModels };
                }
                return provider;
              });
            });
          }
          return;
        } catch (err) {
          if (attempt === 5) return;
          await sleep(800 + attempt * 700);
        }
      }
    };

    void load();
  }, []);

  const updateDropdownPosition = useCallback(() => {
    const anchor = modelSelectAnchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    setDropdownPos({
      left: rect.left,
      top: rect.bottom + 8,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;
    updateDropdownPosition();
  }, [isDropdownOpen, updateDropdownPosition, search]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onScroll = () => updateDropdownPosition();
    const onResize = () => updateDropdownPosition();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [isDropdownOpen, updateDropdownPosition]);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (modelSelectAnchorRef.current?.contains(target)) return;
      if (dropdownRef.current?.contains(target)) return;
      setIsDropdownOpen(false);
      setSearch("");
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isDropdownOpen]);

  const effectiveTokens = useMemo(() => {
    const pIn = parseFloat(inputPrice) || 0;
    const pOut = parseFloat(outputPrice) || 0;
    
    if (calcMode === 'amount') {
      const amt = parseFloat(inputAmount) || 0;
      const rIn = parseFloat(ratioIn) || 0;
      const rOut = parseFloat(ratioOut) || 0;
      if (rIn <= 0 || rOut <= 0) return { in: 0, out: 0 };
      const ratio = rIn / rOut;
      // amt = (inTokens / 1000) * pIn + (outTokens / 1000) * pOut
      // constraint: inTokens:outTokens = ratioIn:ratioOut
      // amt = (outTokens / 1000) * (pIn * (ratioIn/ratioOut) + pOut)
      // outTokens = (amt * 1000) / (pIn * (ratioIn/ratioOut) + pOut)
      const costPer1kOut = (pIn * ratio) + pOut;
      if (costPer1kOut > 0) {
        const outT = (amt * 1000) / costPer1kOut;
        const inT = outT * ratio;
        return { in: inT, out: outT };
      }
      return { in: 0, out: 0 };
    }
    
    return {
      in: parseFloat(inputTokens) || 0,
      out: parseFloat(outputTokens) || 0
    };
  }, [calcMode, inputAmount, inputTokens, outputTokens, inputPrice, outputPrice, ratioIn, ratioOut]);

  const calcWarning = useMemo(() => {
    const hasUsage =
      calcMode === "tokens"
        ? inputTokens.trim() !== "" || outputTokens.trim() !== ""
        : inputAmount.trim() !== "";

    const inPrice = parseFloat(inputPrice) || 0;
    const outPrice = parseFloat(outputPrice) || 0;
    const hasBothPrices = inPrice > 0 && outPrice > 0;

    if (hasUsage && !selectedModel && !hasBothPrices) {
      return "请先选择模型（或填写输入/输出单价）后再查看计算结果";
    }
    return "";
  }, [calcMode, inputTokens, outputTokens, inputAmount, selectedModel, inputPrice, outputPrice]);

  const pointsResult = useMemo(() => {
    if (calcWarning) return 0;
    const { in: inTokens, out: outTokens } = effectiveTokens;
    const inPrice = parseFloat(inputPrice) || 0;
    const outPrice = parseFloat(outputPrice) || 0;
    const lossR = parseFloat(lossRate) || 0;
    const profitM = parseFloat(profitMargin) || 0;
    const coeff = parseFloat(pointCoefficient) || 1;

    if (coeff === 0) return 0;

    const cost = (inTokens / 1000) * inPrice + (outTokens / 1000) * outPrice;
    const points = (cost * lossR * profitM) / coeff;
    return points;
  }, [calcWarning, effectiveTokens, inputPrice, outputPrice, lossRate, profitMargin, pointCoefficient]);

  return (
    <div className="min-h-screen text-[#1E1B4B] py-4 px-4 sm:px-6 lg:px-8 font-sans bg-gradient-to-b from-[#E6E9FF] via-[#F5EFFF] to-[#FFFFFF] relative overflow-hidden flex flex-col justify-center items-center">
      {/* Decorative blurred blobs to match the soft pastel style */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-[#D8B4FE]/30 blur-[80px]" />
      <div className="pointer-events-none absolute top-40 -right-20 h-96 w-96 rounded-full bg-[#93C5FD]/30 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#FDBA74]/20 blur-[100px]" />

      <div className="w-full max-w-5xl mx-auto relative z-10 flex flex-col gap-4">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/40 p-4 md:px-6 rounded-[24px] backdrop-blur-md border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-[#7C3AED] rounded-2xl shadow-sm">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#1E1B4B]">
                点数换算工具
              </h1>
              <p className="text-[#64748B] text-[11px] font-bold mt-0.5">
                仅限内部人员使用，不可给客户提供
              </p>
            </div>
          </div>
          <button
            onClick={handleUpdatePrices}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition-all disabled:opacity-50 shadow-md shadow-[#7C3AED]/20 active:scale-95 whitespace-nowrap"
          >
            <RefreshCw className={cn("w-4 h-4", isUpdating && "animate-spin")} />
            {isUpdating ? "更新中..." : "更新实时价格"}
          </button>
        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Column (Model & Usage) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Model Card */}
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#F5EFFF] text-[#7C3AED] rounded-xl">
                  <Target className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[#1E1B4B]">选择模型与单价</h2>
              </div>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 pl-1">模型选择</label>
                  <div ref={modelSelectAnchorRef} className="relative group" onClick={() => setIsDropdownOpen(true)}>
                    <input
                      type="text"
                      className="w-full pl-4 pr-10 py-2.5 border-2 border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-[#F8FAFC] group-hover:bg-white transition-colors text-[#1E1B4B] font-bold text-sm cursor-pointer"
                      placeholder="搜索或选择模型..."
                      value={isDropdownOpen ? search : (selectedModel ? selectedModel.name : search)}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                    />
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-[#94A3B8]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]/50">
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      输入单价 <span className="text-[#94A3B8] font-normal">(¥/1k)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-1 py-1 border-0 border-b-2 border-[#CBD5E1] bg-transparent focus:ring-0 focus:border-[#7C3AED] text-base font-bold text-[#1E1B4B] placeholder-[#CBD5E1] transition-colors"
                      placeholder="0.00"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                    />
                  </div>
                  <div className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]/50">
                    <label className="block text-[10px] font-bold text-[#64748B] mb-1">
                      输出单价 <span className="text-[#94A3B8] font-normal">(¥/1k)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-1 py-1 border-0 border-b-2 border-[#CBD5E1] bg-transparent focus:ring-0 focus:border-[#7C3AED] text-base font-bold text-[#1E1B4B] placeholder-[#CBD5E1] transition-colors"
                      placeholder="0.00"
                      value={outputPrice}
                      onChange={(e) => setOutputPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Card */}
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#EFF6FF] text-[#3B82F6] rounded-xl">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-[#1E1B4B]">预估使用量</h2>
                </div>
                
                {/* Mode Switcher */}
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl shadow-inner">
                  <button
                    onClick={() => setCalcMode('tokens')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                      calcMode === 'tokens' 
                        ? "bg-white text-[#3B82F6] shadow-sm" 
                        : "text-[#64748B] hover:text-[#1E1B4B]"
                    )}
                  >
                    按 Tokens
                  </button>
                  <button
                    onClick={() => setCalcMode('amount')}
                    className={cn(
                      "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                      calcMode === 'amount' 
                        ? "bg-white text-[#3B82F6] shadow-sm" 
                        : "text-[#64748B] hover:text-[#1E1B4B]"
                    )}
                  >
                    按金额
                  </button>
                </div>
              </div>

              {calcMode === 'tokens' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 pl-1">输入 Tokens</label>
                      <input
                        type="number"
                        min="0"
                        className={cn(
                          "w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 bg-[#F8FAFC] text-[#1E1B4B] font-bold text-sm transition-colors",
                          calcWarning
                            ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
                            : "border-[#E2E8F0] focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                        )}
                        placeholder="10000"
                        value={inputTokens}
                        onChange={(e) => setInputTokens(e.target.value)}
                      />
                    </div>
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 pl-1">输出 Tokens</label>
                      <input
                        type="number"
                        min="0"
                        className={cn(
                          "w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 bg-[#F8FAFC] text-[#1E1B4B] font-bold text-sm transition-colors",
                          calcWarning
                            ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
                            : "border-[#E2E8F0] focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                        )}
                        placeholder="2000"
                        value={outputTokens}
                        onChange={(e) => setOutputTokens(e.target.value)}
                      />
                    </div>
                  </div>
                  {calcWarning && (
                    <p className="text-xs font-bold text-red-500 pl-1">{calcWarning}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1.5 pl-1">预估总金额 <span className="text-[#94A3B8] font-normal">(¥)</span></label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className={cn(
                        "w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-4 bg-[#F8FAFC] text-[#1E1B4B] font-bold text-sm transition-colors",
                        calcWarning
                          ? "border-red-400 focus:ring-red-400/20 focus:border-red-500"
                          : "border-[#E2E8F0] focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                      )}
                      placeholder="例如: 100"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                    />
                    {calcWarning && (
                      <p className="text-xs font-bold text-red-500 mt-2 pl-1">{calcWarning}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]/50 items-end">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-[#94A3B8] mb-1">输入比例</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="w-full px-2 py-2 border-2 border-[#E2E8F0] rounded-lg bg-white text-[#1E1B4B] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                        value={ratioIn}
                        onChange={(e) => setRatioIn(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center justify-center pb-2 text-[#94A3B8] font-black">
                      :
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-[#94A3B8] mb-1">输出比例</label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="w-full px-2 py-2 border-2 border-[#E2E8F0] rounded-lg bg-white text-[#1E1B4B] font-bold text-sm focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6]"
                        value={ratioOut}
                        onChange={(e) => setRatioOut(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]/50">
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] mb-1">推算输入 Tokens <span className="font-normal">({ratioIn || "0"})</span></label>
                      <div className="text-sm font-bold text-[#64748B]">{Math.round(effectiveTokens.in).toLocaleString()}</div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#94A3B8] mb-1">推算输出 Tokens <span className="font-normal">({ratioOut || "0"})</span></label>
                      <div className="text-sm font-bold text-[#64748B]">{Math.round(effectiveTokens.out).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column (Result & Config) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Highlighted Result Card */}
            <div className="rounded-[28px] shadow-lg text-white overflow-hidden bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#C026D3] ring-1 ring-white/20 p-5 flex flex-col justify-center items-center text-center relative shrink-0">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none"></div>
              <h2 className="text-white/80 font-bold text-[11px] tracking-widest uppercase mb-1 relative z-10">总预估消耗</h2>
              <div className="flex items-baseline gap-1.5 relative z-10">
                <span className="text-4xl md:text-5xl font-black drop-shadow-md tracking-tight">
                  {pointsResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
                <span className="text-base font-bold text-white/70">pts</span>
              </div>
            </div>

            {/* Config Card */}
            <div className="bg-white/90 backdrop-blur-xl p-5 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-[#FEF3C7] text-[#F59E0B] rounded-xl">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[#1E1B4B]">计费配置与明细</h2>
              </div>
              
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]/50 text-center">
                  <label className="block text-[9px] font-bold text-[#64748B] mb-0.5">损耗率</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-0 border-0 bg-transparent focus:ring-0 text-sm font-bold text-[#1E1B4B] text-center"
                    value={lossRate}
                    onChange={(e) => setLossRate(e.target.value)}
                  />
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]/50 text-center">
                  <label className="block text-[9px] font-bold text-[#64748B] mb-0.5">利润率</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-0 border-0 bg-transparent focus:ring-0 text-sm font-bold text-[#1E1B4B] text-center"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                  />
                </div>
                <div className="bg-[#F8FAFC] p-2 rounded-xl border border-[#E2E8F0]/50 text-center">
                  <label className="block text-[9px] font-bold text-[#64748B] mb-0.5">点数系数</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full p-0 border-0 bg-transparent focus:ring-0 text-sm font-bold text-[#1E1B4B] text-center"
                    value={pointCoefficient}
                    onChange={(e) => setPointCoefficient(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 bg-[#F8FAFC] rounded-2xl p-3 border border-[#E2E8F0]/50 flex flex-col justify-center gap-2">
                <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />输入成本</span>
                  <span className="text-[#1E1B4B]">¥{((effectiveTokens.in / 1000) * (parseFloat(inputPrice) || 0)).toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-[#64748B]">
                  <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />输出成本</span>
                  <span className="text-[#1E1B4B]">¥{((effectiveTokens.out / 1000) * (parseFloat(outputPrice) || 0)).toFixed(4)}</span>
                </div>
                <div className="pt-2 mt-1 border-t border-[#E2E8F0] flex justify-between font-black text-[13px]">
                  <span className="text-[#1E1B4B]">基础总成本</span>
                  <span className="text-[#7C3AED]">¥{(((effectiveTokens.in / 1000) * (parseFloat(inputPrice) || 0)) + ((effectiveTokens.out / 1000) * (parseFloat(outputPrice) || 0))).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isDropdownOpen &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999]"
              style={{ left: dropdownPos.left, top: dropdownPos.top, width: dropdownPos.width }}
            >
              <div className="bg-white/95 backdrop-blur-xl border border-[#E2E8F0] rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] ring-1 ring-[#7C3AED]/10 overflow-hidden flex flex-col max-h-[360px]">
                {filteredProviders.length > 0 ? (
                  <div className="overflow-y-auto overscroll-contain flex-1 max-h-[360px] pb-2">
                    {filteredProviders.map((provider) => (
                      <div key={provider.id} className="mb-0">
                        <div className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-[#1E1B4B] bg-[#F8FAFC]/95 sticky top-0 backdrop-blur-xl z-10 border-b border-[#E2E8F0]/80 shadow-sm">
                          <span className="flex items-center justify-center scale-90">{provider.icon}</span>
                          {provider.name}
                        </div>
                        <ul className="py-1">
                          {provider.models.map((model: LLMModel) => (
                            <li
                              key={model.id}
                              className={cn(
                                "px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between pl-11",
                                selectedModel?.id === model.id 
                                  ? "bg-[#F5EFFF] text-[#7C3AED] font-bold" 
                                  : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E1B4B] font-medium"
                              )}
                              onClick={() => handleSelectModel(model)}
                            >
                              <span>{model.name}</span>
                              {selectedModel?.id === model.id && <Check className="w-4 h-4 text-[#7C3AED]" />}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-8 text-sm font-medium text-[#94A3B8] text-center">未找到匹配的模型</div>
                )}
              </div>
            </div>,
            document.body
          )}
      </div>
    </div>
  );
}

export default App;
