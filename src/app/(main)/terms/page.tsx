import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | PropertyGoJB",
  description: "Read the terms and conditions governing your use of the PropertyGoJB platform.",
};

export default function TermsPage() {
  return (
    <div className="container min-h-screen max-w-3xl py-20 md:py-16">
      <h1 className="mb-8 font-serif text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground mb-8 text-sm">Last updated: 19 April 2026</p>

      <div className="prose dark:prose-invert max-w-none space-y-8">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using PropertyGoJB (&quot;the Platform&quot;), you agree to be bound by
            these Terms of Service. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2>2. Description of Services</h2>
          <p>
            PropertyGoJB is a real-estate platform focused on Johor Bahru, Malaysia, providing
            property search, agent connections, appointment booking, financial calculators, and a
            referral rewards system.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <ul>
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the security of your account credentials.</li>
            <li>You must be at least 18 years old to use our services.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
          </ul>
        </section>

        <section>
          <h2>4. Property Listings</h2>
          <p>
            Property information, prices, and availability are provided for informational purposes
            and may change without notice. We strive for accuracy but do not guarantee that all
            listing details are current or error-free. Always verify property details directly with
            the developer or agent.
          </p>
        </section>

        <section>
          <h2>5. Referral Programme</h2>
          <ul>
            <li>
              Referral rewards are subject to the programme rules in effect at the time of referral.
            </li>
            <li>We reserve the right to modify, suspend, or terminate the referral programme.</li>
            <li>
              Fraudulent referral activity will result in forfeiture of rewards and account
              suspension.
            </li>
            <li>Rewards may be subject to verification and approval by our team.</li>
          </ul>
        </section>

        <section>
          <h2>6. Appointments & Agent Interactions</h2>
          <p>
            PropertyGoJB facilitates connections between users, agents, and developers. We are not a
            party to any property transaction. Any agreements or disputes arising from property
            viewings, purchases, or agent interactions are between the relevant parties.
          </p>
        </section>

        <section>
          <h2>7. Financial Calculators</h2>
          <p>
            Mortgage calculators, DSR calculators, and other financial tools are provided for
            estimation purposes only and do not constitute financial advice. Actual loan terms,
            eligibility, and rates may differ. Consult a licensed financial advisor for decisions.
          </p>
        </section>

        <section>
          <h2>8. Intellectual Property</h2>
          <p>
            All content on the Platform — including text, graphics, logos, and software — is the
            property of PropertyGoJB or its licensors and is protected by intellectual property
            laws. You may not reproduce, distribute, or create derivative works without permission.
          </p>
        </section>

        <section>
          <h2>9. Prohibited Conduct</h2>
          <ul>
            <li>Using the Platform for any unlawful purpose</li>
            <li>Scraping, crawling, or automated data extraction without permission</li>
            <li>Posting false or misleading property information</li>
            <li>Attempting to gain unauthorized access to other accounts or systems</li>
            <li>Interfering with the Platform&apos;s operation or security</li>
          </ul>
        </section>

        <section>
          <h2>10. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by Malaysian law, PropertyGoJB shall not be liable for
            any indirect, incidental, special, or consequential damages arising from your use of the
            Platform or reliance on information provided therein.
          </p>
        </section>

        <section>
          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of Malaysia. Any disputes shall be subject to
            the exclusive jurisdiction of the courts of Malaysia.
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time. Continued use of the Platform after changes
            constitutes acceptance of the revised terms.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>
            For questions about these Terms, contact us at{" "}
            <a href="mailto:legal@propertygojb.com" className="text-primary hover:underline">
              legal@propertygojb.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
