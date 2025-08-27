import React, { useState, useCallback, useRef } from "react";
import emailjs from "emailjs-com";
import { InlineLoader } from "./SkeletonLoader";
import "./Contact.css";

const Contact = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
      subject: formData.subject
    };

    emailjs
      .send(
        process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_jpewjm8",
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_lmr1i7v",
        templateParams,
        process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "Rc8h7uEQIYsCp9F2L"
      )
      .then(() => {
        alert("Message Sent! We’ll get back to you soon.");
        setFormData({ name: "", email: "", message: "", subject: "" });
      })
      .catch((err) => {
        console.error("Failed to send message:", err);
        alert("Something went wrong. Please try again.");
      });
  };

  return (
    <main className="contact-container" id="main-content" role="main">
      <header className="contact-header">
        <h1>Contact Us</h1>
        <p>Have any questions? Feel free to reach out.</p>
      </header>

      <section className="contact-form-section" aria-labelledby="contact-form-heading">
        <h2 id="contact-form-heading" className="sr-only">Contact Form</h2>
        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          <div className="input-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              required
              placeholder="Enter your name"
              aria-describedby={errors.name ? "name-error" : undefined}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <span id="name-error" className="error-message" role="alert">
                {errors.name}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              required
              placeholder="Enter your email"
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <span id="email-error" className="error-message" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              required
              placeholder="Subject"
              aria-describedby={errors.subject ? "subject-error" : undefined}
              aria-invalid={!!errors.subject}
            />
            {errors.subject && (
              <span id="subject-error" className="error-message" role="alert">
                {errors.subject}
              </span>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              onBlur={handleBlur}
              onFocus={handleFocus}
              required
              placeholder="Your message"
              aria-describedby={errors.message ? "message-error" : undefined}
              aria-invalid={!!errors.message}
            ></textarea>
            {errors.message && (
              <span id="message-error" className="error-message" role="alert">
                {errors.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
            aria-describedby="submit-status"
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>

          {submitStatus && (
            <div
              id="submit-status"
              className={`submit-status ${submitStatus}`}
              role="alert"
              aria-live="polite"
            >
              {submitMessage}
            </div>
          )}
        </form>
      </section>
    </main>
  );
};

export default Contact;