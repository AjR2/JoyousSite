// Secure contact form API endpoint
// File: /api/contact.js

import config from './utils/config.js';
import { securityMiddleware, validateInput, sanitizeInput } from './utils/security.js';

// Contact form validation schema
const CONTACT_SCHEMA = {
  name: { type: 'name', required: true, minLength: 2, maxLength: 50 },
  email: { type: 'email', required: true, minLength: 5, maxLength: 254 },
  subject: { type: 'text', required: true, minLength: 5, maxLength: 100 },
  message: { type: 'text', required: true, minLength: 10, maxLength: 1000 }
};

// Validate contact form data
function validateContactForm(data) {
  const errors = {};
  const sanitized = {};

  for (const [field, rules] of Object.entries(CONTACT_SCHEMA)) {
    const value = data[field];
    
    // Check if required field is missing
    if (rules.required && (!value || value.trim() === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if field is not required and empty
    if (!rules.required && (!value || value.trim() === '')) {
      sanitized[field] = '';
      continue;
    }

    // Validate and sanitize
    const validation = validateInput(value, rules.type, rules.required);
    if (!validation.valid) {
      errors[field] = validation.error;
    } else {
      sanitized[field] = validation.value;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitized
  };
}

// Send email using EmailJS (server-side simulation)
async function sendContactEmail(formData) {
  // In a real implementation, you would use a server-side email service
  // This is a placeholder for the email sending logic
  
  const emailData = {
    to: process.env.CONTACT_EMAIL || 'contact@akeyreu.com',
    from: formData.email,
    subject: `Contact Form: ${formData.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Subject:</strong> ${formData.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>Sent from Akeyreu contact form at ${new Date().toISOString()}</small></p>
    `,
    text: `
      New Contact Form Submission
      
      Name: ${formData.name}
      Email: ${formData.email}
      Subject: ${formData.subject}
      
      Message:
      ${formData.message}
      
      Sent from Akeyreu contact form at ${new Date().toISOString()}
    `
  };

  // Simulate email sending (replace with actual email service)
  console.log('Email would be sent:', emailData);
  
  // For demo purposes, we'll just return success
  // In production, integrate with services like SendGrid, AWS SES, etc.
  return { success: true, messageId: `msg_${Date.now()}` };
}

// Log contact form submission for analytics/security
function logContactSubmission(req, formData, success) {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    origin: req.headers.origin,
    success,
    formData: {
      name: formData.name,
      email: formData.email,
      subject: formData.subject,
      messageLength: formData.message?.length || 0
    }
  };

  // In production, send to logging service
  console.log('Contact form submission:', logData);
}

export default async function handler(req, res) {
  // Apply security middleware with strict rate limiting for contact forms
  const securityResult = securityMiddleware(req, res, {
    rateLimit: 'strict', // More restrictive for contact forms
    requireOrigin: config.security.requireOriginValidation,
    allowedMethods: ['POST', 'OPTIONS'],
    environment: config.environment
  });

  if (securityResult.error) {
    return res.status(securityResult.status).json({ 
      error: securityResult.error,
      timestamp: new Date().toISOString()
    });
  }

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests for form submission
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed. Use POST to submit contact form.',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Check content type
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Content-Type must be application/json',
        timestamp: new Date().toISOString()
      });
    }

    // Check request size
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > config.security.maxRequestSize) {
      return res.status(413).json({
        error: 'Request too large',
        timestamp: new Date().toISOString()
      });
    }

    // Parse and validate request body
    const body = req.body;
    if (!body || typeof body !== 'object') {
      return res.status(400).json({
        error: 'Invalid request body',
        timestamp: new Date().toISOString()
      });
    }

    // Validate contact form data
    const validation = validateContactForm(body);
    if (!validation.isValid) {
      logContactSubmission(req, body, false);
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors,
        timestamp: new Date().toISOString()
      });
    }

    // Check for spam indicators (basic honeypot and timing)
    const submissionTime = Date.now();
    const formStartTime = parseInt(body._formStartTime || '0');
    const timeDiff = submissionTime - formStartTime;
    
    // Form submitted too quickly (likely bot)
    if (formStartTime && timeDiff < 3000) { // Less than 3 seconds
      logContactSubmission(req, validation.data, false);
      return res.status(429).json({
        error: 'Form submitted too quickly. Please try again.',
        timestamp: new Date().toISOString()
      });
    }

    // Honeypot field check (should be empty)
    if (body.website || body.url || body.phone) {
      logContactSubmission(req, validation.data, false);
      return res.status(400).json({
        error: 'Invalid form submission',
        timestamp: new Date().toISOString()
      });
    }

    // Send email
    const emailResult = await sendContactEmail(validation.data);
    
    if (!emailResult.success) {
      logContactSubmission(req, validation.data, false);
      return res.status(500).json({
        error: 'Failed to send message. Please try again later.',
        timestamp: new Date().toISOString()
      });
    }

    // Log successful submission
    logContactSubmission(req, validation.data, true);

    // Return success response (don't expose internal details)
    return res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully. We\'ll get back to you soon!',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    return res.status(500).json({
      error: 'Internal server error. Please try again later.',
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    });
  }
}
