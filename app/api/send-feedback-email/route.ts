import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { tripId, tripData, feedbackType, message } = await request.json();

    // Email recipients
    const recipients = [
      'jsn9000@gmail.com',
      'Dejabryant28@gmail.com'
    ];

    // Determine subject and email content based on feedback type
    let emailSubject = '';
    let emailHeader = '';

    if (feedbackType === 'edit_request') {
      emailSubject = `Edit Request: ${tripData.title}`;
      emailHeader = 'EDIT REQUEST RECEIVED';
    } else if (feedbackType === 'not_interested') {
      emailSubject = `Not Interested Feedback: ${tripData.title}`;
      emailHeader = 'NOT INTERESTED FEEDBACK';
    }

    const emailBody = `
${emailHeader}

Trip Details:
- Trip ID: ${tripId}
- Title: ${tripData.title}
- Dates: ${tripData.startDate} - ${tripData.endDate}

Customer Message:
${message}

View trip details at: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/teaser/${tripId}

---
This is an automated notification from the Custom Itinerary Travel system.
    `.trim();

    console.log('Attempting to send feedback email to:', recipients);
    console.log('Feedback type:', feedbackType);

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Custom Itinerary Travel <onboarding@resend.dev>',
      to: recipients,
      subject: emailSubject,
      text: emailBody,
    });

    if (error) {
      console.error('Resend error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Feedback email sent successfully:', data);

    return NextResponse.json({
      success: true,
      message: 'Feedback notification sent successfully',
      emailId: data?.id
    });

  } catch (error) {
    console.error('Error sending feedback email:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send feedback notification' },
      { status: 500 }
    );
  }
}
