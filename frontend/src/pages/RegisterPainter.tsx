import { useState } from 'react';
import { painterApi, availabilityApi } from '../services/api';
import type { Availability } from '../services/api';

type AvailabilityFormData = Omit<Availability, 'id' | 'createdAt' | 'updatedAt'>;

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export default function RegisterPainter() {
  const [painter, setPainter] = useState({
    name: '',
    rating: 0,
    specialization: '',
  });
  const [availabilities, setAvailabilities] = useState<AvailabilityFormData[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePainterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPainter(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseFloat(value) : value
    }));
  };

  const addAvailability = () => {
    setAvailabilities(prev => [...prev, {
      painterId: 0, // Will be set after painter creation
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00',
    }]);
  };

  const updateAvailability = (index: number, field: string, value: string) => {
    setAvailabilities(prev => prev.map((av, i) => 
      i === index ? { ...av, [field]: value } : av
    ));
  };

  const removeAvailability = (index: number) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create painter
      const createdPainter = await painterApi.create(painter);
      
      // Create availabilities
      const availabilityPromises = availabilities.map(av => 
        availabilityApi.create({
          ...av,
          painterId: createdPainter.data.id
        })
      );
      
      await Promise.all(availabilityPromises);
      
      setMessage('Painter registered successfully!');
      setPainter({ name: '', rating: 0, specialization: '' });
      setAvailabilities([]);
    } catch (error) {
      setMessage('Error registering painter. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Register as Painter</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Painter Information</h2>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={painter.name}
                onChange={handlePainterChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization
              </label>
              <select
                id="specialization"
                name="specialization"
                value={painter.specialization}
                onChange={handlePainterChange}
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Select specialization</option>
                <option value="Interior Painting">Interior Painting</option>
                <option value="Exterior Painting">Exterior Painting</option>
                <option value="Commercial Painting">Commercial Painting</option>
                <option value="Residential Painting">Residential Painting</option>
                <option value="Decorative Painting">Decorative Painting</option>
              </select>
            </div>

            <div>
              <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
                Rating (0-5)
              </label>
              <input
                type="number"
                id="rating"
                name="rating"
                min="0"
                max="5"
                step="0.1"
                value={painter.rating}
                onChange={handlePainterChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Availability</h2>
            <button
              type="button"
              onClick={addAvailability}
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Add Availability
            </button>
          </div>

          {availabilities.map((availability, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Day</label>
                <select
                  value={availability.dayOfWeek}
                  onChange={(e) => updateAvailability(index, 'dayOfWeek', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                <input
                  type="time"
                  value={availability.startTime}
                  onChange={(e) => updateAvailability(index, 'startTime', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Time</label>
                <input
                  type="time"
                  value={availability.endTime}
                  onChange={(e) => updateAvailability(index, 'endTime', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeAvailability(index)}
                  className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {availabilities.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No availability added yet. Click "Add Availability" to set your working hours.
            </p>
          )}
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
          {loading ? 'Registering...' : 'Register Painter'}
        </button>
      </form>
    </div>
  );
}
