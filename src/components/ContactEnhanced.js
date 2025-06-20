import React, { useState, useCallback, useRef } from "react";
import emailjs from "emailjs-com";
import { InlineLoader } from "./SkeletonLoader";
import "./Contact.css";

const ContactEnhanced = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null
  const [submitMessage, setSubmitMessage] = useState("");
  const formRef = useRef(null);

  // Validation rules
  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      maxLength: 50,
      pattern: /^[a-zA-Z\s'-]+$/,
      message: "Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes"
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: "Please enter a valid email address"
    },
    subject: {
      required: true,
      minLength: 5,
      maxLength: 100,
      message: "Subject must be between 5-100 characters"
    },
    message: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      message: "Message must be between 10-1000 characters"
    }
  };

  // Validate individual field
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    // Required validation
    if (rules.required && (!value || value.trim() === "")) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === "") return null;

    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} must not exceed ${rules.maxLength} characters`;
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      return rules.message;
    }

    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    return newErrors;
  }, [formData, validateField]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFocus = (e) => {
    const { name } = e.target;
    
    // Clear submit status when user starts typing again
    if (submitStatus) {
      setSubmitStatus(null);
      setSubmitMessage("");
    }
    
    // Clear field error when user focuses (optional UX improvement)
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const formErrors = validateForm();
    setErrors(formErrors);

    // Check if form has errors
    if (Object.keys(formErrors).length > 0) {
      setSubmitStatus('error');
      setSubmitMessage('Please fix the errors above before submitting.');
      
      // Focus first error field
      const firstErrorField = Object.keys(formErrors)[0];
      const errorElement = formRef.current?.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.focus();
      }
      
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);
    setSubmitMessage("");

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      subject: formData.subject,
      to_name: "Akeyreu Team",
      reply_to: formData.email
    };

    try {
      await emailjs.send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_jpewjm8",
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_lmr1i7v",
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "Rc8h7uEQIYsCp9F2L"
      );

      setSubmitStatus('success');
      setSubmitMessage("Thank you! Your message has been sent successfully. We'll get back to you soon.");
      
      // Reset form
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTouched({});
      setErrors({});

    } catch (err) {
      console.error("Failed to send message:", err);
      
      setSubmitStatus('error');
      setSubmitMessage("Something went wrong. Please check your internet connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (fieldName) => {
    let className = "form-field";
    if (errors[fieldName]) className += " form-field--error";
    if (touched[fieldName] && !errors[fieldName]) className += " form-field--valid";
    return className;
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h2>Contact Us</h2>
        <p>Have any questions? Feel free to reach out. We'd love to hear from you!</p>
      </div>

      {submitStatus && (
        <div className={`form-status form-status--${submitStatus}`} role="alert">
          <div className="form-status__icon">
            {submitStatus === 'success' ? (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
              </svg>
            ) : (
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
          </div>
          <span className="form-status__message">{submitMessage}</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="contact-form" noValidate>
        <div className={getFieldClassName('name')}>
          <label htmlFor="name" className="form-label">
            Name <span className="form-label__required">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter your full name"
            className="form-input"
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <div id="name-error" className="form-error" role="alert">
              {errors.name}
            </div>
          )}
        </div>

        <div className={getFieldClassName('email')}>
          <label htmlFor="email" className="form-label">
            Email <span className="form-label__required">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter your email address"
            className="form-input"
            aria-describedby={errors.email ? "email-error" : undefined}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <div id="email-error" className="form-error" role="alert">
              {errors.email}
            </div>
          )}
        </div>

        <div className={getFieldClassName('subject')}>
          <label htmlFor="subject" className="form-label">
            Subject <span className="form-label__required">*</span>
          </label>
          <input
            id="subject"
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="What's this about?"
            className="form-input"
            aria-describedby={errors.subject ? "subject-error" : undefined}
            aria-invalid={!!errors.subject}
          />
          {errors.subject && (
            <div id="subject-error" className="form-error" role="alert">
              {errors.subject}
            </div>
          )}
        </div>

        <div className={getFieldClassName('message')}>
          <label htmlFor="message" className="form-label">
            Message <span className="form-label__required">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Tell us more about your inquiry..."
            className="form-textarea"
            rows="5"
            aria-describedby={errors.message ? "message-error" : undefined}
            aria-invalid={!!errors.message}
          />
          <div className="form-help">
            {formData.message.length}/1000 characters
          </div>
          {errors.message && (
            <div id="message-error" className="form-error" role="alert">
              {errors.message}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={isSubmitting}
          aria-describedby="submit-help"
        >
          {isSubmitting ? (
            <>
              <InlineLoader size="small" />
              Sending...
            </>
          ) : (
            'Send Message'
          )}
        </button>
        
        <div id="submit-help" className="form-help">
          We'll get back to you within 24 hours.
        </div>
      </form>
    </div>
  );
};

export default ContactEnhanced;
