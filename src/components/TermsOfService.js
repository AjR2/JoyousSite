import { Helmet } from 'react-helmet-async';
import './LegalPages.css';

function TermsOfService() {
  return (
    <div className="legal-page">
      <Helmet>
        <title>Terms of Service - Enactive</title>
        <meta name="description" content="Terms of Service for Enactive platform and OAuth integrations" />
        <link rel="canonical" href="https://theenactive.com/terms" />
      </Helmet>

      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: January 15, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            These Terms of Service ("Terms") govern your use of Enactive's services, including OAuth-based
            integrations with third-party platforms such as Google and YouTube (the "OAuth Services").
            By authorizing or using the OAuth Services, you agree to be bound by these Terms.
          </p>
          <p>
            Enactive builds structural interventions for cognitive flexibility and execution integrity.
            <strong>Enactive is not a medical or clinical service.</strong>
          </p>
        </section>

        <section>
          <h2>2. Scope of the OAuth Services</h2>
          <p>
            The OAuth Services allow Enactive to access limited data from third-party platforms only after
            you explicitly grant permission. For example, if you connect a Google or YouTube account,
            Enactive may access analytics or metadata necessary to provide insights, summaries, or reports.
          </p>
          <p>
            Enactive only requests the minimum scopes required for the stated functionality.
          </p>
        </section>

        <section>
          <h2>3. User Eligibility</h2>
          <p>You must:</p>
          <ul>
            <li>Be at least 13 years old (or the minimum age required in your jurisdiction)</li>
            <li>Have the authority to grant access to the connected account</li>
            <li>Use the OAuth Services only for lawful purposes</li>
          </ul>
        </section>

        <section>
          <h2>4. User Control and Revocation</h2>
          <p>You may revoke Enactive's access at any time by:</p>
          <ul>
            <li>Removing Enactive from your Google Account permissions at <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">myaccount.google.com/permissions</a>, or</li>
            <li>Contacting us at <a href="mailto:info@enactive.ai">info@enactive.ai</a></li>
          </ul>
          <p>Revoking access may limit or disable certain features.</p>
        </section>

        <section>
          <h2>5. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the OAuth Services to access data you do not have rights to</li>
            <li>Attempt to bypass or manipulate authorization mechanisms</li>
            <li>Use Enactive in a way that violates third-party terms (including Google's terms)</li>
            <li>Engage in any activity that could harm or disrupt the service</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual Property</h2>
          <p>
            All Enactive software, branding, and content remain the property of Enactive or its licensors.
            These Terms grant you a limited, revocable, non-exclusive right to use the OAuth Services.
          </p>
        </section>

        <section>
          <h2>7. Disclaimers</h2>
          <p>
            Enactive provides the OAuth Services on an "as is" and "as available" basis. We make no
            guarantees regarding accuracy, completeness, or availability of third-party data.
          </p>
          <p>
            <strong>Enactive does not provide medical, legal, or clinical advice.</strong> Our platform
            is designed to support execution integrity and cognitive systems, not to replace professional services.
          </p>
        </section>

        <section>
          <h2>8. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Enactive shall not be liable for indirect, incidental,
            or consequential damages arising from your use of the OAuth Services.
          </p>
        </section>

        <section>
          <h2>9. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. Material changes will be posted on this page
            with an updated effective date. Your continued use of the service after changes constitutes
            acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the United States,
            without regard to its conflict of law provisions.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
          <p>Questions about these Terms can be directed to:</p>
          <p>
            Email: <a href="mailto:info@enactive.ai">info@enactive.ai</a>
          </p>
        </section>
      </div>
    </div>
  );
}

export default TermsOfService;
