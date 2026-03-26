import { useState, useRef } from "react";
import { Plus, Trash2, ExternalLink, RefreshCw, Search, Star, X } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface Api {
  id: string;
  name: string;
  url: string;
  status: "healthy" | "down" | "checking" | "slow";
  avgResponseTime?: number;
  uptime?: number;
  trend?: number;
  lastChecked?: string;
  pinned?: boolean;
  favorite?: boolean;
}

interface ApiManagementProps {
  apis: Api[];
  onDeleteApi: (id: string) => void;
  onCheckApi: (id: string) => void;
  loadingId?: string | null;
  onTogglePin?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  refreshApis?: () => void; // Add refresh function
}

const ApiManagement = ({ 
  apis, 
  onDeleteApi, 
  onCheckApi, 
  loadingId, 
  onTogglePin, 
  onToggleFavorite,
  refreshApis
}: ApiManagementProps) => {
  console.log("ApiManagement component loaded!");
  console.log("Props received:", { apis, onDeleteApi, onCheckApi });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    method: "GET",
    expectedStatus: 200,
  });
  const controllersRef = useRef<Map<number, AbortController>>(new Map());

  const getStatusColor = (api: Api) => {
    switch (api.status) {
      case "down": return "bg-red-500";
      case "slow": return "bg-yellow-400";
      case "checking": return "bg-blue-500";
      default: return "bg-green-500";
    }
  };

  const getStatusLabel = (api: Api) => {
    switch (api.status) {
      case "down": return "DOWN";
      case "slow": return "SLOW";
      case "checking": return "CHECKING";
      default: return "UP";
    }
  };

  const filteredApis = apis.filter(api => 
    api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    api.url.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort pinned APIs first, then favorites
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (a.favorite && !b.favorite) return -1;
    if (!a.favorite && b.favorite) return 1;
    return a.name.localeCompare(b.name);
  });

  const handleSubmit = async () => {
    try {
      // Validate form data
      if (!formData.name.trim() || !formData.url.trim()) {
        toast.error("❌ Please fill in all fields");
        return;
      }

      if (!formData.url.startsWith("http://") && !formData.url.startsWith("https://")) {
        toast.error("❌ URL must start with http:// or https://");
        return;
      }

      // Call backend API
      await axios.post("/api/apis", {
        ...formData,
        active: true,
        intervalSeconds: 30,
      });

      toast.success("✅ API Added Successfully!");
      
      // Reset form and close modal
      setFormData({
        name: "",
        url: "",
        method: "GET",
        expectedStatus: 200,
      });
      setOpen(false);

      // Refresh APIs list
      if (refreshApis) {
        refreshApis();
      } else {
        // Fallback: reload page
        window.location.reload();
      }
    } catch (error) {
      console.error("Error adding API:", error);
      toast.error("❌ Failed to add API");
    }
  };

  const handleCheckApi = async (id: string) => {
    try {
      // Cancel existing request
      const existingController = controllersRef.current.get(parseInt(id));
      if (existingController) {
        existingController.abort();
      }
      
      // Create new controller
      const controller = new AbortController();
      controllersRef.current.set(parseInt(id), controller);
      
      onCheckApi(id);
      
      // Show checking status immediately
      // (This would be handled by parent component)
      
      // Mock response since backend doesn't exist yet
      const mockResponse = await new Promise<Response>((resolve) => {
        setTimeout(() => {
          const mockApi = {
            ...apis.find(api => api.id === id),
            status: Math.random() > 0.3 ? 'healthy' as const : 'down' as const,
            avgResponseTime: Math.floor(Math.random() * 200) + 50,
            uptime: Math.floor(Math.random() * 10) + 90,
            lastChecked: new Date().toISOString(),
          };
          resolve(new Response(JSON.stringify(mockApi), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          }));
        }, 1000 + Math.random() * 1000); // 1-2 second delay
      });
      
      const updatedApi = await mockResponse.json();
      
      toast.success(`✅ ${updatedApi.name} checked successfully!`);
    } catch (err) {
      if (err.message !== "timeout") {
        toast.error(`❌ Failed to check API`);
      }
      console.error("API check error:", err);
    } finally {
      // Clean up
      controllersRef.current.delete(parseInt(id));
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 transition-colors" style={{position: 'relative', zIndex: 1}}>
      {/* DEBUG INFO */}
      <div style={{backgroundColor: 'yellow', padding: '5px', marginBottom: '10px'}}>
        DEBUG: Component loaded. Check if you can see this yellow box.
      </div>
      
      {/* SIMPLE TEST BUTTON */}
      <button 
        onClick={() => alert("SIMPLE TEST WORKING!")}
        style={{
          backgroundColor: 'green', 
          color: 'white', 
          padding: '10px', 
          margin: '10px',
          position: 'relative',
          zIndex: 99999,
          pointerEvents: 'auto',
          cursor: 'pointer',
          border: '2px solid red'
        }}
      >
        SIMPLE TEST BUTTON
      </button>
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">API Management</h2>
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search APIs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              console.log("Add API button clicked!");
              console.log("Current open state:", open);
              setOpen(true);
              console.log("Set open to true");
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Add API
          </button>
        </div>
      </div>

      {/* Add API Modal */}
      {open && (
        <>
          <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999}}>
            <div style={{backgroundColor: 'white', padding: '20px', borderRadius: '8px', margin: '50px auto', width: '300px'}}>
              <h2>TEST MODAL WORKING!</h2>
              <p>Open state: {String(open)}</p>
              <button onClick={() => setOpen(false)}>Close Test</button>
            </div>
          </div>
        </>
      )}

      {/* APIs List */}
      {filteredApis.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No APIs added yet. Add your first API 🚀
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApis.map((api) => (
            <div
              key={api.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex items-center gap-4">
                {/* Pin/Favorite Icons */}
                <div className="flex gap-2">
                  {api.pinned && (
                    <Star className="text-yellow-400 fill-current" size={16} />
                  )}
                  {api.favorite && (
                    <Star className="text-blue-400 fill-current" size={16} />
                  )}
                </div>
                
                <div>
                  <h4 className="font-semibold dark:text-white">{api.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <ExternalLink size={14} />
                    <a
                      href={api.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-500 transition-colors"
                    >
                      {api.url}
                    </a>
                  </div>
                  {api.lastChecked && (
                    <p className="text-xs text-gray-400 mt-1">
                      Last checked: {new Date(api.lastChecked).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {api.avgResponseTime && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {api.avgResponseTime}ms
                  </span>
                )}
                
                {/* Status Badge with Label */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(api)} animate-pulse`}
                  />
                  <span className="text-xs ml-2 text-gray-600 dark:text-gray-400">
                    {getStatusLabel(api)}
                    {api.status === "slow" && (
                      <span className="text-yellow-400"> • Slow response</span>
                    )}
                  </span>
                </div>
                
                <button
                  onClick={() => handleCheckApi(api.id)}
                  disabled={loadingId === api.id}
                  className={`p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors ${
                    loadingId === api.id ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Check API Status"
                >
                  {loadingId === api.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  ) : (
                    <RefreshCw size={16} />
                  )}
                </button>
                
                <button
                  onClick={() => onTogglePin && onTogglePin(api.id)}
                  className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
                  title={api.pinned ? "Unpin API" : "Pin API"}
                >
                  <Star className={api.pinned ? "fill-current" : ""} size={16} />
                </button>
                
                <button
                  onClick={() => onToggleFavorite && onToggleFavorite(api.id)}
                  className="p-2 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
                  title={api.favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Star className={api.favorite ? "fill-current text-blue-400" : ""} size={16} />
                </button>
                
                <button
                  onClick={() => onDeleteApi(api.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                  title="Delete API"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiManagement;
