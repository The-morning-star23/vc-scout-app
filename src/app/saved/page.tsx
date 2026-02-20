"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Play, Trash2 } from "lucide-react";

interface SavedSearch {
  id: string;
  query: string;
  date: string;
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem("vc-saved-searches");
      if (saved) setSearches(JSON.parse(saved));
    });
  }, []);

  const deleteSearch = (id: string) => {
    const updated = searches.filter(s => s.id !== id);
    setSearches(updated);
    localStorage.setItem("vc-saved-searches", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">Saved Searches</h1>
      
      {searches.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          No saved searches yet. Go to the Companies page to save your search queries.
        </div>
      ) : (
        <div className="grid gap-4">
          {searches.map((search) => (
            <div key={search.id} className="bg-white border border-gray-200 rounded-lg p-5 flex justify-between items-center hover:shadow-sm transition-shadow">
              <div className="flex items-center gap-3">
                <Search className="text-gray-400" size={20} />
                <div>
                  <p className="font-semibold text-gray-900">&quot;{search.query}&quot;</p>
                  <p className="text-sm text-gray-500">Saved on {search.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link 
                  href={`/companies?search=${encodeURIComponent(search.query)}`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                >
                  <Play size={16} /> Run Search
                </Link>
                <button 
                  onClick={() => deleteSearch(search.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  aria-label="Delete search"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}