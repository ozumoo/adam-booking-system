import { useState, useEffect } from 'react';
import { painterApi, customerApi, bookingApi, Painter, Customer, Booking } from '../services/api';

export default function BookPainter() {
  const [painters, setPainters] = useState<Painter[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedPainter, setSelectedPainter] = useState<Painter | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [booking, setBooking] = useState({
    date: '',
    startTime: '',
    endTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1); // 1: Select painter, 2: Select customer, 3: Book time

  useEffect(() => {
    loadPainters();
    loadCustomers();
  }, []);

  const loadPainters = async () => {
    try {
      const response = await painterApi.getAll();
      setPainters(response.data);
    } catch (error) {
      console.error('Error loading painters:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerApi.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const handlePainterSelect = (painter: Painter) => {
    setSelectedPainter(painter);
    setStep(2);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setStep(3);
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBooking(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPainter || !selectedCustomer) return;

    setLoading(true);
    setMessage('');

    try {
      await bookingApi.create({
        painterId: selectedPainter.id,
        customerId: selectedCustomer.id,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: 'pending'
      });
      
      setMessage('Booking created successfully!');
      setSelectedPainter(null);
      setSelectedCustomer(null);
      setBooking({ date: '', startTime: '', endTime: '' });
      setStep(1);
    } catch (error) {
      setMessage('Error creating booking. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setSelectedPainter(null);
    setSelectedCustomer(null);
    setBooking({ date: '', startTime: '', endTime: '' });
    setStep(1);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Book a Painter</h1>
      
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Select Painter</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Select Customer</span>
          </div>
          <div className={`w-16 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className={`flex items-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Book Time</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Painter */}
      {step === 1 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select a Painter</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {painters.map((painter) => (
              <div
                key={painter.id}
                onClick={() => handlePainterSelect(painter)}
                className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
              >
                <h3 className="font-medium text-gray-900">{painter.name}</h3>
                <p className="text-sm text-gray-600">{painter.specialization}</p>
                <div className="flex items-center mt-2">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">{painter.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Customer */}
      {step === 2 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Select a Customer</h2>
            <button
              onClick={resetSelection}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Painters
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => handleCustomerSelect(customer)}
                className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
              >
                <h3 className="font-medium text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-600">{customer.email}</p>
                <p className="text-sm text-gray-600">{customer.phone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Book Time */}
      {step === 3 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Book Time Slot</h2>
            <button
              onClick={resetSelection}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Start Over
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Selected Painter: {selectedPainter?.name}</h3>
            <p className="text-sm text-gray-600">Specialization: {selectedPainter?.specialization}</p>
            <h3 className="font-medium text-gray-900 mt-2">Selected Customer: {selectedCustomer?.name}</h3>
            <p className="text-sm text-gray-600">{selectedCustomer?.email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={booking.date}
                  onChange={handleBookingChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={booking.startTime}
                  onChange={handleBookingChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={booking.endTime}
                  onChange={handleBookingChange}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Booking...' : 'Create Booking'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
