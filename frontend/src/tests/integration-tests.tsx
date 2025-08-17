import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../pages/Dashboard';
import PropertyDetail from '../pages/PropertyDetail';
import SellProperty from '../pages/SellProperty';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import AdminBookings from '../pages/AdminBookings';
import AdminProperties from '../pages/AdminProperties';
import AdminUsers from '../pages/AdminUsers';
import AdminDealerRequests from '../pages/AdminDealerRequests';
import AdminDealerTree from '../pages/AdminDealerTree';
import AdminNotifications from '../pages/AdminNotifications';
import DealerSignup from '../pages/DealerSignup';
import BecomeDealer from '../pages/BecomeDealer';
import MyProperties from '../pages/MyProperties';
import About from '../pages/About';
import TestLogin from '../pages/TestLogin';
import BookingModal from '../components/BookingModal';
import PropertyCard from '../components/property/PropertyCard';
import PropertyFilters from '../components/property/PropertyFilters';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import DebugInfo from '../components/DebugInfo';

// Mock API calls
jest.mock('../services/api', () => ({
  propertiesApi: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getTypes: jest.fn(),
    getLocations: jest.fn(),
  },
  authApi: {
    login: jest.fn(),
    signup: jest.fn(),
    getProfile: jest.fn(),
    dealerSignup: jest.fn(),
    applyForDealer: jest.fn(),
    updateProfile: jest.fn(),
    uploadProfilePic: jest.fn(),
    uploadAadhaarImage: jest.fn(),
    changePassword: jest.fn(),
    logout: jest.fn(),
  },
  bookingsApi: {
    createBooking: jest.fn(),
    getMyBookings: jest.fn(),
    getAllBookings: jest.fn(),
    getById: jest.fn(),
    cancel: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    unbook: jest.fn(),
  },
  adminApi: {
    getDashboard: jest.fn(),
    getPropertyAnalytics: jest.fn(),
    getBookingAnalytics: jest.fn(),
    getDealerAnalytics: jest.fn(),
    getRecentActivity: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    getDealerRequests: jest.fn(),
    approveDealer: jest.fn(),
    rejectDealer: jest.fn(),
    getDealerTree: jest.fn(),
    blockUser: jest.fn(),
    unblockUser: jest.fn(),
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    uploadUserProfilePic: jest.fn(),
    uploadUserAadhaarImage: jest.fn(),
  },
  dealersApi: {
    getCommissions: jest.fn(),
    getHierarchy: jest.fn(),
    getStats: jest.fn(),
    getByReferralCode: jest.fn(),
    getTree: jest.fn(),
  },
  commissionApi: {
    getConfig: jest.fn(),
    updateConfig: jest.fn(),
    getPendingDealers: jest.fn(),
    approveDealer: jest.fn(),
    calculateCommissions: jest.fn(),
  },
  notificationsApi: {
    getAll: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    getUnreadCount: jest.fn(),
    cleanup: jest.fn(),
  },
}));

// Test utilities
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

const renderWithAuth = (component: React.ReactElement, userData?: any) => {
  // Mock localStorage
  const mockUser = userData || {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'USER'
  };
  
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('token', 'test-token');
  
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Test data
const mockProperty = {
  id: 'test-property-id',
  title: 'Test Property',
  description: 'This is a test property',
  type: 'HOUSE',
  location: 'Test City',
  address: '123 Test Street',
  price: 500000,
  status: 'FREE',
  mediaUrls: ['/uploads/properties/test-image.jpg'],
  owner: {
    id: 'test-owner-id',
    name: 'Test Owner',
    email: 'owner@test.com'
  },
  createdAt: new Date().toISOString()
};

const mockBooking = {
  id: 'test-booking-id',
  property: mockProperty,
  user: {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com'
  },
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'PENDING',
  totalAmount: 300,
  paymentRef: 'TEST_PAYMENT_REF',
  createdAt: new Date().toISOString()
};

// Test suite
describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Public Pages', () => {
    test('Home page renders correctly', async () => {
      renderWithRouter(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/Find Your Dream Property/i)).toBeInTheDocument();
      });
    });

    test('Login page renders and handles form submission', async () => {
      renderWithRouter(<Login />);
      
      // Check if login form elements are present
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      
      // Test form submission
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
      });
    });

    test('Signup page renders and handles form submission', async () => {
      renderWithRouter(<Signup />);
      
      // Check if signup form elements are present
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
      
      // Test form submission
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
      });
    });

    test('About page renders correctly', async () => {
      renderWithRouter(<About />);
      
      await waitFor(() => {
        expect(screen.getByText(/about us/i)).toBeInTheDocument();
      });
    });

    test('Property detail page renders correctly', async () => {
      // Mock the API response
      const { propertiesApi } = require('../services/api');
      propertiesApi.getById.mockResolvedValue({
        data: { success: true, data: mockProperty }
      });
      
      renderWithRouter(<PropertyDetail />);
      
      await waitFor(() => {
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
      });
    });
  });

  describe('Authenticated Pages', () => {
    test('Dashboard renders correctly for authenticated user', async () => {
      renderWithAuth(<Dashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });

    test('Profile page renders and handles form updates', async () => {
      renderWithAuth(<Profile />);
      
      await waitFor(() => {
        expect(screen.getByText(/profile/i)).toBeInTheDocument();
      });
      
      // Test profile update form
      const nameInput = screen.getByLabelText(/name/i);
      if (nameInput) {
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        expect(nameInput).toHaveValue('Updated Name');
      }
    });

    test('Sell Property page renders and handles form submission', async () => {
      renderWithAuth(<SellProperty />);
      
      await waitFor(() => {
        expect(screen.getByText(/sell property/i)).toBeInTheDocument();
      });
      
      // Test form elements
      const titleInput = screen.getByLabelText(/title/i);
      if (titleInput) {
        fireEvent.change(titleInput, { target: { value: 'New Property' } });
        expect(titleInput).toHaveValue('New Property');
      }
    });

    test('My Properties page renders correctly', async () => {
      renderWithAuth(<MyProperties />);
      
      await waitFor(() => {
        expect(screen.getByText(/my properties/i)).toBeInTheDocument();
      });
    });

    test('Become Dealer page renders correctly', async () => {
      renderWithAuth(<BecomeDealer />);
      
      await waitFor(() => {
        expect(screen.getByText(/become a dealer/i)).toBeInTheDocument();
      });
    });
  });

  describe('Admin Pages', () => {
    const adminUser = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN'
    };

    test('Admin dashboard renders correctly', async () => {
      renderWithAuth(<Admin />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      });
    });

    test('Admin Bookings page renders correctly', async () => {
      renderWithAuth(<AdminBookings />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/bookings management/i)).toBeInTheDocument();
      });
    });

    test('Admin Properties page renders correctly', async () => {
      renderWithAuth(<AdminProperties />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/properties management/i)).toBeInTheDocument();
      });
    });

    test('Admin Users page renders correctly', async () => {
      renderWithAuth(<AdminUsers />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/user management/i)).toBeInTheDocument();
      });
    });

    test('Admin Dealer Requests page renders correctly', async () => {
      renderWithAuth(<AdminDealerRequests />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/dealer requests/i)).toBeInTheDocument();
      });
    });

    test('Admin Dealer Tree page renders correctly', async () => {
      renderWithAuth(<AdminDealerTree />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/dealer hierarchy/i)).toBeInTheDocument();
      });
    });

    test('Admin Notifications page renders correctly', async () => {
      renderWithAuth(<AdminNotifications />, adminUser);
      
      await waitFor(() => {
        expect(screen.getByText(/notifications/i)).toBeInTheDocument();
      });
    });
  });

  describe('Components', () => {
    test('PropertyCard component renders correctly', () => {
      render(<PropertyCard property={mockProperty} />);
      
      expect(screen.getByText(mockProperty.title)).toBeInTheDocument();
      expect(screen.getByText(`₹${mockProperty.price.toLocaleString()}`)).toBeInTheDocument();
    });

    test('PropertyFilters component renders correctly', () => {
      const mockOnFilterChange = jest.fn();
      render(<PropertyFilters onFilterChange={mockOnFilterChange} />);
      
      expect(screen.getByText(/filters/i)).toBeInTheDocument();
    });

    test('BookingModal component renders correctly', () => {
      const mockOnClose = jest.fn();
      const mockOnSubmit = jest.fn();
      
      render(
        <BookingModal
          property={mockProperty}
          isOpen={true}
          onClose={mockOnClose}
          onSubmit={mockOnSubmit}
        />
      );
      
      expect(screen.getByText(/book property/i)).toBeInTheDocument();
    });

    test('LoadingSpinner component renders correctly', () => {
      render(<LoadingSpinner />);
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('Footer component renders correctly', () => {
      render(<Footer />);
      
      expect(screen.getByText(/© 2024 property platform/i)).toBeInTheDocument();
    });

    test('DebugInfo component renders correctly', () => {
      render(<DebugInfo />);
      
      expect(screen.getByText(/debug info/i)).toBeInTheDocument();
    });
  });

  describe('Layout and Navigation', () => {
    test('Layout component renders with navigation', () => {
      renderWithRouter(<Layout />);
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('Navigation links work correctly', () => {
      renderWithRouter(<Layout />);
      
      const homeLink = screen.getByRole('link', { name: /home/i });
      const aboutLink = screen.getByRole('link', { name: /about/i });
      
      expect(homeLink).toBeInTheDocument();
      expect(aboutLink).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('Login form shows validation errors', async () => {
      renderWithRouter(<Login />);
      
      const submitButton = screen.getByRole('button', { name: /login/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    test('Signup form shows validation errors', async () => {
      renderWithRouter(<Signup />);
      
      const submitButton = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('Shows error message when API call fails', async () => {
      const { authApi } = require('../services/api');
      authApi.login.mockRejectedValue(new Error('Login failed'));
      
      renderWithRouter(<Login />);
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/login failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('Components are responsive', () => {
      // Test with different viewport sizes
      const { rerender } = renderWithRouter(<Home />);
      
      // Test mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Test tablet viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });
      
      window.dispatchEvent(new Event('resize'));
      
      // Test desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      window.dispatchEvent(new Event('resize'));
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('Pages load within acceptable time', async () => {
    const startTime = performance.now();
    
    renderWithRouter(<Home />);
    
    await waitFor(() => {
      expect(screen.getByText(/Find Your Dream Property/i)).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });
});

// Accessibility tests
describe('Accessibility Tests', () => {
  test('All interactive elements have proper ARIA labels', () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(emailInput).toHaveAttribute('aria-label');
    expect(passwordInput).toHaveAttribute('aria-label');
  });

  test('Images have alt text', () => {
    render(<PropertyCard property={mockProperty} />);
    
    const images = screen.getAllByRole('img');
    images.forEach(img => {
      expect(img).toHaveAttribute('alt');
    });
  });

  test('Form elements have proper labels', () => {
    renderWithRouter(<Signup />);
    
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
  });
});

export {};
