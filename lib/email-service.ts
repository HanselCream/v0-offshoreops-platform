// Email notification service
// This file contains functions to handle email notifications
// When Resend is integrated, uncomment the Resend API calls

export interface EmailNotification {
  to: string
  subject: string
  type: 'transfer-request' | 'ppe-expiry' | 'maintenance-overdue' | 'approval-request'
  data: any
}

// Mock email service - logs to console
// Replace with Resend API calls when integrated
export async function sendEmail(notification: EmailNotification): Promise<boolean> {
  try {
    console.log('[Email Service] Sending email:', notification)

    // TODO: Uncomment when Resend integration is added
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notification),
    // })
    // return response.ok

    // For now, just log to simulate sending
    return true
  } catch (error) {
    console.error('[Email Service] Failed to send email:', error)
    return false
  }
}

export function generateTransferRequestEmail(
  toEmail: string,
  fromLocation: string,
  toLocation: string,
  itemsCount: number
) {
  return {
    to: toEmail,
    subject: `New Transfer Request: ${fromLocation} → ${toLocation}`,
    type: 'transfer-request' as const,
    data: {
      fromLocation,
      toLocation,
      itemsCount,
    },
  }
}

export function generatePPEExpiryEmail(
  toEmail: string,
  itemName: string,
  expiryDate: string,
  daysLeft: number
) {
  return {
    to: toEmail,
    subject: daysLeft <= 0 ? `EXPIRED: ${itemName}` : `Expiring Soon: ${itemName}`,
    type: 'ppe-expiry' as const,
    data: {
      itemName,
      expiryDate,
      daysLeft,
      isExpired: daysLeft <= 0,
    },
  }
}

export function generateMaintenanceOverdueEmail(
  toEmail: string,
  equipmentName: string,
  daysOverdue: number
) {
  return {
    to: toEmail,
    subject: `Overdue: Maintenance for ${equipmentName}`,
    type: 'maintenance-overdue' as const,
    data: {
      equipmentName,
      daysOverdue,
    },
  }
}

export function generateApprovalRequestEmail(
  toEmail: string,
  requestType: string,
  requestId: string
) {
  return {
    to: toEmail,
    subject: `Approval Required: ${requestType} Request #${requestId}`,
    type: 'approval-request' as const,
    data: {
      requestType,
      requestId,
    },
  }
}

// Email template HTML generators
export function getTransferRequestEmailHTML(data: any): string {
  return `
    <h2>New Transfer Request</h2>
    <p>A new transfer request has been created:</p>
    <ul>
      <li>From: <strong>${data.fromLocation}</strong></li>
      <li>To: <strong>${data.toLocation}</strong></li>
      <li>Items: <strong>${data.itemsCount}</strong></li>
    </ul>
    <p>Please log in to OffshoreOps to review and approve this request.</p>
  `
}

export function getPPEExpiryEmailHTML(data: any): string {
  const status = data.isExpired ? 'EXPIRED' : 'EXPIRING SOON'
  return `
    <h2>${status}: ${data.itemName}</h2>
    <p style="color: ${data.isExpired ? 'red' : 'orange'};">
      <strong>${data.itemName}</strong> is ${data.isExpired ? 'expired' : `expiring in ${data.daysLeft} days`}.
    </p>
    <p>Expiry Date: <strong>${data.expiryDate}</strong></p>
    <p>Please replace or dispose of this item immediately.</p>
  `
}

export function getMaintenanceOverdueEmailHTML(data: any): string {
  return `
    <h2>Overdue Maintenance: ${data.equipmentName}</h2>
    <p style="color: red;">
      Maintenance for <strong>${data.equipmentName}</strong> is <strong>${data.daysOverdue} days overdue</strong>.
    </p>
    <p>Please schedule and complete the maintenance immediately.</p>
  `
}

export function getApprovalRequestEmailHTML(data: any): string {
  return `
    <h2>Approval Required</h2>
    <p>A new <strong>${data.requestType}</strong> request requires your approval:</p>
    <p>Request ID: <strong>${data.requestId}</strong></p>
    <p>Please log in to OffshoreOps to review and take action on this request.</p>
  `
}
