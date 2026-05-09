'use client'

import { useState, useMemo } from 'react'
import { Download, Check, X, AlertCircle } from 'lucide-react'
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
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function ApprovalsPage() {
  const [approvalList, setApprovalList] = useState(approvals)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [actionModal, setActionModal] = useState<{ id: string; action: 'approve' | 'reject' } | null>(null)
  const [rejectionNote, setRejectionNote] = useState('')

  const handleApprove = (id: string) => {
    setApprovalList(approvalList.map(a => 
      a.id === id ? {...a, status: 'approved' as const, approvedBy: 'Current User', approvalDate: new Date().toISOString().split('T')[0]} : a
    ))
    setActionModal(null)
  }

  const handleReject = (id: string) => {
    setApprovalList(approvalList.map(a => 
      a.id === id ? {...a, status: 'rejected' as const, approvedBy: 'Current User', approvalDate: new Date().toISOString().split('T')[0], notes: rejectionNote} : a
    ))
    setActionModal(null)
    setRejectionNote('')
  }

  const filteredApprovals = useMemo(() => {
    return approvalList.filter((approval) => {
      const matchesSearch =
        approval.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        approval.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = selectedStatus === 'all' || approval.status === selectedStatus
      const matchesType = selectedType === 'all' || approval.type === selectedType

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchTerm, selectedStatus, selectedType])

  const handleExport = () => {
    const csv = [
      ['Request ID', 'Type', 'Status', 'Requested By', 'Requested Date', 'Approver Level'],
      ...filteredApprovals.map((approval) => [
        approval.requestId,
        typeLabels[approval.type],
        approval.status,
        approval.requestedBy,
        approval.requestedDate,
        `Level ${approval.approverLevel}`,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'approvals.csv'
    a.click()
  }

  const pendingCount = approvalList.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Approvals</h1>
          <p className="text-slate-600 mt-1">Manage approval workflows</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </div>

      {/* Alert Card */}
      {pendingCount > 0 && (
        <Card className="p-4 border-l-4 border-l-amber-500 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Pending Approvals</h3>
              <p className="text-amber-700 text-sm mt-1">
                {pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting your approval
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Request ID or requester..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Types</option>
              <option value="transfer">Transfer Request</option>
              <option value="ppe-disposal">PPE Disposal</option>
              <option value="maintenance">Maintenance Request</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="text-sm text-slate-600">
        Showing {filteredApprovals.length} of {approvalList.length} approvals
      </div>

      {/* Approvals List */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card key={approval.id} className="overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(expandedId === approval.id ? null : approval.id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900">
                      Request #{approval.requestId}
                    </h3>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                      {typeLabels[approval.type]}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors[approval.status]}`}>
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    <p>Requested by {approval.requestedBy} on {approval.requestedDate}</p>
                    <p>Approver Level: {approval.approverLevel}</p>
                  </div>
                </div>

                {approval.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="gap-2 bg-green-600 hover:bg-green-700"
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
                      className="gap-2 text-red-600"
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
            {expandedId === approval.id && (
              <div className="border-t border-border p-4 bg-slate-50">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Request ID</p>
                    <p className="font-semibold text-slate-900">{approval.requestId}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Type</p>
                    <p className="font-semibold text-slate-900">{typeLabels[approval.type]}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Status</p>
                    <p className="font-semibold text-slate-900">
                      {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600">Requested By</p>
                    <p className="font-semibold text-slate-900">{approval.requestedBy}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Requested Date</p>
                    <p className="font-semibold text-slate-900">{approval.requestedDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Approver Level</p>
                    <p className="font-semibold text-slate-900">Level {approval.approverLevel}</p>
                  </div>
                  {approval.approvedBy && (
                    <>
                      <div>
                        <p className="text-slate-600">Approved By</p>
                        <p className="font-semibold text-slate-900">{approval.approvedBy}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Approval Date</p>
                        <p className="font-semibold text-slate-900">{approval.approvalDate}</p>
                      </div>
                    </>
                  )}
                  {approval.notes && (
                    <div className="md:col-span-3">
                      <p className="text-slate-600">Notes</p>
                      <p className="font-semibold text-slate-900">{approval.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setActionModal(null)}>
          <Card className="w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {actionModal.action === 'approve' ? 'Approve Request' : 'Reject Request'}
            </h2>
            <div className="space-y-4">
              {actionModal.action === 'reject' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Rejection Note (Optional)
                  </label>
                  <textarea
                    placeholder="Enter reason for rejection..."
                    value={rejectionNote}
                    onChange={(e) => setRejectionNote(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-md min-h-24"
                  />
                </div>
              )}
              <p className="text-sm text-slate-600">
                Are you sure you want to {actionModal.action} this request?
              </p>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setActionModal(null)}
                  variant="outline"
                  className="flex-1"
                >
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
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
