import { PolicyLayout } from '@/components/envoke/PolicyLayout';

export default function TermsPage() {
  return (
    <PolicyLayout
      title="Terms & Conditions"
      sections={[
        {
          heading: '1. Acceptance of these terms',
          body: (
            <p>
              By creating an account or using Envoke, you agree to these Terms &amp; Conditions and
              our <a href="/privacy" className="text-brass hover:text-brass-hover underline underline-offset-2">Privacy Policy</a>.
              If you don&apos;t agree, please don&apos;t use Envoke.
            </p>
          ),
        },
        {
          heading: '2. Eligibility',
          body: (
            <p>
              You must be at least <strong className="text-cream">18 years old</strong> to create
              an account or use Envoke. By signing up, you confirm you meet this requirement.
            </p>
          ),
        },
        {
          heading: '3. Your account',
          body: (
            <p>
              You&apos;re responsible for keeping your login credentials secure and for all activity
              under your account. One account per person.
            </p>
          ),
        },
        {
          heading: '4. Your content',
          body: (
            <p>
              You own what you write and upload to Envoke. By posting a memory, you grant Envoke a
              limited license to store and display it exactly according to the privacy setting you
              chose — private means shown only to you; public means shown as described in our Privacy
              Policy. You&apos;re responsible for what you post, and you confirm you have the right
              to post it.
            </p>
          ),
        },
        {
          heading: "5. What you can't do on Envoke",
          body: (
            <>
              <p>You may not:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>Post content that&apos;s illegal, harassing, hateful, or threatening</li>
                <li>Impersonate another person</li>
                <li>
                  Post content you don&apos;t have the rights to, including copyrighted material such
                  as song lyrics
                </li>
                <li>Use Envoke to spam, scrape, or abuse the service</li>
                <li>Attempt to bypass another user&apos;s privacy settings</li>
              </ul>
            </>
          ),
        },
        {
          heading: '6. Moderation and enforcement',
          body: (
            <p>
              We may remove content, suspend, or terminate an account that violates these Terms or
              our <a href="/community-guidelines" className="text-brass hover:text-brass-hover underline underline-offset-2">Community Guidelines</a>,
              based on user reports or our own review. Repeated or serious violations may result in
              permanent termination.
            </p>
          ),
        },
        {
          heading: '7. Copyright complaints',
          body: (
            <p>
              If you believe content on Envoke infringes your copyright, contact us with details of
              the content and your claim. We&apos;ll review legitimate requests and act on them,
              including removing content where appropriate.
            </p>
          ),
        },
        {
          heading: '8. Third-party services',
          body: (
            <p>
              Envoke uses third-party services we don&apos;t control — including YouTube for playback
              and MusicBrainz for song information. We&apos;re not responsible for their content,
              availability, or practices.
            </p>
          ),
        },
        {
          heading: '9. Account deletion',
          body: (
            <p>
              You can delete your account at any time. Deletion is{' '}
              <strong className="text-cream">permanent</strong> and removes your account and
              everything it owns.
            </p>
          ),
        },
        {
          heading: '10. Disclaimer of warranties',
          body: (
            <p>
              Envoke is provided &quot;as is.&quot; We don&apos;t guarantee it will always be
              available, error-free, or meet your specific expectations.
            </p>
          ),
        },
        {
          heading: '11. Limitation of liability',
          body: (
            <p>
              To the extent permitted by Indian law, Envoke and its operator are not liable for
              indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          ),
        },
        {
          heading: '12. Indemnification',
          body: (
            <p>
              You agree to indemnify Envoke against claims arising from content you post or your
              violation of these Terms.
            </p>
          ),
        },
        {
          heading: '13. Governing law',
          body: (
            <p>
              These Terms are governed by the laws of India. Any disputes are subject to the
              jurisdiction of the courts in Jalandhar, Punjab.
            </p>
          ),
        },
        {
          heading: '14. Changes to these terms',
          body: (
            <p>
              We may update these Terms as Envoke grows. We&apos;ll update the &quot;Last
              updated&quot; date above whenever we do.
            </p>
          ),
        },
        {
          heading: '15. Contact',
          body: <p>Questions about these Terms can be sent to us directly.</p>,
        },
      ]}
    />
  );
}
