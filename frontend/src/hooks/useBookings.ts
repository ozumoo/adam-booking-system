import { useState, useEffect } from 'react';
import { bookingApi } from '../services/api';
import type { Booking } from '../services/api';

export const useBookings = (painterId?: number, customerId?: number) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let response;
      if (painterId) {
        response = await bookingApi.getByPainterId(painterId);
      } else if (customerId) {
        response = await bookingApi.getByCustomerId(customerId);
      } else {
        response = await bookingApi.getAll();
      }
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await bookingApi.create(bookingData);
      setBookings(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create booking';
      setError(errorMessage);
      throw err;
    }
  };

  const updateBookingStatus = async (bookingId: number, status: Booking['status']) => {
    try {
      const response = await bookingApi.updateStatus(bookingId, status);
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? response.data : booking
      ));
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update booking status';
      setError(errorMessage);
      throw err;
    }
  };

  const deleteBooking = async (bookingId: number) => {
    try {
      await bookingApi.delete(bookingId);
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete booking';
      setError(errorMessage);
      throw err;
    }
  };

  useEffect(() => {
    loadBookings();
  }, [painterId, customerId]);

  return {
    bookings,
    loading,
    error,
    loadBookings,
    createBooking,
    updateBookingStatus,
    deleteBooking,
  };
};
