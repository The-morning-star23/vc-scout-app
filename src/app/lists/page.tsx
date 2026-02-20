"use client";

import { useState, useEffect } from "react";
import { Download } from "lucide-react";

interface Company {
  id: string;
  name: string;
  domain: string;
  description: string;
  signals: string[];
  addedAt: string;
}

export default function ListsPage() {
  const [lists, setLists] = useState<Record<string, Company[]>>({});

  useEffect(() => {
    Promise.resolve().then(() => {
      const saved = localStorage.getItem("vc-lists");
      if (saved) setLists(JSON.parse(saved));
    });
  }, []);

  const exportList = (listName: string, data: Company[]) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `${listName}.json`;
    link.click();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-900">My Lists</h1>
      
      {Object.keys(lists).length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white border border-gray-200 rounded-lg">
          No lists created yet. Go to a company profile to create one and save companies.
        </div>
      ) : (
        <div className="grid gap-6">
          {Object.entries(lists).map(([listName, companies]) => (
            <div key={listName} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-semibold text-gray-800">{listName}</h2>
                <button 
                  onClick={() => exportList(listName, companies)} 
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <Download size={16} /> 
                  <span>Export JSON</span>
                </button>
              </div>
              <ul className="space-y-3">
                {companies.map((c, idx) => (
                  <li key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-md border border-gray-100">
                    <span className="font-medium text-gray-900">{c.name}</span>
                    <span className="text-sm text-gray-500">{c.domain}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}