import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { tripId, tripData, conciergeFee } = await request.json();

    // Email recipients
    const recipients = [
      'jsn9000@gmail.com',
      'Dejabryant28@gmail.com'
    ];

    // Create email content
    const emailSubject = `New Booking Request: ${tripData.title}`;
    const emailBody = `
New booking request received!

Trip Details:
- Trip ID: ${tripId}
- Title: ${tripData.title}
- Dates: ${tripData.startDate} - ${tripData.endDate}
- Concierge Fee: $${conciergeFee.toFixed(2)}

View trip details at: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/teaser/${tripId}

---
This is an automated notification from the Custom Itinerary Travel system.
    `.trim();

    console.log('Attempting to send email to:', recipients);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Custom Itinerary Travel <onboarding@resend.dev>', // You'll need to update this with your verified domain
      to: recipients,
      subject: emailSubject,
      text: emailBody,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Email sent successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Booking notification sent successfully',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Error sending booking email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send booking notification' },
      { status: 500 }
    );
  }
}
