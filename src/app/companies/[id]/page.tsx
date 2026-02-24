/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use, useState, useEffect } from "react";
import { mockCompanies } from "@/data/mockCompanies";
import { ArrowLeft, Plus, Sparkles, ExternalLink, Activity, Network, StickyNote } from "lucide-react";
import Link from "next/link";

interface Company {
  id: string;
  name: string;
  domain: string;
  description: string;
  signals: string[];
  addedAt: string;
}

export default function CompanyProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const company = mockCompanies.find((c) => c.id === resolvedParams.id);
  
  const [listName, setListName] = useState("");
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState<any>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!company) return;
    Promise.resolve().then(() => {
      const cachedEnrichment = localStorage.getItem(`vc-enrichment-${company.id}`);
      if (cachedEnrichment) setEnrichmentData(JSON.parse(cachedEnrichment));
      
      const cachedNote = localStorage.getItem(`vc-note-${company.id}`);
      if (cachedNote) setNote(cachedNote);
    });
  }, [company]);

  if (!company) return <div className="p-12 text-center text-slate-500 font-medium">Startup not found in deal flow.</div>;

  const handleSaveToList = () => {
    if (!listName.trim()) return;
    const existing = localStorage.getItem("vc-lists");
    const lists = existing ? JSON.parse(existing) : {};
    
    if (!lists[listName]) lists[listName] = [];
    if (!lists[listName].find((c: Company) => c.id === company.id)) {
      lists[listName].push(company);
      localStorage.setItem("vc-lists", JSON.stringify(lists));
      alert(`Added ${company.name} to ${listName}!`);
    } else {
      alert(`${company.name} is already in ${listName}`);
    }
    setListName("");
  };

  const handleEnrich = async () => {
    setIsEnriching(true);
    setError("");
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: company.domain }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch data");
      
      setEnrichmentData(data);
      localStorage.setItem(`vc-enrichment-${company.id}`, JSON.stringify(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleSaveNote = () => {
    localStorage.setItem(`vc-note-${company.id}`, note);
    alert("Note saved successfully!");
  };

  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      "bg-blue-50 text-blue-700 ring-blue-600/20",
      "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
      "bg-purple-50 text-purple-700 ring-purple-600/20",
      "bg-amber-50 text-amber-700 ring-amber-600/20"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8 w-full">
      <Link href="/companies" className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors w-fit font-medium text-sm">
        <ArrowLeft size={16} />
        <span>Back to Deal Flow</span>
      </Link>

      <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-2xl p-8 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
            <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full tracking-wide">
              ID: {company.id}
            </span>
          </div>
          <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 hover:underline font-medium mb-4 w-fit">
            {company.domain} <ExternalLink size={14} />
          </a>
          <p className="text-slate-700 text-lg max-w-2xl">{company.description}</p>
        </div>
        
        <button 
          onClick={handleEnrich}
          disabled={isEnriching}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold transition-all shadow-sm shadow-indigo-200 ring-1 ring-inset ring-indigo-700"
        >
          <Sparkles size={18} className="text-indigo-100" />
          <span>{isEnriching ? "Scraping..." : "Enrich Profile"}</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-2xl p-8">
            <div className="flex items-center gap-2 mb-6">
              <Network className="text-indigo-500" size={20} />
              <h2 className="text-xl font-bold text-slate-900">Live Enrichment Data</h2>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 ring-1 ring-red-200 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {!enrichmentData && !isEnriching && (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
                <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4 ring-1 ring-indigo-100">
                  <Sparkles className="text-indigo-500" size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No intelligence gathered yet</h3>
                <p className="text-slate-500 max-w-sm">Click &quot;Enrich Profile&quot; to trigger the AI scraper and fetch live signals, keywords, and summaries from the public web.</p>
              </div>
            )}

            {isEnriching && (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-10 w-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h3 className="text-lg font-bold text-slate-900">Scraping & Analyzing...</h3>
                <p className="text-slate-500 text-sm mt-1">Fetching live data from {company.domain}</p>
              </div>
            )}

            {enrichmentData && !isEnriching && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">AI Summary</h3>
                  <p className="text-slate-800 font-medium leading-relaxed">{enrichmentData.summary}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">What They Do</h3>
                  <ul className="space-y-2">
                    {enrichmentData.whatTheyDo?.map((item: string, i: number) => (
                       <li key={i} className="flex gap-2 text-slate-700">
                         <span className="text-indigo-500 font-bold">•</span> {item}
                       </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-2">
                    {enrichmentData.keywords?.map((kw: string, i: number) => (
                       <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md">
                         {kw}
                       </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Derived Signals</h3>
                  <ul className="space-y-2">
                    {enrichmentData.derivedSignals?.map((item: string, i: number) => (
                       <li key={i} className="flex gap-2 text-slate-700">
                         <span className="text-emerald-500 font-bold">↳</span> {item}
                       </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sources</h3>
                  {enrichmentData.sources?.map((src: any, i: number) => (
                    <div key={i} className="text-xs text-slate-500 flex justify-between">
                      <a href={src.url} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">{src.url}</a>
                      <span>{new Date(src.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-1 space-y-8">
          <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-slate-400" size={18} />
              <h3 className="font-bold text-slate-900">Captured Signals</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {company.signals.map((signal, idx) => (
                <span key={idx} className={`px-2.5 py-1 text-xs rounded-md ring-1 ring-inset font-medium ${getBadgeColor(idx)}`}>
                  {signal}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote className="text-amber-500" size={18} />
              <h3 className="font-bold text-slate-900">Analyst Notes</h3>
            </div>
            <div className="flex flex-col gap-3">
              <textarea
                placeholder="Add your thesis notes here..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border-0 ring-1 ring-inset ring-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 resize-none"
              />
              <button 
                onClick={handleSaveNote}
                className="w-full px-4 py-2 bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>

          <div className="bg-slate-900 shadow-sm rounded-2xl p-6 text-white">
            <h3 className="font-bold text-white mb-1">Add to List</h3>
            <p className="text-slate-400 text-sm mb-4">Organize your pipeline.</p>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="e.g. Q3 High Priority..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border-0 ring-1 ring-inset ring-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              />
              <button 
                onClick={handleSaveToList}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-sm font-bold transition-colors shadow-sm"
              >
                <Plus size={18} /> Save Startup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}