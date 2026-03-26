import api from './api';

const API_BASE = '/incidents'; // This will use the configured proxy

export interface Incident {
  id: string;
  apiName: string;
  apiId: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in minutes
  status: 'active' | 'resolved';
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const getIncidents = async (): Promise<Incident[]> => {
  const res = await api.get(API_BASE);
  return res.data;
};

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  try {
    const res = await api.get(`${API_BASE}/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching incident ${id}:`, error);
    return null;
  }
};

export const createIncident = async (incidentData: Omit<Incident, 'id' | 'startTime' | 'duration'>): Promise<Incident> => {
  const res = await api.post(API_BASE, incidentData);
  return res.data;
};

export const updateIncident = async (id: string, incidentData: Partial<Incident>): Promise<Incident | null> => {
  try {
    const res = await api.put(`${API_BASE}/${id}`, incidentData);
    return res.data;
  } catch (error) {
    console.error(`Error updating incident ${id}:`, error);
    return null;
  }
};

export const deleteIncident = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${API_BASE}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting incident ${id}:`, error);
    return false;
  }
};

export const resolveIncident = async (id: string): Promise<Incident | null> => {
  try {
    const res = await api.post(`${API_BASE}/${id}/resolve`);
    return res.data;
  } catch (error) {
    console.error(`Error resolving incident ${id}:`, error);
    return null;
  }
};
