import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Users, 
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  TreePine,
  User,
  Building2,
  IndianRupee,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { adminApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

interface DealerNode {
  id: string
  user: {
    id: string
    name: string
    email: string
  }
  referralCode: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  commission: number
  children: DealerNode[]
  level: number
  totalChildren: number
  totalCommission: number
}

const AdminDealerTree = () => {
  const navigate = useNavigate()
  const [dealerTree, setDealerTree] = useState<DealerNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [zoom, setZoom] = useState(100)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedDealer, setSelectedDealer] = useState<DealerNode | null>(null)

  useEffect(() => {
    fetchDealerTree()
  }, [])

  const fetchDealerTree = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adminApi.getDealerTree()
      console.log('Dealer tree response:', response)
      
      if (response.data && response.data.data) {
        setDealerTree(response.data.data)
      } else {
        setDealerTree([])
      }
      
    } catch (error: any) {
      console.error('Failed to fetch dealer tree:', error)
      setError(error.response?.data?.error || 'Failed to load dealer tree')
      toast.error('Failed to load dealer tree')
    } finally {
      setLoading(false)
    }
  }

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const expandAll = () => {
    const allNodeIds = new Set<string>()
    const collectNodeIds = (nodes: DealerNode[]) => {
      nodes.forEach(node => {
        allNodeIds.add(node.id)
        if (node.children.length > 0) {
          collectNodeIds(node.children)
        }
      })
    }
    collectNodeIds(dealerTree)
    setExpandedNodes(allNodeIds)
  }

  const collapseAll = () => {
    setExpandedNodes(new Set())
  }

  const filteredTree = dealerTree.filter(node => {
    const matchesSearch = node.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.referralCode?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || node.status === statusFilter
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

  const renderDealerNode = (node: DealerNode, depth: number = 0) => {
    const isExpanded = expandedNodes.has(node.id)
    const hasChildren = node.children.length > 0

    return (
      <div key={node.id} className="mb-2">
        <div 
          className={`
            flex items-center p-3 rounded-lg border cursor-pointer transition-all
            ${selectedDealer?.id === node.id ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200 hover:bg-gray-50'}
            ${depth > 0 ? 'ml-6' : ''}
          `}
          style={{ marginLeft: `${depth * 24}px` }}
          onClick={() => setSelectedDealer(node)}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleNode(node.id)
              }}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          {!hasChildren && <div className="w-6 mr-2" />}

          {/* Dealer Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{node.user.name}</h3>
                  <p className="text-sm text-gray-600">{node.user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{node.commission.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Commission</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {node.totalChildren}
                  </div>
                  <div className="text-xs text-gray-500">Children</div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{node.totalCommission.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(node.status)}`}>
                  {node.status}
                </span>
                
                <div className="text-xs text-gray-500">
                  Level {node.level}
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
              <span>Code: {node.referralCode}</span>
              <span>Children: {node.children.length}</span>
            </div>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div className="mt-2">
            {node.children.map(child => renderDealerNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  const stats = {
    totalDealers: dealerTree.length,
    approvedDealers: dealerTree.filter(d => d.status === 'APPROVED').length,
    pendingDealers: dealerTree.filter(d => d.status === 'PENDING').length,
    totalCommission: dealerTree.reduce((sum, d) => sum + d.totalCommission, 0)
  }

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
            onClick={fetchDealerTree}
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
        <title>Dealer Tree - Admin</title>
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
          <h1 className="text-3xl font-bold text-gray-900">Dealer Tree</h1>
          <p className="text-gray-600 mt-2">
            Visualize the hierarchical structure of dealers and their commissions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Dealers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDealers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approvedDealers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingDealers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Commission</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalCommission.toLocaleString()}</p>
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
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Status Filter */}
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
            
            {/* Tree Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={expandAll}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ChevronDown className="h-4 w-4 mr-1" />
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <ChevronRight className="h-4 w-4 mr-1" />
                Collapse All
              </button>
              <button
                onClick={fetchDealerTree}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Dealer Tree */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Dealer Hierarchy ({filteredTree.length} dealers)
              </h2>
            </div>
            
            {filteredTree.length === 0 ? (
              <div className="text-center py-12">
                <TreePine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Dealers Found</h3>
                <p className="text-gray-600">No dealers match your current filters.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTree.map(node => renderDealerNode(node))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Dealer Details */}
        {selectedDealer && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Dealer Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {selectedDealer.user.name}</div>
                  <div><strong>Email:</strong> {selectedDealer.user.email}</div>
                  <div><strong>Referral Code:</strong> {selectedDealer.referralCode}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedDealer.status)}`}>
                      {selectedDealer.status}
                    </span>
                  </div>
                  <div><strong>Level:</strong> {selectedDealer.level}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Commission Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Direct Commission:</strong> ₹{selectedDealer.commission.toLocaleString()}</div>
                  <div><strong>Total Children:</strong> {selectedDealer.totalChildren}</div>
                  <div><strong>Total Commission:</strong> ₹{selectedDealer.totalCommission.toLocaleString()}</div>
                  <div><strong>Direct Children:</strong> {selectedDealer.children.length}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AdminDealerTree
