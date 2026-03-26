import api from "./api";

export interface ApiConfig {
  id: number;
  name: string;
  url: string;
  method?: string;
  expectedStatus?: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiStatus {
  id: number;
  name: string;
  url: string;
  status: string;
  responseTime: number;
}

export const getApis = async (): Promise<ApiConfig[]> => {
  const res = await api.get("/apis");
  return res.data;
};

export const getActiveApis = async (): Promise<ApiConfig[]> => {
  const res = await api.get("/apis/active");
  return res.data;
};

export const getApiById = async (id: number): Promise<ApiConfig | null> => {
  try {
    const res = await api.get(`/apis/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching API ${id}:`, error);
    return null;
  }
};

export const createApi = async (apiData: Omit<ApiConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiConfig> => {
  const res = await api.post("/apis", apiData);
  return res.data;
};

export const updateApi = async (id: number, apiData: Partial<ApiConfig>): Promise<ApiConfig | null> => {
  try {
    const res = await api.put(`/apis/${id}`, apiData);
    return res.data;
  } catch (error) {
    console.error(`Error updating API ${id}:`, error);
    return null;
  }
};

export const deleteApi = async (id: number): Promise<boolean> => {
  try {
    await api.delete(`/apis/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting API ${id}:`, error);
    return false;
  }
};

export const getApiStats = async (): Promise<any> => {
  const res = await api.get("/apis/stats");
  return res.data;
};

export const checkAllApisHealth = async (): Promise<ApiStatus[]> => {
  const res = await api.get("/health");
  return res.data;
};

export const checkApiHealth = async (id: number): Promise<ApiStatus | null> => {
  try {
    const res = await api.get(`/health/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error checking health for API ${id}:`, error);
    return null;
  }
};

export const checkApi = async (id: number): Promise<ApiStatus | null> => {
  try {
    console.log(`🔍 Checking API ${id} at /health/${id}`);
    const res = await api.get(`/health/${id}`);
    console.log(`✅ API ${id} response:`, res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error checking API ${id}:`, error);
    return null;
  }
};
