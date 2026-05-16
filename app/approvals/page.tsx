'use client'

import { useState, useMemo } from 'react'
import { Check, X, AlertCircle, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { approvals } from '@/lib/mock-data'

const typeLabels = {
  transfer: 'Transfer Request',
  'ppe-disposal': 'PPE Disposal',
  maintenance: 'Maintenance Request',
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  'pending-approver1': 'bg-blue-100 text-blue-700',
  'pending-approver2': 'bg-purple-100 text-purple-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  'partial-approved': 'bg-orange-100 text-orange-700',
}

export default function ApprovalsPage() {
  const [approvalList, setApprovalList] = useState(approvals)
  const [tab, setTab] = useState<'my-approvals' | 'my-requests' | 'history'>('my-approvals')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')
  const [approverLevel, setApproverLevel] = useState<1 | 2>(1)

  const currentUser = 'Current User'

  const handleApprove = (id: string) => {
    setApprovalList(approvalList.map(a => {
      if (a.id !== id) return a
      
      const updated = { ...a }
      if (approverLevel === 1) {
        updated.approver1Status = 'approved'
        updated.status = a.approver2 ? 'pending-approver2' : 'approved'
      } else {
        updated.approver2Status = 'approved'
        updated.status = 'approved'
      }
      updated.approvalDate = new Date().toISOString().split('T')[0]
      
      return updated
    }))
    setActionModal(null)
  }

  const handleReject = (id: string) => {
    setApprovalList(approvalList.map(a => {
      if (a.id !== id) return a
      return {
        ...a,
        status: 'rejected' as const,
        approvalDate: new Date().toISOString().split('T')[0],
        notes: rejectionNote,
      }
    }))
    setActionModal(null)
    setRejectionNote('')
  }

  const myApprovals = useMemo(() => {
    return approvalList.filter(a => 
      (approverLevel === 1 && a.approver1 === currentUser) ||
      (approverLevel === 2 && a.approver2 === currentUser)
    )
  }, [approvalList, approverLevel])

  const myRequests = useMemo(() => {
    return approvalList.filter(a => a.requestedBy === currentUser)
  }, [approvalList])

  const completedApprovals = useMemo(() => {
    return approvalList.filter(a => a.status === 'approved' || a.status === 'rejected')
  }, [approvalList])

  const dataToDisplay = tab === 'my-approvals' ? myApprovals : tab === 'my-requests' ? myRequests : completedApprovals

  const filteredApprovals = useMemo(() => {
    return dataToDisplay.filter((approval) => {
      const matchesSearch =
        approval.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus
      const matchesType = selectedType === 'all' || approval.type === selectedType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [dataToDisplay, searchTerm, selectedStatus, selectedType])

  const isApprover = tab === 'my-approvals'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Approvals & Requests</h1>
        <p className="text-slate-600">Two-level approval workflow: Approver 1 (Request) → Approver 2 (Receiver)</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setTab('my-approvals')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'my-approvals'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Approvals ({myApprovals.filter(a => a.status === 'pending' || a.status === 'pending-approver1' || a.status === 'pending-approver2').length})
        </button>
        <button
          onClick={() => setTab('my-requests')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'my-requests'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Requests ({myRequests.length})
        </button>
        <button
          onClick={() => setTab('history')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            tab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          History
        </button>
      </div>

      {/* Approver Level Selector (only for My Approvals) */}
      {tab === 'my-approvals' && (
        <div className="flex gap-2">
          <Button
            variant={approverLevel === 1 ? 'default' : 'outline'}
            onClick={() => setApproverLevel(1)}
          >
            Approver 1 (Request)
          </Button>
          <Button
            variant={approverLevel === 2 ? 'default' : 'outline'}
            onClick={() => setApproverLevel(2)}
          >
            Approver 2 (Receiver)
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Input
            placeholder="Search by request ID or requester..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-white"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="pending-approver1">Awaiting Approver 1</option>
          <option value="pending-approver2">Awaiting Approver 2</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-white"
        >
          <option value="all">All Types</option>
          <option value="transfer">Transfer Request</option>
          <option value="ppe-disposal">PPE Disposal</option>
          <option value="maintenance">Maintenance Request</option>
        </select>
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-slate-500">No approvals found</p>
          </Card>
        ) : (
          filteredApprovals.map((approval) => {
            const isExpanded = expandedId === approval.id
            const isPending = approval.status === 'pending' || approval.status === 'pending-approver1' || approval.status === 'pending-approver2'

            return (
              <Card
                key={approval.id}
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(isExpanded ? null : approval.id)}
              >
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-slate-900">{approval.requestId}</h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700">
                          {typeLabels[approval.type as keyof typeof typeLabels] || approval.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[approval.status as keyof typeof statusColors] || statusColors.pending}`}>
                          {approval.status === 'pending' ? 'Pending' : approval.status === 'pending-approver1' ? 'Awaiting Approver 1' : approval.status === 'pending-approver2' ? 'Awaiting Approver 2' : approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Requested by {approval.requestedBy} on {approval.requestDate}
                      </p>
                    </div>

                    {/* Action Buttons (for Approvers) */}
                    {isApprover && isPending && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-green-600 hover:bg-green-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            setActionModal({ id: approval.id, action: 'approve' })
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
                            setActionModal({ id: approval.id, action: 'reject' })
                          }}
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-border space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Request Date</p>
                        <p className="font-semibold">{approval.requestDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Type</p>
                        <p className="font-semibold">{typeLabels[approval.type as keyof typeof typeLabels]}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Approver 1 (Request)</p>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{approval.approver1}</p>
                          {approval.approver1Status && (
                            approval.approver1Status === 'approved' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )
                          )}
                        </div>
                      </div>
                      {approval.approver2 && (
                        <div>
                          <p className="text-slate-600">Approver 2 (Receiver)</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{approval.approver2}</p>
                            {approval.approver2Status && (
                              approval.approver2Status === 'approved' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-red-600" />
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Approval Status Timeline */}
                    <div className="space-y-2 pt-4 border-t border-border">
                      <p className="text-sm font-semibold text-slate-900">Approval Timeline</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          {approval.approver1Status ? (
                            approval.approver1Status === 'approved' ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <X className="w-4 h-4 text-red-600" />
                            )
                          ) : (
                            <Clock className="w-4 h-4 text-slate-400" />
                          )}
                          <span className="text-slate-700">
                            Approver 1: {approval.approver1Status ? (approval.approver1Status === 'approved' ? 'Approved' : 'Rejected') : 'Pending'}
                          </span>
                        </div>
                        {approval.approver2 && (
                          <div className="flex items-center gap-2">
                            {approval.approver2Status ? (
                              approval.approver2Status === 'approved' ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-red-600" />
                              )
                            ) : (
                              <Clock className="w-4 h-4 text-slate-400" />
                            )}
                            <span className="text-slate-700">
                              Approver 2: {approval.approver2Status ? (approval.approver2Status === 'approved' ? 'Approved' : 'Rejected') : 'Pending'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {approval.notes && (
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-semibold text-slate-900 mb-1">Notes</p>
                        <p className="text-sm text-slate-700">{approval.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActionModal(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {actionModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
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
              <Button onClick={() => setActionModal(null)} variant="outline" className="flex-1">
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
                className={`flex-1 ${actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                {actionModal.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
