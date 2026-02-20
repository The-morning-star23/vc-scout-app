"use client";

import { use, useState } from "react";
import { mockCompanies } from "@/data/mockCompanies";
import { ArrowLeft, Plus, Sparkles } from "lucide-react";
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
  const company = mockCompanies.find(c => c.id === resolvedParams.id);
  const [listName, setListName] = useState("");

  if (!company) return <div className="p-8">Company not found</div>;

  const handleSaveToList = () => {
    if (!listName.trim()) return;
    
    const existing = localStorage.getItem("vc-lists");
    const lists = existing ? JSON.parse(existing) : {};
    
    if (!lists[listName]) lists[listName] = [];
    if (!lists[listName].find((c: Company) => c.id === company.id)) {
      lists[listName].push(company);
      localStorage.setItem("vc-lists", JSON.stringify(lists));
      alert(`Saved ${company.name} to ${listName}!`);
    } else {
      alert(`${company.name} is already in ${listName}`);
    }
    setListName("");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <Link href="/companies" className="flex items-center gap-2 text-gray-500 hover:text-gray-900 w-fit">
        <ArrowLeft size={16} />
        <span className="text-sm font-medium">Back to search</span>
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl p-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
          <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            {company.domain}
          </a>
          <p className="mt-4 text-gray-700 text-lg">{company.description}</p>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
          <Sparkles size={18} />
          <span>Enrich Profile</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Live Enrichment Data</h2>
            <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-500">
              Click &quot;Enrich Profile&quot; to fetch live public data via AI scrape.
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Save to List</h3>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter list name..."
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                onClick={handleSaveToList}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus size={16} /> Add to List
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Captured Signals</h3>
            <div className="flex flex-wrap gap-2">
              {company.signals.map((signal, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                  {signal}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}