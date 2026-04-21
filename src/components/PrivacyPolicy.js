import { Helmet } from 'react-helmet-async';
import './LegalPages.css';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Privacy Policy - Enactive</title>
        <meta name="description" content="Privacy Policy for Enactive platform and OAuth integrations" />
        <link rel="canonical" href="https://theenactive.com/privacy" />
      </Helmet>

      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: January 15, 2026</p>

        <section>
          <h2>1. Overview</h2>
          <p>
            This Privacy Policy explains how Enactive collects, uses, stores, and protects information
            obtained through our platform and OAuth-based integrations with third-party services
            such as Google and YouTube.
          </p>
          <p>
            Enactive is designed to respect user agency, minimize data collection, and prioritize
            privacy by design.
          </p>
        </section>

        <section>
          <h2>2. Information We Access</h2>
          <p>With your explicit consent, Enactive may access:</p>
          <ul>
            <li>Account identifiers (e.g., channel ID)</li>
            <li>Usage or analytics data (e.g., views, watch time, engagement metrics)</li>
            <li>Basic metadata necessary to provide summaries or reports</li>
          </ul>
          <p><strong>Enactive does not access:</strong></p>
          <ul>
            <li>Private messages or emails</li>
            <li>Passwords or login credentials</li>
            <li>Unrelated Google account data</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use OAuth Data</h2>
          <p>OAuth-authorized data is used solely to:</p>
          <ul>
            <li>Generate analytics summaries</li>
            <li>Produce internal or emailed reports</li>
            <li>Improve Enactive features related to cognitive systems and execution integrity</li>
          </ul>
          <p><strong>We do not sell OAuth data or use it for advertising.</strong></p>
        </section>

        <section>
          <h2>4. Data Storage and Security</h2>
          <ul>
            <li>Access tokens are short-lived and not stored long-term</li>
            <li>Refresh tokens, if used, are stored securely and encrypted</li>
            <li>Data is accessible only to authorized Enactive systems</li>
            <li>We use industry-standard security measures to protect your information</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Retention</h2>
          <p>
            We retain OAuth-related data only as long as necessary to provide the requested
            functionality. When you revoke access, we delete associated tokens and cached data
            within 30 days, unless legally required to retain certain information.
          </p>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>
          <p>
            Enactive integrates with third-party services such as Google and YouTube. These services
            have their own privacy policies:
          </p>
          <ul>
            <li>
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google Privacy Policy
              </a>
            </li>
            <li>
              <a href="https://www.youtube.com/t/privacy" target="_blank" rel="noopener noreferrer">
                YouTube Privacy Guidelines
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the data we have collected about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Revoke OAuth access at any time</li>
            <li>Export your data in a portable format</li>
          </ul>
          <p>
            To exercise these rights, contact us at{' '}
            <a href="mailto:info@enactive.ai">info@enactive.ai</a>.
          </p>
        </section>

        <section>
          <h2>8. Cookies and Tracking</h2>
          <p>
            Enactive uses minimal cookies necessary for functionality. We do not use third-party
            tracking cookies or sell your browsing data. Analytics, if collected, are aggregated
            and anonymized.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Enactive is not intended for children under 13 years of age. We do not knowingly collect
            personal information from children. If you believe we have collected information from
            a child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Material changes will be posted
            on this page with an updated effective date. Your continued use of Enactive after changes
            constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <p>
            Email: <a href="mailto:info@enactive.ai">info@enactive.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
