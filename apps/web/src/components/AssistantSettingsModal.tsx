'use client';

import React, { useEffect, useState } from 'react';
import { X, Cpu, Check, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { AssistantConfig, AvailabilityResult } from '@jpe/ai';
import {
  assistant,
  loadAssistantConfig,
  saveAssistantConfig,
  RECOMMENDED_MODEL,
} from '@/lib/assistant';

interface AssistantSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantSettingsModal: React.FC<AssistantSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<AssistantConfig>(() => loadAssistantConfig());
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(loadAssistantConfig());
      setResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const test = async () => {
    setTesting(true);
    saveAssistantConfig(config);
    try {
      setResult(await assistant.checkAvailability());
    } finally {
      setTesting(false);
    }
  };

  const save = () => {
    saveAssistantConfig(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden border-t-2 border-t-joint-500">
        <div className="p-5 bg-gradient-to-r from-slate-900 via-joint-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-joint-900/80 border border-joint-500/50 flex items-center justify-center text-joint-300">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-joint-950 text-joint-300 border border-joint-800">
                Local Inference
              </span>
              <h2 className="text-base font-bold text-white mt-0.5">Planning Assistant</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-emerald-200/85 leading-relaxed">
              The assistant runs against a model on your own network. Planning data never leaves it,
              so the tool remains usable with CUI and inside an air gap. Every planning feature
              works with the assistant switched off — it accelerates staff work, it does not gate it.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
              Inference endpoint
              <span className="text-slate-600 ml-1.5">OpenAI-compatible</span>
            </label>
            <input
              type="text"
              value={config.baseUrl}
              onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
              placeholder="http://localhost:11434/v1"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-joint-500"
            />
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
              Works with Ollama, llama.cpp, LM Studio or vLLM — anything exposing the OpenAI chat
              API.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Model</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.model}
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder={RECOMMENDED_MODEL}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-joint-500"
              />
              {result?.models.length ? (
                <select
                  value=""
                  onChange={(e) => e.target.value && setConfig({ ...config, model: e.target.value })}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 text-[11px] text-joint-300 font-mono focus:outline-none focus:border-joint-500"
                >
                  <option value="">detected…</option>
                  {result.models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              ) : null}
            </div>
            <p className="text-[10px] text-amber-400/85 mt-1.5 leading-relaxed flex items-start gap-1.5">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              Use a non-reasoning instruct model such as <span className="font-mono">{RECOMMENDED_MODEL}</span>.
              Reasoning models emit long hidden chains before answering, and 3B-class models are
              unstable on extraction — three identical runs returned 4, 8 and 1 tasks in testing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Temperature
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={config.temperature}
                onChange={(e) =>
                  setConfig({ ...config, temperature: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-joint-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1.5">
                Timeout (seconds)
              </label>
              <input
                type="number"
                min="10"
                value={Math.round(config.timeoutMs / 1000)}
                onChange={(e) =>
                  setConfig({ ...config, timeoutMs: (parseInt(e.target.value, 10) || 180) * 1000 })
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-joint-500"
              />
            </div>
          </div>

          {result && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                result.reachable
                  ? 'bg-emerald-950/25 border-emerald-800/60'
                  : 'bg-red-950/25 border-red-800/60'
              }`}
            >
              {result.reachable ? (
                <Check className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <div className="min-w-0">
                <p
                  className={`text-[11px] font-semibold ${
                    result.reachable ? 'text-emerald-200' : 'text-red-200'
                  }`}
                >
                  {result.reachable ? 'Endpoint reachable' : 'Endpoint unreachable'}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{result.detail}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={test}
            disabled={testing}
            className="px-4 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:border-joint-600 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
            {testing ? 'Testing…' : 'Test connection'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-5 py-2 rounded-lg bg-joint-600 hover:bg-joint-500 text-white text-xs font-bold transition shadow-lg shadow-joint-950"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
