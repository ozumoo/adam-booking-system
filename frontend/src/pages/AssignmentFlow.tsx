import React, { useState, useEffect } from 'react';

interface Availability {
  id: number;
  painterId: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  painter: {
    id: number;
    name: string;
    rating: string;
    specialization: string;
  };
}

interface BookingRequest {
  id: number;
  painterId: number;
  customerId: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  painter: {
    id: number;
    name: string;
    rating: string;
    specialization: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

interface RecommendedSlot {
  painterId: number;
  painterName: string;
  date: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  reason: string;
  timeDifference: number;
}

const AssignmentFlow: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'painter' | 'customer' | 'painter-bookings' | 'customer-bookings'>('painter');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState<RecommendedSlot[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Form states
  const [availabilityForm, setAvailabilityForm] = useState({
    painterId: 1,
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    customerId: 1
  });

  const [bookingFormLocal, setBookingFormLocal] = useState({
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    loadAvailabilities();
    loadBookings();
  }, []);

  const loadAvailabilities = async () => {
    try {
      const response = await fetch('http://localhost:3000/availability/me');
      const data = await response.json();
      setAvailabilities(data);
    } catch (error) {
      console.error('Error loading availabilities:', error);
    }
  };

  const loadBookings = async () => {
    try {
      const response = await fetch('http://localhost:3000/bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleAvailabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(availabilityForm),
      });

      if (response.ok) {
        setMessage('Availability added successfully!');
        loadAvailabilities();
        setAvailabilityForm({
          painterId: 1,
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '17:00'
        });
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.message || 'Failed to add availability'}`);
      }
    } catch (error) {
      setMessage('Error adding availability');
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:3000/booking-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime
        }),
      });

      const data = await response.json();

      if (response.ok && !data.error) {
        setMessage(`Booking confirmed! Assigned to ${data.painter.name}`);
        loadBookings();
        setBookingForm({ startTime: '', endTime: '', customerId: 1 });
        setBookingFormLocal({ startTime: '', endTime: '' });
        setShowRecommendations(false);
        setRecommendations([]);
      } else {
        setMessage(data.error || 'No painters available for the requested time slot');
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setShowRecommendations(true);
        }
      }
    } catch (error) {
      setMessage('Error creating booking request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Adam Painter Booking System
        </h1>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('painter')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'painter'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Painter: Add Time Slots
              </button>
              <button
                onClick={() => setActiveTab('painter-bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'painter-bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Painter: View Bookings
              </button>
              <button
                onClick={() => setActiveTab('customer')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customer: Request Booking
              </button>
              <button
                onClick={() => setActiveTab('customer-bookings')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'customer-bookings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Customer: My Bookings
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'painter' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Painter Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Painter: Add Available Time Slots
            </h2>
            
            <form onSubmit={handleAvailabilitySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Painter ID
                </label>
                <select
                  value={availabilityForm.painterId}
                  onChange={(e) => setAvailabilityForm({
                    ...availabilityForm,
                    painterId: parseInt(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Alex Rodriguez</option>
                  <option value={2}>Maria Garcia</option>
                  <option value={3}>James Thompson</option>
                  <option value={4}>Lisa Chen</option>
                  <option value={5}>Robert Taylor</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day of Week
                </label>
                <select
                  value={availabilityForm.dayOfWeek}
                  onChange={(e) => setAvailabilityForm({
                    ...availabilityForm,
                    dayOfWeek: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="monday">Monday</option>
                  <option value="tuesday">Tuesday</option>
                  <option value="wednesday">Wednesday</option>
                  <option value="thursday">Thursday</option>
                  <option value="friday">Friday</option>
                  <option value="saturday">Saturday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={availabilityForm.startTime}
                    onChange={(e) => setAvailabilityForm({
                      ...availabilityForm,
                      startTime: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={availabilityForm.endTime}
                    onChange={(e) => setAvailabilityForm({
                      ...availabilityForm,
                      endTime: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Availability'}
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">My Availabilities</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availabilities.map((availability) => (
                  <div key={availability.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{availability.painter.name}</span>
                      <span className="text-sm text-gray-600">{availability.dayOfWeek}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {availability.startTime} - {availability.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer: Request a Time Slot
            </h2>
            
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={bookingFormLocal.startTime}
                  onChange={(e) => {
                    const localValue = e.target.value;
                    setBookingFormLocal({
                      ...bookingFormLocal,
                      startTime: localValue
                    });
                    // Convert to proper ISO format without milliseconds
                    const isoValue = localValue ? new Date(localValue).toISOString().split('.')[0] + 'Z' : '';
                    setBookingForm({
                      ...bookingForm,
                      startTime: isoValue
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={bookingFormLocal.endTime}
                  onChange={(e) => {
                    const localValue = e.target.value;
                    setBookingFormLocal({
                      ...bookingFormLocal,
                      endTime: localValue
                    });
                    // Convert to proper ISO format without milliseconds
                    const isoValue = localValue ? new Date(localValue).toISOString().split('.')[0] + 'Z' : '';
                    setBookingForm({
                      ...bookingForm,
                      endTime: isoValue
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Requesting...' : 'Request Booking'}
              </button>
            </form>

            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">My Bookings</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {bookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{booking.painter.name}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.startTime} - {booking.endTime}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        )}

        {message && (
          <div className={`mt-6 p-4 rounded-md ${
            message.includes('Error') || message.includes('No painters') 
              ? 'bg-red-100 text-red-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        )}

        {message.includes('Time slot selected') && (
          <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Ready to Book
                </h3>
                <p className="text-sm text-blue-700">
                  Click the button below to confirm your booking.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-md p-4 mb-4">
              <div className="text-sm text-gray-600 mb-2">Selected Time Slot:</div>
              <div className="font-medium text-gray-900">
                {bookingFormLocal.startTime && bookingFormLocal.endTime ? (
                  <>
                    {new Date(bookingFormLocal.startTime).toLocaleString()} - {new Date(bookingFormLocal.endTime).toLocaleString()}
                  </>
                ) : (
                  'No time selected'
                )}
              </div>
            </div>
            <button
              onClick={handleBookingSubmit}
              disabled={loading || !bookingForm.startTime || !bookingForm.endTime}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Confirming...' : 'Confirm Booking'}
            </button>
          </div>
        )}

        {showRecommendations && recommendations.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Alternative Time Slots
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              No painters available for your requested time. Here are some alternatives:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{rec.painterName}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {rec.dayOfWeek}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <div className="font-medium">
                      {new Date(rec.date).toLocaleDateString()} at {rec.startTime} - {rec.endTime}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {rec.reason}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const recStartTime = new Date(`${rec.date}T${rec.startTime}:00Z`).toISOString();
                      const recEndTime = new Date(`${rec.date}T${rec.endTime}:00Z`).toISOString();
                      
                      setBookingForm({
                        startTime: recStartTime,
                        endTime: recEndTime,
                        customerId: 1
                      });
                      setBookingFormLocal({
                        startTime: new Date(recStartTime).toISOString().slice(0, 16),
                        endTime: new Date(recEndTime).toISOString().slice(0, 16)
                      });
                      setShowRecommendations(false);
                      setMessage('Time slot selected. Click "Request Booking" to confirm.');
                    }}
                    className="w-full bg-blue-600 text-white py-2 px-3 rounded-md hover:bg-blue-700 text-sm"
                  >
                    Select This Slot
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close Recommendations
              </button>
              <button
                onClick={() => {
                  setBookingForm({ startTime: '', endTime: '', customerId: 1 });
                  setBookingFormLocal({ startTime: '', endTime: '' });
                  setShowRecommendations(false);
                  setMessage('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Try Different Time
              </button>
            </div>
          </div>
        )}

        {/* Painter Bookings Tab */}
        {activeTab === 'painter-bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Painter: View Assigned Bookings
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Painter
              </label>
              <select
                value={availabilityForm.painterId}
                onChange={(e) => setAvailabilityForm({
                  ...availabilityForm,
                  painterId: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Alex Rodriguez</option>
                <option value={2}>Maria Garcia</option>
                <option value={3}>James Thompson</option>
                <option value={4}>Lisa Chen</option>
                <option value={5}>Robert Taylor</option>
              </select>
            </div>

            <div className="space-y-4">
              {bookings
                .filter(booking => booking.painterId === availabilityForm.painterId)
                .map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        Booking #{booking.id}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="mb-1">
                        <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="mb-1">
                        <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="mb-1">
                        <strong>Customer:</strong> {booking.customer.name}
                      </div>
                      <div>
                        <strong>Contact:</strong> {booking.customer.email} | {booking.customer.phone}
                      </div>
                    </div>
                  </div>
                ))}
              
              {bookings.filter(booking => booking.painterId === availabilityForm.painterId).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bookings assigned to this painter yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Customer Bookings Tab */}
        {activeTab === 'customer-bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Customer: My Upcoming Bookings
            </h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Customer
              </label>
              <select
                value={bookingForm.customerId || 1}
                onChange={(e) => setBookingForm({
                  ...bookingForm,
                  customerId: parseInt(e.target.value)
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Customer 1</option>
                <option value={2}>Customer 2</option>
                <option value={3}>Customer 3</option>
              </select>
            </div>

            <div className="space-y-4">
              {bookings
                .filter(booking => booking.customerId === (bookingForm.customerId || 1))
                .map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">
                        Booking #{booking.id}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div className="mb-1">
                        <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="mb-1">
                        <strong>Time:</strong> {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="mb-1">
                        <strong>Painter:</strong> {booking.painter.name}
                      </div>
                      <div>
                        <strong>Specialization:</strong> {booking.painter.specialization}
                      </div>
                    </div>
                  </div>
                ))}
              
              {bookings.filter(booking => booking.customerId === (bookingForm.customerId || 1)).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No bookings found for this customer.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentFlow;
