import { useState, useEffect } from 'react';
import { painterApi, bookingApi, Booking } from '../services/api';

export default function PainterSchedule() {
  const [painters, setPainters] = useState<any[]>([]);
  const [selectedPainter, setSelectedPainter] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPainters();
  }, []);

  const loadPainters = async () => {
    try {
      const response = await painterApi.getAll();
      setPainters(response.data);
    } catch (error) {
      console.error('Error loading painters:', error);
    }
  };

  const loadBookings = async (painterId: number) => {
    setLoading(true);
    try {
      const response = await bookingApi.getByPainterId(painterId);
      setBookings(response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePainterSelect = (painter: any) => {
    setSelectedPainter(painter);
    loadBookings(painter.id);
  };

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      await bookingApi.updateStatus(bookingId, status as any);
      if (selectedPainter) {
        loadBookings(selectedPainter.id);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Painter Schedule</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painter Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Select Painter</h2>
            <div className="space-y-2">
              {painters.map((painter) => (
                <button
                  key={painter.id}
                  onClick={() => handlePainterSelect(painter)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPainter?.id === painter.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-medium text-gray-900">{painter.name}</h3>
                  <p className="text-sm text-gray-600">{painter.specialization}</p>
                  <div className="flex items-center mt-1">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm text-gray-600">{painter.rating}/5</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bookings Display */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            {selectedPainter ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">
                    Bookings for {selectedPainter.name}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading bookings...</p>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No bookings found for this painter.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="font-medium text-gray-900">
                                {booking.customer?.name || 'Unknown Customer'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Date:</span> {formatDate(booking.date)}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                              </div>
                              <div>
                                <span className="font-medium">Customer:</span> {booking.customer?.email || 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => updateBookingStatus(booking.id, 'completed')}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700"
                              >
                                Mark Complete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Select a painter to view their schedule.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
