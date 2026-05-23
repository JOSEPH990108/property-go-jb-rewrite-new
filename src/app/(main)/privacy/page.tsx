import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | PropertyGoJB",
  description: "Learn how PropertyGoJB collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container min-h-screen max-w-3xl py-20 md:py-16">
      <h1 className="mb-8 font-serif text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8 text-sm">Last updated: 19 April 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Introduction</h2>
          <p>
            PropertyGoJB (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to
            protecting the privacy of individuals who visit our website and use our services. This
            Privacy Policy explains how we collect, use, disclose, and safeguard your information
            when you use our platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>Personal Information</h3>
          <ul>
            <li>Name, email address, and phone number when you create an account</li>
            <li>Nationality and profile preferences</li>
            <li>Appointment booking details</li>
            <li>Referral code usage and reward history</li>
          </ul>
          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address and browser/device information</li>
            <li>Pages visited and interactions with our platform</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <ul>
            <li>To provide and maintain our property listing and search services</li>
            <li>To process appointment bookings and agent enquiries</li>
            <li>To manage your account and referral rewards</li>
            <li>To send important notifications about your appointments and account</li>
            <li>To improve our platform and user experience</li>
            <li>To comply with legal obligations under Malaysian law</li>
          </ul>
        </section>

        <section>
          <h2>4. Disclosure of Information</h2>
          <p>
            We may share your information with property agents and developers when you submit an
            enquiry or book an appointment. We do not sell your personal data. We may disclose
            information when required by law or to protect our legal rights.
          </p>
        </section>

        <section>
          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encrypted connections (TLS),
            secure authentication via better-auth, and access controls. However, no method of
            electronic storage is 100% secure.
          </p>
        </section>

        <section>
          <h2>6. Your Rights (PDPA Malaysia)</h2>
          <p>Under the Personal Data Protection Act 2010 (PDPA), you have the right to:</p>
          <ul>
            <li>Access your personal data held by us</li>
            <li>Correct inaccurate personal data</li>
            <li>Withdraw consent for data processing</li>
            <li>Request deletion of your account and associated data</li>
          </ul>
          <p>You can exercise these rights through your profile settings or by contacting us.</p>
        </section>

        <section>
          <h2>7. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We may also use
            analytics cookies to understand how visitors interact with our site. You can manage
            cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2>8. Third-Party Services</h2>
          <p>
            Our platform integrates with third-party services including Google OAuth, Twilio (SMS),
            and Vercel (hosting). Each service has its own privacy policy governing data handling.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any material
            changes by posting the updated policy on this page with a revised &quot;Last
            updated&quot; date.
          </p>
        </section>

        <section>
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{" "}
            <a href="mailto:privacy@propertygojb.com" className="text-primary hover:underline">
              privacy@propertygojb.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
