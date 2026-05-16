'use client'

import { useState, useMemo, useEffect } from 'react'
import { Check, X, Clock, Loader, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { fetchTransfers, updateTransferStatus, type Transfer } from '@/lib/supabase'

const statusColors = {
  pending: 'bg-blue-100 text-blue-700',
  'pending-approval1': 'bg-amber-100 text-amber-700',
  'pending-approval2': 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApprovalsPage() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [approverLevel, setApproverLevel] = useState<1 | 2>(1)

  // Load transfers
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        const transfersData = await fetchTransfers()
        setTransfers(transfersData)
      } catch (err) {
        console.error('Error loading transfers:', err)
        setError('Failed to load approvals. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleApprove = async (transferId: string) => {
    try {
      setSubmitting(true)
      const transfer = transfers.find(t => t.id === transferId)
      if (!transfer) return

      const updatedData: any = {}
      if (approverLevel === 1) {
        updatedData.approver1Status = 'approved'
        updatedData.status = transfer.approver2Status === 'pending' ? 'pending-approval2' : 'completed'
      } else {
        updatedData.approver2Status = 'approved'
        updatedData.status = 'completed'
      }

      await updateTransferStatus(transferId, updatedData)
      
      const updatedTransfers = await fetchTransfers()
      setTransfers(updatedTransfers)
      setActionModal(null)
    } catch (err) {
      console.error('Error approving transfer:', err)
      alert('Failed to approve. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async (transferId: string) => {
    try {
      setSubmitting(true)
      const approverField = approverLevel === 1 ? 'approver1Status' : 'approver2Status'
      
      await updateTransferStatus(transferId, {
        status: 'rejected',
        [approverField]: 'rejected',
        notes: rejectionNote,
      })
      
      const updatedTransfers = await fetchTransfers()
      setTransfers(updatedTransfers)
      setActionModal(null)
      setRejectionNote('')
    } catch (err) {
      console.error('Error rejecting transfer:', err)
      alert('Failed to reject. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter transfers based on tab
  let filteredByTab = transfers
  if (tab === 'pending') {
    filteredByTab = transfers.filter(t => 
      t.status === 'pending-approval1' || t.status === 'pending-approval2'
    )
  } else if (tab === 'approved') {
    filteredByTab = transfers.filter(t => t.status === 'completed')
  } else {
    filteredByTab = transfers.filter(t => t.status === 'rejected')
  }

  // Filter by search
  const filteredTransfers = useMemo(() => {
    return filteredByTab.filter(transfer =>
      transfer.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [filteredByTab, searchTerm])

  const pendingCount = transfers.filter(t => 
    t.status === 'pending-approval1' || t.status === 'pending-approval2'
  ).length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-slate-600">Loading approvals...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Approvals & Requests</h1>
        <p className="text-slate-600 mt-1">Two-level approval workflow for transfer requests</p>
      </div>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('pending')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            tab === 'pending'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Pending Approvals ({pendingCount})
        </button>
        <button
          onClick={() => setTab('approved')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            tab === 'approved'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setTab('rejected')}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition ${
            tab === 'rejected'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Rejected
        </button>
      </div>

      {/* Approver Level Selector (only for Pending) */}
      {tab === 'pending' && (
        <div className="flex gap-2">
          <Button
            variant={approverLevel === 1 ? 'default' : 'outline'}
            onClick={() => setApproverLevel(1)}
            size="sm"
          >
            Approver 1 (Request)
          </Button>
          <Button
            variant={approverLevel === 2 ? 'default' : 'outline'}
            onClick={() => setApproverLevel(2)}
            size="sm"
          >
            Approver 2 (Receiver)
          </Button>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
            <Input
              placeholder="Search by category or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Transfers List */}
      <div className="space-y-3">
        {filteredTransfers.map((transfer) => {
          const isExpanded = expandedId === transfer.id
          const isPending = transfer.status === 'pending-approval1' || transfer.status === 'pending-approval2'
          const statusColor = statusColors[transfer.status as keyof typeof statusColors] || statusColors.pending

          return (
            <Card
              key={transfer.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setExpandedId(isExpanded ? null : transfer.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">{transfer.category.toUpperCase()} Transfer</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${statusColor}`}>
                      {transfer.status === 'pending-approval1' ? 'Awaiting Approver 1' :
                       transfer.status === 'pending-approval2' ? 'Awaiting Approver 2' :
                       transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Requested by {transfer.createdBy} on {transfer.createdDate}
                  </p>
                  
                  {/* Approval Status */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Approver 1:</span>{' '}
                      <span className="font-medium">{transfer.approver1}</span>
                      <span className={`ml-2 text-xs font-semibold ${
                        transfer.approver1Status === 'approved' ? 'text-green-600' :
                        transfer.approver1Status === 'rejected' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {transfer.approver1Status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Approver 2:</span>{' '}
                      <span className="font-medium">{transfer.approver2}</span>
                      <span className={`ml-2 text-xs font-semibold ${
                        transfer.approver2Status === 'approved' ? 'text-green-600' :
                        transfer.approver2Status === 'rejected' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>
                        {transfer.approver2Status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (for Pending) */}
                {isPending && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionModal({ id: transfer.id, action: 'approve' })
                      }}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActionModal({ id: transfer.id, action: 'reject' })
                      }}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 mb-2">Approval Timeline</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        {transfer.approver1Status === 'approved' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : transfer.approver1Status === 'rejected' ? (
                          <X className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-slate-700">
                          Approver 1: {transfer.approver1Status.charAt(0).toUpperCase() + transfer.approver1Status.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {transfer.approver2Status === 'approved' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : transfer.approver2Status === 'rejected' ? (
                          <X className="w-4 h-4 text-red-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-slate-700">
                          Approver 2: {transfer.approver2Status.charAt(0).toUpperCase() + transfer.approver2Status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {transfer.notes && (
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">Notes</p>
                      <p className="text-sm text-slate-700">{transfer.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </Card>
          )
        })}
        {filteredTransfers.length === 0 && (
          <Card className="p-8 text-center text-slate-500">
            No approvals found.
          </Card>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActionModal(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {actionModal.action === 'approve' ? 'Approve Transfer' : 'Reject Transfer'}
            </h2>

            {actionModal.action === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  placeholder="Please provide a reason for rejection..."
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => setActionModal(null)} variant="outline" className="flex-1" disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (actionModal.action === 'approve') {
                    handleApprove(actionModal.id)
                  } else {
                    handleReject(actionModal.id)
                  }
                }}
                disabled={submitting}
                className={`flex-1 ${actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {submitting ? 'Processing...' : (actionModal.action === 'approve' ? 'Approve' : 'Reject')}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
