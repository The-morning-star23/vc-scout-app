"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockCompanies } from "@/data/mockCompanies";
import { Search, Filter, ChevronLeft, ChevronRight, BookmarkPlus, TrendingUp } from "lucide-react";
import Link from "next/link";

function CompaniesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  
  const [search, setSearch] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    Promise.resolve().then(() => {
      if (initialSearch) setSearch(initialSearch);
    });
  }, [initialSearch]);

  const handleSaveSearch = () => {
    if (!search.trim()) return alert("Please enter a search term first.");
    
    const existing = localStorage.getItem("vc-saved-searches");
    const searches = existing ? JSON.parse(existing) : [];
    
    const newSearch = {
      id: Date.now().toString(),
      query: search,
      date: new Date().toLocaleDateString()
    };
    
    localStorage.setItem("vc-saved-searches", JSON.stringify([newSearch, ...searches]));
    alert(`Search for "${search}" saved!`);
  };

  const filteredCompanies = mockCompanies.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.description.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Deal Flow</h1>
          <p className="text-slate-500 mt-1">Discover and filter high-signal startups.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold tracking-wide ring-1 ring-inset ring-indigo-600/20">
          <TrendingUp size={16} />
          <span>{filteredCompanies.length} Active Leads</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        <div className="relative flex-1 shadow-sm rounded-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by company name, domain, or keywords..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-12 pr-4 py-3 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-inset focus:ring-indigo-600 text-slate-900 placeholder:text-slate-400 bg-white"
          />
        </div>
        <button 
          onClick={handleSaveSearch}
          className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-all font-medium"
        >
          <BookmarkPlus size={18} />
          <span>Save Query</span>
        </button>
        <button className="flex items-center gap-2 px-5 py-3 bg-white text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm rounded-xl hover:bg-slate-50 transition-all font-medium">
          <Filter size={18} />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-white ring-1 ring-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Intelligence</th>
              <th className="px-6 py-4">Recent Signals</th>
              <th className="px-6 py-4 text-right">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedCompanies.map((company) => (
              <tr key={company.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-5">
                  <Link href={`/companies/${company.id}`} className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-base">
                    {company.name}
                  </Link>
                  <div className="text-sm text-slate-500 mt-0.5 font-medium">{company.domain}</div>
                </td>
                <td className="px-6 py-5 text-slate-700 text-sm">{company.description}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-wrap gap-2">
                    {company.signals.map((signal, idx) => (
                      <span key={idx} className={`px-2.5 py-1 text-xs rounded-md ring-1 ring-inset font-medium ${getBadgeColor(idx)}`}>
                        {signal}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500 font-medium text-right whitespace-nowrap">
                  {company.addedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCompanies.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Search className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-slate-900">No startups found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search query or filters.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm font-medium text-slate-600 bg-white p-4 ring-1 ring-slate-200 shadow-sm rounded-xl">
          <span>
            Showing <span className="text-slate-900">{startIndex + 1}</span> to <span className="text-slate-900">{Math.min(startIndex + itemsPerPage, filteredCompanies.length)}</span> of <span className="text-slate-900">{filteredCompanies.length}</span> results
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 ring-1 ring-inset ring-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all text-slate-700"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 ring-1 ring-inset ring-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all text-slate-700"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 font-medium animate-pulse">Loading deal flow...</div>}>
      <CompaniesContent />
    </Suspense>
  );
}