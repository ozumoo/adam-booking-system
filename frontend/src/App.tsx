import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RegisterPainter from './pages/RegisterPainter';
import RegisterCustomer from './pages/RegisterCustomer';
import BookPainter from './pages/BookPainter';
import PainterSchedule from './pages/PainterSchedule';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-bold text-gray-900">
                  Painter Booking System
                </Link>
              </div>
              <div className="flex items-center space-x-8">
                <Link
                  to="/register-painter"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register Painter
                </Link>
                <Link
                  to="/register-customer"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register Customer
                </Link>
                <Link
                  to="/book-painter"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Book Painter
                </Link>
                <Link
                  to="/painter-schedule"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  View Schedule
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register-painter" element={<RegisterPainter />} />
            <Route path="/register-customer" element={<RegisterCustomer />} />
            <Route path="/book-painter" element={<BookPainter />} />
            <Route path="/painter-schedule" element={<PainterSchedule />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function HomePage() {
  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Painter Booking System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Book professional painters for your home and business needs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <Link
            to="/register-painter"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">🎨</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Register as Painter
            </h3>
            <p className="text-gray-600">
              Join our platform and start accepting painting jobs
            </p>
          </Link>
          <Link
            to="/register-customer"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">👤</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Register as Customer
            </h3>
            <p className="text-gray-600">
              Create an account to book professional painters
            </p>
          </Link>
          <Link
            to="/book-painter"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Book a Painter
            </h3>
            <p className="text-gray-600">
              Find and book available painters for your project
            </p>
          </Link>
          <Link
            to="/painter-schedule"
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="text-3xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              View Schedule
            </h3>
            <p className="text-gray-600">
              Check painter availability and manage bookings
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default App;