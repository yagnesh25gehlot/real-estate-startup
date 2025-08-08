import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Mail,
  User,
  Calendar,
  Search
} from 'lucide-react'
import { adminApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface DealerRequest {
  id: string
  user: {
    id: string
    email: string
    name: string
    createdAt: string
  }
  referralCode: string
  parentId?: string
  createdAt: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
}

const AdminDealerRequests = () => {
  const [dealerRequests, setDealerRequests] = useState<DealerRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [processingRequest, setProcessingRequest] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDealerRequests()
  }, [])

  const fetchDealerRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.getDealerRequests()
      console.log('Dealer requests response:', response)
      
      if (response.data && response.data.data) {
        setDealerRequests(response.data.data)
      } else {
        setDealerRequests([])
      }
      
    } catch (error: any) {
      console.error('Failed to fetch dealer requests:', error)
      setError(error.response?.data?.error || 'Failed to load dealer requests')
      toast.error('Failed to load dealer requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApproveDealer = async (dealerId: string) => {
    if (!window.confirm('Are you sure you want to approve this dealer?')) {
      return
    }
    
    try {
      setProcessingRequest(dealerId)
      await adminApi.approveDealer(dealerId)
      toast.success('Dealer approved successfully')
      
      // Update local state
      setDealerRequests(prev => prev.map(req => 
        req.id === dealerId ? { ...req, status: 'APPROVED' as const } : req
      ))
      
    } catch (error: any) {
      console.error('Failed to approve dealer:', error)
      toast.error('Failed to approve dealer')
    } finally {
      setProcessingRequest(null)
    }
  }

  const handleRejectDealer = async (dealerId: string) => {
    if (!window.confirm('Are you sure you want to reject this dealer?')) {
      return
    }
    
    try {
      setProcessingRequest(dealerId)
      await adminApi.rejectDealer(dealerId)
      toast.success('Dealer rejected successfully')
      
      // Update local state
      setDealerRequests(prev => prev.map(req => 
        req.id === dealerId ? { ...req, status: 'REJECTED' as const } : req
      ))
      
    } catch (error: any) {
      console.error('Failed to reject dealer:', error)
      toast.error('Failed to reject dealer')
    } finally {
      setProcessingRequest(null)
    }
  }

  const filteredRequests = dealerRequests.filter(request => {
    const matchesSearch = request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || request.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />
      case 'REJECTED': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const pendingCount = dealerRequests.filter(req => req.status === 'PENDING').length
  const approvedCount = dealerRequests.filter(req => req.status === 'APPROVED').length
  const rejectedCount = dealerRequests.filter(req => req.status === 'REJECTED').length

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <button 
            onClick={fetchDealerRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>Dealer Requests - Admin</title>
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
          <h1 className="text-3xl font-bold text-gray-900">Dealer Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage dealer applications and approvals
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">{dealerRequests.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, email, or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dealer Requests List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Dealer Requests ({filteredRequests.length})
              </h2>
              <div className="text-sm text-gray-500">
                Showing {filteredRequests.length} of {dealerRequests.length} requests
              </div>
            </div>
            
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Dealer Requests Found</h3>
                <p className="text-gray-600">No dealer requests match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{request.user.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-1" />
                                {request.user.email}
                              </div>
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                Referral: {request.referralCode}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          Applied: {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="ml-6 flex flex-col space-y-2">
                        {/* Action Buttons */}
                        {request.status === 'PENDING' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApproveDealer(request.id)}
                              disabled={processingRequest === request.id}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                            >
                              {processingRequest === request.id ? 'Processing...' : 'Approve'}
                            </button>
                            
                            <button
                              onClick={() => handleRejectDealer(request.id)}
                              disabled={processingRequest === request.id}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                            >
                              {processingRequest === request.id ? 'Processing...' : 'Reject'}
                            </button>
                          </div>
                        )}
                        
                        {request.status === 'APPROVED' && (
                          <span className="text-xs text-green-600 font-medium">✓ Approved</span>
                        )}
                        
                        {request.status === 'REJECTED' && (
                          <span className="text-xs text-red-600 font-medium">✗ Rejected</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchDealerRequests}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminDealerRequests
