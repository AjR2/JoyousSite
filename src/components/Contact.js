// import React, { useState } from "react";
// import "./Contact.css";

// const Contact = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Message Sent! We’ll get back to you soon.");
//     setFormData({ name: "", email: "", message: "" });
//   };

//   return (
//     <div className="contact-container">
//       <h2>Contact Us</h2>
//       <p>Have any questions? Feel free to reach out.</p>

//       <form onSubmit={handleSubmit} className="contact-form">
//         <div className="input-group">
//           <label>Name</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             placeholder="Enter your name"
//           />
//         </div>

//         <div className="input-group">
//           <label>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             placeholder="Enter your email"
//           />
//         </div>

//         <div className="input-group">
//           <label>Message</label>
//           <textarea
//             name="message"
//             value={formData.message}
//             onChange={handleChange}
//             required
//             placeholder="Your message"
//           ></textarea>
//         </div>

//         <button type="submit" className="submit-btn">Send Message</button>
//       </form>
//     </div>
//   );
// };

// export default Contact;
import React, { useState } from "react";
import emailjs from "emailjs-com";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      .send("service_zzvj0ur", "template_lmr1i7v", templateParams, "Rc8h7uEQIYsCp9F2L")
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
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>Have any questions? Feel free to reach out.</p>

      <form onSubmit={handleSubmit} className="contact-form">
      <div className="input-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>

        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="input-group">
          <label>Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            placeholder="Subject"
          />
        </div>

        <div className="input-group">
          <label>Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            placeholder="Your message"
          ></textarea>
        </div>

        <button type="submit" className="submit-btn">Send Message</button>
      </form>
    </div>
  );
};

export default Contact;