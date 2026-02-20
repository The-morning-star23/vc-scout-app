"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { mockCompanies } from "@/data/mockCompanies";
import { Search, Filter, ChevronLeft, ChevronRight, BookmarkPlus } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
      </div>
      
      <div className="flex gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search companies or descriptions..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button 
          onClick={handleSaveSearch}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
        >
          <BookmarkPlus size={18} />
          <span>Save Search</span>
        </button>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
              <th className="p-4">Name</th>
              <th className="p-4">Description</th>
              <th className="p-4">Signals</th>
              <th className="p-4">Added</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCompanies.map((company) => (
              <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <Link href={`/companies/${company.id}`} className="font-semibold text-blue-600 hover:underline">
                    {company.name}
                  </Link>
                  <div className="text-sm text-gray-500">{company.domain}</div>
                </td>
                <td className="p-4 text-gray-700">{company.description}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {company.signals.map((signal, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                        {signal}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{company.addedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCompanies.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No companies found matching your search.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} of {filteredCompanies.length}
          </span>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompaniesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Loading companies...</div>}>
      <CompaniesContent />
    </Suspense>
  );
}