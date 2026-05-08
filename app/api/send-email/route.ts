import { NextRequest, NextResponse } from 'next/server'

// Mock email sending endpoint
// This will be replaced with actual Resend integration

export async function POST(request: NextRequest) {
  try {
    const { to, subject, type, data } = await request.json()

    // Validation
    if (!to || !subject || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('[Email API] Sending email:', { to, subject, type })

    // TODO: Uncomment when Resend integration is added
    // const response = await resend.emails.send({
    //   from: process.env.RESEND_FROM_EMAIL || 'noreply@offshoreops.com',
    //   to,
    //   subject,
    //   html: getEmailTemplate(type, data),
    // })
    //
    // if (response.error) {
    //   return NextResponse.json(
    //     { error: response.error.message },
    //     { status: 500 }
    //   )
    // }

    // Mock response
    return NextResponse.json({
      success: true,
      message: 'Email queued for sending (mock)',
      to,
      subject,
    })
  } catch (error) {
    console.error('[Email API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    )
  }
}

// Email template selector
function getEmailTemplate(type: string, data: any): string {
  switch (type) {
    case 'transfer-request':
      return getTransferRequestTemplate(data)
    case 'ppe-expiry':
      return getPPEExpiryTemplate(data)
    case 'maintenance-overdue':
      return getMaintenanceOverdueTemplate(data)
    case 'approval-request':
      return getApprovalRequestTemplate(data)
    default:
      return '<p>Notification</p>'
  }
}

function getTransferRequestTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e293b; color: white; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .button { background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>OffshoreOps - Transfer Request</h2>
        </div>
        <div class="content">
          <p>A new transfer request has been created:</p>
          <ul>
            <li>From: <strong>${data.fromLocation}</strong></li>
            <li>To: <strong>${data.toLocation}</strong></li>
            <li>Items: <strong>${data.itemsCount}</strong></li>
          </ul>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/transfers" class="button">
              Review Transfer
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getPPEExpiryTemplate(data: any): string {
  const statusColor = data.isExpired ? '#dc2626' : '#ea8b13'
  const statusText = data.isExpired ? 'EXPIRED' : 'EXPIRING SOON'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: ${statusColor}; color: white; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .alert { background-color: #fef2f2; border-left: 4px solid ${statusColor}; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>${statusText}: ${data.itemName}</h2>
        </div>
        <div class="alert">
          <p><strong>${data.itemName}</strong> is ${data.isExpired ? 'expired' : `expiring in ${data.daysLeft} days`}.</p>
          <p>Expiry Date: <strong>${data.expiryDate}</strong></p>
          <p>Please replace or dispose of this item immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getMaintenanceOverdueTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .alert { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Overdue Maintenance: ${data.equipmentName}</h2>
        </div>
        <div class="alert">
          <p>Maintenance for <strong>${data.equipmentName}</strong> is <strong>${data.daysOverdue} days overdue</strong>.</p>
          <p>Please schedule and complete the maintenance immediately.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function getApprovalRequestTemplate(data: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e293b; color: white; padding: 20px; border-radius: 5px; }
        .content { margin: 20px 0; }
        .button { background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>OffshoreOps - Approval Required</h2>
        </div>
        <div class="content">
          <p>A new <strong>${data.requestType}</strong> request requires your approval:</p>
          <p>Request ID: <strong>${data.requestId}</strong></p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/approvals" class="button">
              Review & Approve
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
