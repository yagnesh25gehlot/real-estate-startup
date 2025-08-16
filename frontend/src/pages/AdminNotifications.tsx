import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Bell, 
  Search, 
  Filter, 
  CheckCircle, 
  Circle, 
  Trash2, 
  RefreshCw,
  Eye,
  Building2,
  User,
  CreditCard,
  Users,
  Home,
  Calendar,
  Clock,
  AlertCircle,
  Info,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { notificationsApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

interface Notification {
  id: string;
  type: 'PROPERTY_ADDED' | 'PROPERTY_UPDATED' | 'USER_SIGNUP' | 'BOOKING_CREATED' | 'DEALER_REQUEST';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  adminOnly: boolean;
  createdAt: string;
}

const AdminNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [readFilter, setReadFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, searchTerm, typeFilter, readFilter, dateFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsApi.getAll({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        read: readFilter !== 'ALL' ? (readFilter === 'READ' ? 'true' : 'false') : undefined,
        date: dateFilter !== 'ALL' ? dateFilter : undefined,
      });
      
      setNotifications(response.data.data.notifications || []);
      setTotalPages(response.data.data.totalPages || 1);
      setTotalNotifications(response.data.data.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data.data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      fetchUnreadCount();
      toast.success('Notification marked as read');
    } catch (error: any) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      fetchUnreadCount();
      toast.success('All notifications marked as read');
    } catch (error: any) {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleCleanup = async () => {
    if (window.confirm('This will delete all read notifications older than 30 days. Continue?')) {
      try {
        await notificationsApi.cleanup();
        fetchNotifications();
        toast.success('Old notifications cleaned up');
      } catch (error: any) {
        toast.error('Failed to cleanup notifications');
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PROPERTY_ADDED':
        return <Building2 className="h-5 w-5 text-green-600" />;
      case 'PROPERTY_UPDATED':
        return <Home className="h-5 w-5 text-blue-600" />;
      case 'USER_SIGNUP':
        return <User className="h-5 w-5 text-purple-600" />;
      case 'BOOKING_CREATED':
        return <CreditCard className="h-5 w-5 text-orange-600" />;
      case 'DEALER_REQUEST':
        return <Users className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'PROPERTY_ADDED':
        return 'bg-green-50 border-green-200';
      case 'PROPERTY_UPDATED':
        return 'bg-blue-50 border-blue-200';
      case 'USER_SIGNUP':
        return 'bg-purple-50 border-purple-200';
      case 'BOOKING_CREATED':
        return 'bg-orange-50 border-orange-200';
      case 'DEALER_REQUEST':
        return 'bg-indigo-50 border-indigo-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowDetailsModal(true);
    
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
  };

  const navigateToRelatedItem = (notification: Notification) => {
    if (!notification.data) return;

    switch (notification.type) {
      case 'PROPERTY_ADDED':
      case 'PROPERTY_UPDATED':
        if (notification.data.propertyId) {
          navigate(`/admin/properties`);
          toast.success('Navigated to properties page');
        }
        break;
      case 'BOOKING_CREATED':
        if (notification.data.bookingId) {
          navigate(`/admin/bookings`);
          toast.success('Navigated to bookings page');
        }
        break;
      case 'USER_SIGNUP':
        if (notification.data.userId) {
          navigate(`/admin/users`);
          toast.success('Navigated to users page');
        }
        break;
      case 'DEALER_REQUEST':
        if (notification.data.dealerId) {
          navigate(`/admin/dealer-requests`);
          toast.success('Navigated to dealer requests page');
        }
        break;
    }
    setShowDetailsModal(false);
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(notification => notification.type === typeFilter);
    }

    // Apply read filter
    if (readFilter !== 'ALL') {
      const isRead = readFilter === 'READ';
      filtered = filtered.filter(notification => notification.read === isRead);
    }

    // Apply date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter(notification => 
            new Date(notification.createdAt) >= filterDate
          );
          break;
        case 'WEEK':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter(notification => 
            new Date(notification.createdAt) >= filterDate
          );
          break;
        case 'MONTH':
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter(notification => 
            new Date(notification.createdAt) >= filterDate
          );
          break;
      }
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  if (loading && notifications.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Notifications - Property Platform</title>
      </Helmet>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Manage and monitor all system notifications
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalNotifications}</div>
                <div className="text-sm text-gray-600">Total Notifications</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
                <div className="text-sm text-gray-600">Unread</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Types</option>
                <option value="PROPERTY_ADDED">Property Added</option>
                <option value="PROPERTY_UPDATED">Property Updated</option>
                <option value="USER_SIGNUP">User Signup</option>
                <option value="BOOKING_CREATED">Booking Created</option>
                <option value="DEALER_REQUEST">Dealer Request</option>
              </select>

              {/* Read Filter */}
              <select
                value={readFilter}
                onChange={(e) => setReadFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="UNREAD">Unread</option>
                <option value="READ">Read</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Time</option>
                <option value="TODAY">Today</option>
                <option value="WEEK">This Week</option>
                <option value="MONTH">This Month</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Mark All Read
              </button>
              <button
                onClick={handleCleanup}
                className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Cleanup
              </button>
              <button
                onClick={fetchNotifications}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Notifications ({filteredNotifications.length})
              </h2>
            </div>
            
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">No notifications match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md
                      ${getNotificationColor(notification.type)}
                      ${notification.read ? 'opacity-75' : 'opacity-100'}
                    `}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <Circle className="h-2 w-2 text-blue-600 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToRelatedItem(notification);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Go to related item"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="capitalize">{notification.type.replace('_', ' ').toLowerCase()}</span>
                          <span>{formatDateTime(notification.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {showDetailsModal && selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Notification Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedNotification.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(selectedNotification.createdAt)}
                    </p>
                  </div>
                </div>
                
                {/* Message */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Message</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedNotification.message}
                  </p>
                </div>
                
                {/* Additional Data */}
                {selectedNotification.data && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Additional Information</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                        {JSON.stringify(selectedNotification.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedNotification.read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedNotification.read ? 'Read' : 'Unread'}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">
                      {selectedNotification.type.replace('_', ' ').toLowerCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigateToRelatedItem(selectedNotification)}
                      className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Go to Related Item
                    </button>
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNotifications;
