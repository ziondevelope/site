import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ConfigTabs from "@/components/website/ConfigTabs";

export default function Website() {
  const [activeTab, setActiveTab] = useState("general");
  
  // Fetch website configuration
  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/website/config'],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Configuração do Site</h2>
        <div>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
            <i className="ri-save-line mr-1"></i> Salvar Alterações
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ConfigTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          config={config} 
        />
      )}
    </div>
  );
}
