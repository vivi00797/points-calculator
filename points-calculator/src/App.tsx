import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calculator, Settings, Info, ChevronDown, Check } from "lucide-react";
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

  useEffect(() => {
    // Use the production backend API URL
    const apiUrl = `https://points-calculator-api.onrender.com/api/prices`;

    fetch(apiUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
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
      })
      .catch(err => {
        console.warn('Failed to fetch real-time prices, using fallback data:', err);
      });
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
    <div className="min-h-screen text-slate-900 py-10 px-4 sm:px-6 lg:px-8 font-sans bg-gradient-to-br from-violet-50 via-indigo-50 to-slate-50">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 text-violet-700 rounded-full mb-4 shadow-sm ring-1 ring-violet-200/60">
            <Calculator className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            点数换算小工具
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            供内部运营人员快速计算点数配置，供外部客户预估大模型 API 费用。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl shadow-sm ring-1 ring-violet-200/60">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-400" />
                1. 选择模型与单价
              </h2>
              
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-700 mb-1">模型选择</label>
                  <div ref={modelSelectAnchorRef} className="relative" onClick={() => setIsDropdownOpen(true)}>
                    <input
                      type="text"
                      className="w-full pl-3 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm cursor-pointer"
                      placeholder="搜索或选择模型..."
                      value={isDropdownOpen ? search : (selectedModel ? selectedModel.name : search)}
                      onFocus={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                    />
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      输入单价 <span className="text-slate-400 font-normal">(¥ / 1k tokens)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="例如: 0.01"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      输出单价 <span className="text-slate-400 font-normal">(¥ / 1k tokens)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      placeholder="例如: 0.03"
                      value={outputPrice}
                      onChange={(e) => setOutputPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl shadow-sm ring-1 ring-violet-200/60">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-400" />
                2. 预估使用量
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">输入 Tokens</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="例如: 10000"
                    value={inputTokens}
                    onChange={(e) => setInputTokens(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">输出 Tokens</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="例如: 2000"
                    value={outputTokens}
                    onChange={(e) => setOutputTokens(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white/75 backdrop-blur-md p-6 rounded-2xl shadow-sm ring-1 ring-violet-200/60">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-slate-400" />
                3. 计费系数配置
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    损耗率 <span className="text-slate-400 font-normal">(倍数，如 1.2)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={lossRate}
                    onChange={(e) => setLossRate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    利润率 <span className="text-slate-400 font-normal">(倍数，如 1.5)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">点数系数</label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    value={pointCoefficient}
                    onChange={(e) => setPointCoefficient(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-violet-50/60 rounded-lg text-sm text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                <p>
                  公式: <code className="bg-slate-200 px-1 py-0.5 rounded">((入Tokens/1k * 入价 + 出Tokens/1k * 出价) * 损耗率 * 利润率) / 点数系数</code>
                </p>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-8">
            <div className="rounded-2xl shadow-lg text-white overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 ring-1 ring-white/15">
              <div className="p-6 border-b border-white/15">
                <h2 className="text-white/85 font-medium mb-2">预估点数消耗</h2>
                <div className="text-5xl font-bold tracking-tight break-all">
                  {pointsResult.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </div>
                <div className="text-white/70 text-sm mt-2">
                  pts
                </div>
              </div>
              
              <div className="p-6 bg-white/10 space-y-4">
                <h3 className="text-sm font-medium text-white/85 uppercase tracking-wider">计算明细</h3>
                
                <div className="space-y-2 text-sm text-white/85">
                  <div className="flex justify-between">
                    <span>输入成本</span>
                    <span>¥{((parseFloat(inputTokens) || 0) / 1000 * (parseFloat(inputPrice) || 0)).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>输出成本</span>
                    <span>¥{((parseFloat(outputTokens) || 0) / 1000 * (parseFloat(outputPrice) || 0)).toFixed(4)}</span>
                  </div>
                  <div className="pt-2 border-t border-white/15 flex justify-between font-medium">
                    <span>基础总成本</span>
                    <span>¥{(((parseFloat(inputTokens) || 0) / 1000 * (parseFloat(inputPrice) || 0)) + ((parseFloat(outputTokens) || 0) / 1000 * (parseFloat(outputPrice) || 0))).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>乘数调整</span>
                    <span>× {((parseFloat(lossRate) || 0) * (parseFloat(profitMargin) || 0)).toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-white/70">
                    <span>点数系数</span>
                    <span>÷ {parseFloat(pointCoefficient) || 1}</span>
                  </div>
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
              <div className="bg-white border border-slate-200 rounded-lg shadow-2xl max-h-80 overflow-auto ring-1 ring-violet-200/60">
                {filteredProviders.length > 0 ? (
                  <div className="py-2">
                    {filteredProviders.map((provider) => (
                      <div key={provider.id} className="mb-2 last:mb-0">
                        <div className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-900 bg-violet-50/60 sticky top-0 backdrop-blur-sm z-10">
                          <span className="flex items-center justify-center">{provider.icon}</span>
                          {provider.name}
                        </div>
                        <ul className="py-1">
                          {provider.models.map((model: LLMModel) => (
                            <li
                              key={model.id}
                              className={cn(
                                "px-3 py-2 text-sm cursor-pointer hover:bg-violet-50 flex items-center justify-between pl-10",
                                selectedModel?.id === model.id && "bg-violet-50 text-violet-700 font-medium"
                              )}
                              onClick={() => handleSelectModel(model)}
                            >
                              <span>{model.name}</span>
                              {selectedModel?.id === model.id && <Check className="w-4 h-4" />}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-4 text-sm text-slate-500 text-center">未找到匹配的模型</div>
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
