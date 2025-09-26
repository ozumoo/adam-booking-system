import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Availability {
  id: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  painter?: {
    id: number;
    name: string;
    rating: number;
  };
  customer?: {
    id: number;
    name: string;
    email: string;
  };
}

export const Dashboard: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Painter form state
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00'
  });

  // Customer form state
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    if (user) {
      if (user.role === 'painter') {
        setActiveTab('availability');
        loadAvailabilities();
        loadBookings();
      } else {
        setActiveTab('book');
        loadBookings();
      }
    }
  }, [user]);

  const loadAvailabilities = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3000/availability/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailabilities(data);
      }
    } catch (error) {
      console.error('Error loading availabilities:', error);
    }
  };

  const loadBookings = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('http://localhost:3000/bookings/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(availabilityForm)
      });

      if (response.ok) {
        setMessage('✅ Availability added successfully!');
        setAvailabilityForm({ dayOfWeek: 'monday', startTime: '09:00', endTime: '17:00' });
        loadAvailabilities();
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.message}`);
      }
    } catch (error) {
      setMessage('❌ Error adding availability');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3000/booking-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingForm)
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.bookingId) {
          setMessage(`✅ Booking confirmed! Painter: ${data.painter.name}`);
          setBookingForm({ startTime: '', endTime: '' });
          setShowRecommendations(false);
          setRecommendations([]);
          loadBookings();
        } else if (data.error) {
          setMessage(`❌ ${data.error} Check the recommendations below for alternative time slots.`);
          if (data.recommendations && data.recommendations.length > 0) {
            setRecommendations(data.recommendations);
            setShowRecommendations(true);
          }
        }
      } else {
        setMessage(`❌ Error: ${data.message}`);
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
          setShowRecommendations(true);
        }
      }
    } catch (error) {
      setMessage('❌ Error creating booking request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user.name}!
              </h1>
              <p className="text-gray-600 capitalize">
                {user.role} Dashboard
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {user.role === 'painter' ? (
                <>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'availability'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Add Availability
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'bookings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    My Bookings
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('book')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'book'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Request Booking
                  </button>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'bookings'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    My Bookings
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Content */}
        {user.role === 'painter' && activeTab === 'availability' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Add Available Time Slot
              </h2>
              <form onSubmit={handleAddAvailability} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                  <select
                    value={availabilityForm.dayOfWeek}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, dayOfWeek: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={availabilityForm.startTime}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, startTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="time"
                    value={availabilityForm.endTime}
                    onChange={(e) => setAvailabilityForm({...availabilityForm, endTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Adding...' : 'Add Availability'}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                My Availability
              </h2>
              <div className="space-y-2">
                {availabilities.map((av) => (
                  <div key={av.id} className="p-3 bg-gray-50 rounded-md">
                    <div className="font-medium capitalize">{av.dayOfWeek}</div>
                    <div className="text-sm text-gray-600">
                      {av.startTime} - {av.endTime}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {user.role === 'customer' && activeTab === 'book' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Request a Booking
              </h2>
              <form onSubmit={handleBookingRequest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.startTime}
                    onChange={(e) => setBookingForm({...bookingForm, startTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Time</label>
                  <input
                    type="datetime-local"
                    value={bookingForm.endTime}
                    onChange={(e) => setBookingForm({...bookingForm, endTime: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? 'Requesting...' : 'Request Booking'}
                </button>
              </form>
            </div>

            {/* Recommendations Section */}
            {showRecommendations && recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🎨 Alternative Time Slots Available
                </h3>
                <p className="text-gray-600 mb-4">
                  No painters are available for your requested time slot, but here are the closest available options:
                </p>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-lg">{rec.painterName}</span>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                              ⭐ {rec.painterRating}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            📅 {new Date(rec.date).toLocaleDateString()} ({rec.dayOfWeek})
                          </div>
                          <div className="text-sm text-gray-600 mb-2">
                            🕐 {rec.startTime} - {rec.endTime}
                          </div>
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {rec.reason} ({rec.timeDifference} minutes difference)
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            // Auto-fill the form with recommended time
                            const recommendedDateTime = `${rec.date}T${rec.startTime}`;
                            const endDateTime = `${rec.date}T${rec.endTime}`;
                            setBookingForm({
                              startTime: recommendedDateTime,
                              endTime: endDateTime
                            });
                            setShowRecommendations(false);
                            setRecommendations([]);
                            setMessage('✅ Form updated with recommended time slot. Click "Request Booking" to confirm.');
                          }}
                          className="ml-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                        >
                          Use This Time
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> The system automatically selects the best painter based on ratings and availability. 
                    Click "Use This Time" to accept any recommendation.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {user.role === 'painter' ? 'My Assigned Bookings' : 'My Bookings'}
            </h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-4 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        {user.role === 'painter' 
                          ? `Customer: ${booking.customer?.name}`
                          : `Painter: ${booking.painter?.name}`
                        }
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(booking.date).toLocaleDateString()} at {booking.startTime} - {booking.endTime}
                      </div>
                      <div className="text-sm">
                        Status: <span className="capitalize font-medium">{booking.status}</span>
                      </div>
                    </div>
                    {user.role === 'painter' && booking.painter && (
                      <div className="text-sm text-gray-500">
                        Rating: {booking.painter.rating}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No bookings found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
