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
      const res = await fetch("https://points-calculator-api.onrender.com/api/prices/update", { 
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
            grouped[item.provider].push({
              id: item.id,
              name: item.name,
              inputPrice: item.inputPrice,
              outputPrice: item.outputPrice
            });
          }
        });

        setProvidersData(prev => prev.map(provider => {
          const liveModels = grouped[provider.id];
          if (liveModels && liveModels.length > 0) {
            return { ...provider, models: liveModels };
          }
          return provider;
        }));
      }
    } catch (err) {
      console.warn('Failed to update prices:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    const apiUrl = "https://points-calculator-api.onrender.com/api/prices";

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
                grouped[item.provider].push({
                  id: item.id,
                  name: item.name,
                  inputPrice: item.inputPrice,
                  outputPrice: item.outputPrice
                });
              }
            });

            setProvidersData(prev => prev.map(provider => {
              const liveModels = grouped[provider.id];
              if (liveModels && liveModels.length > 0) {
                return { ...provider, models: liveModels };
              }
              return provider;
            }));
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

  const pointsResult = useMemo(() => {
    const inTokens = parseFloat(inputTokens) || 0;
    const outTokens = parseFloat(outputTokens) || 0;
    const inPrice = parseFloat(inputPrice) || 0;
    const outPrice = parseFloat(outputPrice) || 0;
    const lossR = parseFloat(lossRate) || 0;
    const profitM = parseFloat(profitMargin) || 0;
    const coeff = parseFloat(pointCoefficient) || 1;

    if (coeff === 0) return 0;

    const cost = (inTokens / 1000) * inPrice + (outTokens / 1000) * outPrice;
    const points = (cost * lossR * profitM) / coeff;
    return points;
  }, [inputTokens, outputTokens, inputPrice, outputPrice, lossRate, profitMargin, pointCoefficient]);

  return (
    <div className="min-h-screen text-[#1E1B4B] py-10 px-4 sm:px-6 lg:px-8 font-sans bg-gradient-to-b from-[#E6E9FF] via-[#F5EFFF] to-[#FFFFFF] relative overflow-hidden">
      {/* Decorative blurred blobs to match the soft pastel style */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-96 w-96 rounded-full bg-[#D8B4FE]/30 blur-[80px]" />
      <div className="pointer-events-none absolute top-40 -right-20 h-96 w-96 rounded-full bg-[#93C5FD]/30 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-[#FDBA74]/20 blur-[100px]" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header / Hero Section matching "Slaying" */}
        <div className="text-center space-y-3 pt-6 pb-4">
          <div className="inline-flex items-center justify-center p-3.5 bg-white/80 text-[#7C3AED] rounded-2xl mb-2 shadow-sm backdrop-blur-sm">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E1B4B]">
            预估点数消耗
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-5xl md:text-7xl font-black text-[#7C3AED] drop-shadow-sm">
              {pointsResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </span>
            <span className="text-2xl font-bold text-[#8B8BA7] self-end mb-2">pts</span>
          </div>
          <p className="text-[#64748B] max-w-2xl mx-auto mt-4 font-medium">
            仅限内部人员使用，不可给客户提供
          </p>
        </div>

        {/* Full width model selection card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 md:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#F5EFFF] text-[#7C3AED] rounded-xl">
                <Target className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1E1B4B]">
                选择模型与单价
              </h2>
            </div>
            <button
              onClick={handleUpdatePrices}
              disabled={isUpdating}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#7C3AED] rounded-xl hover:bg-[#6D28D9] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#7C3AED]/20 active:scale-95"
            >
              <RefreshCw className={cn("w-4 h-4", isUpdating && "animate-spin")} />
              {isUpdating ? "更新中..." : "更新实时价格"}
            </button>
          </div>
          
          <div className="space-y-5">
            <div className="relative">
              <label className="block text-sm font-bold text-[#64748B] mb-2 pl-1">模型选择</label>
              <div ref={modelSelectAnchorRef} className="relative group" onClick={() => setIsDropdownOpen(true)}>
                <input
                  type="text"
                  className="w-full pl-4 pr-12 py-3.5 border-2 border-[#E2E8F0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-[#F8FAFC] group-hover:bg-white transition-colors text-[#1E1B4B] font-medium text-lg cursor-pointer"
                  placeholder="搜索或选择模型..."
                  value={isDropdownOpen ? search : (selectedModel ? selectedModel.name : search)}
                  onFocus={() => setIsDropdownOpen(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                />
                <ChevronDown className="absolute right-4 top-4 w-6 h-6 text-[#94A3B8]" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]/50">
                <label className="block text-sm font-bold text-[#64748B] mb-2">
                  输入单价 <span className="text-[#94A3B8] font-normal text-xs">(¥ / 1k tokens)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border-0 border-b-2 border-[#CBD5E1] bg-transparent focus:ring-0 focus:border-[#7C3AED] text-xl font-bold text-[#1E1B4B] placeholder-[#CBD5E1] transition-colors"
                  placeholder="0.00"
                  value={inputPrice}
                  onChange={(e) => setInputPrice(e.target.value)}
                />
              </div>
              <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0]/50">
                <label className="block text-sm font-bold text-[#64748B] mb-2">
                  输出单价 <span className="text-[#94A3B8] font-normal text-xs">(¥ / 1k tokens)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="w-full px-3 py-2 border-0 border-b-2 border-[#CBD5E1] bg-transparent focus:ring-0 focus:border-[#7C3AED] text-xl font-bold text-[#1E1B4B] placeholder-[#CBD5E1] transition-colors"
                  placeholder="0.00"
                  value={outputPrice}
                  onChange={(e) => setOutputPrice(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout for Inputs & Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Usage Input Card */}
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#EFF6FF] text-[#3B82F6] rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1E1B4B]">
                预估使用量
              </h2>
            </div>
            
            <div className="space-y-5 flex-1 justify-center flex flex-col">
              <div className="relative">
                <label className="block text-sm font-bold text-[#64748B] mb-2 pl-1">输入 Tokens</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3.5 border-2 border-[#E2E8F0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F8FAFC] text-[#1E1B4B] font-bold text-lg transition-colors"
                  placeholder="10000"
                  value={inputTokens}
                  onChange={(e) => setInputTokens(e.target.value)}
                />
              </div>
              <div className="relative">
                <label className="block text-sm font-bold text-[#64748B] mb-2 pl-1">输出 Tokens</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-4 py-3.5 border-2 border-[#E2E8F0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] bg-[#F8FAFC] text-[#1E1B4B] font-bold text-lg transition-colors"
                  placeholder="2000"
                  value={outputTokens}
                  onChange={(e) => setOutputTokens(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Config & Detail Breakdown Card */}
          <div className="bg-white/90 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-[#FEF3C7] text-[#F59E0B] rounded-xl">
                <Coins className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#1E1B4B]">
                计费配置与明细
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]/50">
                <label className="block text-xs font-bold text-[#64748B] mb-1">损耗率</label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-0 border-0 bg-transparent focus:ring-0 text-lg font-bold text-[#1E1B4B]"
                  value={lossRate}
                  onChange={(e) => setLossRate(e.target.value)}
                />
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]/50">
                <label className="block text-xs font-bold text-[#64748B] mb-1">利润率</label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-0 border-0 bg-transparent focus:ring-0 text-lg font-bold text-[#1E1B4B]"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                />
              </div>
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]/50">
                <label className="block text-xs font-bold text-[#64748B] mb-1">点数系数</label>
                <input
                  type="number"
                  step="any"
                  className="w-full p-0 border-0 bg-transparent focus:ring-0 text-lg font-bold text-[#1E1B4B]"
                  value={pointCoefficient}
                  onChange={(e) => setPointCoefficient(e.target.value)}
                />
              </div>
            </div>

            <div className="flex-1 bg-[#F8FAFC] rounded-2xl p-4 border border-[#E2E8F0]/50 space-y-3">
              <h3 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">成本预估明细</h3>
              <div className="flex justify-between text-sm font-medium text-[#64748B]">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#3B82F6]" />输入成本</span>
                <span className="text-[#1E1B4B]">¥{((parseFloat(inputTokens) || 0) / 1000 * (parseFloat(inputPrice) || 0)).toFixed(4)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-[#64748B]">
                <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#F59E0B]" />输出成本</span>
                <span className="text-[#1E1B4B]">¥{((parseFloat(outputTokens) || 0) / 1000 * (parseFloat(outputPrice) || 0)).toFixed(4)}</span>
              </div>
              <div className="pt-3 mt-1 border-t border-[#E2E8F0] flex justify-between font-bold text-base">
                <span className="text-[#1E1B4B]">基础总成本</span>
                <span className="text-[#7C3AED]">¥{(((parseFloat(inputTokens) || 0) / 1000 * (parseFloat(inputPrice) || 0)) + ((parseFloat(outputTokens) || 0) / 1000 * (parseFloat(outputPrice) || 0))).toFixed(4)}</span>
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
              <div className="bg-white/95 backdrop-blur-xl border border-[#E2E8F0] rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] max-h-[360px] overflow-auto ring-1 ring-[#7C3AED]/10 overflow-hidden">
                {filteredProviders.length > 0 ? (
                  <div className="py-2">
                    {filteredProviders.map((provider) => (
                      <div key={provider.id} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-[#1E1B4B] bg-[#F8FAFC]/90 sticky top-0 backdrop-blur-md z-10 border-y border-[#E2E8F0]/50 first:border-t-0">
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
