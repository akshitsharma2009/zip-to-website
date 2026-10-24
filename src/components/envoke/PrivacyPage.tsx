import { PolicyLayout } from '@/components/envoke/PolicyLayout';

export default function PrivacyPage() {
  return (
    <PolicyLayout
      title="Privacy Policy"
      intro={
        <p>
          Envoke is operated from Jalandhar, Punjab, India. This Privacy Policy explains what
          personal data we collect, why, and the rights you have over it under Indian law,
          including the Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;).
        </p>
      }
      sections={[
        {
          heading: '1. Who this is and who we are',
          body: (
            <p>
              Envoke (&quot;Envoke,&quot; &quot;we,&quot; &quot;us,&quot; &quot;our&quot;) is
              operated from Jalandhar, Punjab, India. This Privacy Policy explains what personal data
              we collect, why, and the rights you have over it under Indian law, including the
              Digital Personal Data Protection Act, 2023 (&quot;DPDP Act&quot;).
            </p>
          ),
        },
        {
          heading: '2. What data we collect',
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-cream">Account data:</strong> your email address; if
                  you sign up with Google, the name and profile information Google shares with us
                </li>
                <li>
                  <strong className="text-cream">Content you create:</strong> the text and images
                  in your memories, and whether each one is public or private; your song searches
                </li>
                <li>
                  <strong className="text-cream">Social data</strong> (once available): who you
                  follow, who follows you, your likes and comments
                </li>
                <li>
                  <strong className="text-cream">Technical data:</strong> the
                  session/authentication data needed to keep you signed in
                </li>
              </ul>
              <p className="mt-3">
                We only collect what&apos;s needed to run Envoke — we don&apos;t buy data lists, and
                we don&apos;t track you across other websites.
              </p>
            </>
          ),
        },
        {
          heading: '3. Why we process it, and your consent',
          body: (
            <p>
              We process your data to operate your account, let you write and read memories according
              to the privacy you choose, and keep the platform safe (moderation, reports). We rely
              on your <strong className="text-cream">consent</strong> — given when you create your
              account and agree to this Policy — as our basis for processing, consistent with the
              DPDP Act. You can withdraw consent at any time by deleting your account (Section 8).
            </p>
          ),
        },
        {
          heading: '4. How your privacy settings actually work',
          body: (
            <p>
              Privacy on Envoke isn&apos;t just a visual setting. A private memory is enforced at the
              database level, so it is technically inaccessible to anyone but you — not merely
              hidden from view. The same protection applies to any images attached to a memory.
            </p>
          ),
        },
        {
          heading: '5. Who we share data with',
          body: (
            <>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-cream">Lovable Cloud</strong> — our database,
                  authentication, and storage provider, processing data on our behalf to run the
                  service.
                </li>
                <li>
                  <strong className="text-cream">Google</strong> — if you sign in with Google,
                  Google shares basic profile information with us per your own Google account
                  settings.
                </li>
                <li>
                  <strong className="text-cream">YouTube</strong> — song playback is embedded
                  from YouTube. Once you press play, that playback is subject to Google/YouTube&apos;s
                  own privacy practices, not ours.
                </li>
              </ul>
              <p className="mt-3">
                We do not sell your personal data, and we do not share it with advertisers.
              </p>
            </>
          ),
        },
        {
          heading: '6. Cookies',
          body: (
            <p>
              Envoke uses the minimum cookies needed to keep you signed in and, if you use it, to
              complete Google sign-in. Embedded YouTube videos may set their own cookies once played
              — we use YouTube&apos;s privacy-enhanced embed mode where possible, so this doesn&apos;t
              happen until you actually press play.
            </p>
          ),
        },
        {
          heading: '7. Data retention',
          body: (
            <p>
              We keep your data for as long as your account is active. If you delete your account,
              your account and everything it owns — memories, images, and (once applicable) your
              follows, likes, and comments — are{' '}
              <strong className="text-cream">permanently deleted</strong>, not just hidden.
            </p>
          ),
        },
        {
          heading: '8. Your rights',
          body: (
            <>
              <p>Under the DPDP Act, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-1.5 mt-2">
                <li>
                  <strong className="text-cream">Access</strong> the personal data we hold about
                  you
                </li>
                <li>
                  <strong className="text-cream">Correct</strong> inaccurate or incomplete data
                </li>
                <li>
                  <strong className="text-cream">Erase</strong> your data — delete your account
                  directly at any time, or request erasure by contacting us
                </li>
                <li>
                  <strong className="text-cream">Withdraw consent</strong> at any time
                </li>
                <li>
                  <strong className="text-cream">Raise a grievance</strong> with our Grievance
                  Officer (Section 9), and subsequently with the Data Protection Board of India if
                  unresolved
                </li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us directly.</p>
            </>
          ),
        },
        {
          heading: '9. Grievance Officer',
          body: (
            <p>
              In accordance with the Information Technology (Intermediary Guidelines and Digital
              Media Ethics Code) Rules, 2021, our Grievance Officer is available to receive and
              resolve complaints. We acknowledge complaints within 24 hours and aim to resolve them
              within 15 days. Contact details will be provided upon request and before public launch.
            </p>
          ),
        },
        {
          heading: "10. Children's privacy",
          body: (
            <p>
              Envoke is intended for users aged{' '}
              <strong className="text-cream">18 and over</strong>. We do not knowingly collect
              personal data from anyone under 18. If we learn an account belongs to someone under 18,
              we will delete it.
            </p>
          ),
        },
        {
          heading: '11. Where your data is stored',
          body: (
            <p>
              Our infrastructure provider, Lovable Cloud, may store data on servers located outside
              India, depending on the hosting region used for this project.
            </p>
          ),
        },
        {
          heading: '12. Changes to this policy',
          body: (
            <p>
              We may update this Privacy Policy as Envoke grows or as Indian data protection law
              evolves — including as the DPDP Act&apos;s rules come fully into force through 2027.
              We&apos;ll update the &quot;Last updated&quot; date above whenever we do.
            </p>
          ),
        },
        {
          heading: '13. Contact',
          body: <p>Questions about this Policy can be sent to us directly.</p>,
        },
      ]}
    />
  );
}
