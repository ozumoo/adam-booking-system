import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Painter {
  id: number;
  name: string;
  rating: number;
  specialization: string;
  createdAt: string;
  updatedAt: string;
}

export interface Availability {
  id: number;
  painterId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  painterId: number;
  customerId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  painter?: Painter;
  customer?: Customer;
}

// Customer API
export const customerApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: number) => api.get<Customer>(`/customers/${id}`),
  create: (data: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Customer>('/customers', data),
  update: (id: number, data: Partial<Customer>) => 
    api.patch<Customer>(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

// Painter API
export const painterApi = {
  getAll: (specialization?: string) => 
    api.get<Painter[]>('/painters', { params: { specialization } }),
  getById: (id: number) => api.get<Painter>(`/painters/${id}`),
  create: (data: Omit<Painter, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Painter>('/painters', data),
  update: (id: number, data: Partial<Painter>) => 
    api.patch<Painter>(`/painters/${id}`, data),
  delete: (id: number) => api.delete(`/painters/${id}`),
};

// Availability API
export const availabilityApi = {
  getAll: () => api.get<Availability[]>('/availabilities'),
  getById: (id: number) => api.get<Availability>(`/availabilities/${id}`),
  getByPainterId: (painterId: number) => 
    api.get<Availability[]>(`/availabilities/painter/${painterId}`),
  create: (data: Omit<Availability, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Availability>('/availabilities', data),
  update: (id: number, data: Partial<Availability>) => 
    api.patch<Availability>(`/availabilities/${id}`, data),
  delete: (id: number) => api.delete(`/availabilities/${id}`),
  deleteByPainterId: (painterId: number) => 
    api.delete(`/availabilities/painter/${painterId}`),
};

// Booking API
export const bookingApi = {
  getAll: () => api.get<Booking[]>('/bookings'),
  getById: (id: number) => api.get<Booking>(`/bookings/${id}`),
  getByPainterId: (painterId: number) => 
    api.get<Booking[]>(`/bookings/painter/${painterId}`),
  getByCustomerId: (customerId: number) => 
    api.get<Booking[]>(`/bookings/customer/${customerId}`),
  create: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<Booking>('/bookings', data),
  createWithRecommendations: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<any>('/bookings/with-recommendations', data),
  createWithPrioritization: (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>, criteria?: any) => 
    api.post<any>('/bookings/with-prioritization', { ...data, criteria }),
  getPrioritization: (date: string, startTime: string, endTime: string, criteria?: any) => {
    const queryParams = new URLSearchParams();
    queryParams.append('date', date);
    queryParams.append('startTime', startTime);
    queryParams.append('endTime', endTime);
    
    if (criteria) {
      if (criteria.urgency) queryParams.append('urgency', criteria.urgency);
      if (criteria.jobType) queryParams.append('jobType', criteria.jobType);
      if (criteria.location) queryParams.append('location', criteria.location);
      if (criteria.preferredSkills && criteria.preferredSkills.length > 0) {
        criteria.preferredSkills.forEach((skill: string) => {
          queryParams.append('preferredSkills', skill);
        });
      }
    }
    
    return api.get<any>(`/bookings/smart-painters?${queryParams.toString()}`);
  },
  updateStatus: (id: number, status: Booking['status']) => 
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/bookings/${id}`),
};

export default api;
