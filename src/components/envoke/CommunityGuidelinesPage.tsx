import { PolicyLayout } from '@/components/envoke/PolicyLayout';

export default function CommunityGuidelinesPage() {
  return (
    <PolicyLayout
      title="Community Guidelines"
      intro={
        <p>
          Songs carry memories — sometimes joyful, sometimes difficult, often personal. These
          guidelines exist alongside our Terms &amp; Conditions to keep that space respectful.
        </p>
      }
      sections={[
        {
          heading: 'What we expect',
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                Respect what a memory means to the person who wrote it, even if it&apos;s not how
                you&apos;d remember it
              </li>
              <li>Disagree or discuss without harassment, insults, or personal attacks</li>
              <li>Keep images relevant and appropriate to the memory you&apos;re sharing</li>
            </ul>
          ),
        },
        {
          heading: "What's not allowed",
          body: (
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Harassment, hate speech, or targeted bullying</li>
              <li>Impersonating another person</li>
              <li>Posting someone else&apos;s private information without their consent</li>
              <li>Sexual, violent, or disturbing content</li>
              <li>Spam, scams, or fake accounts</li>
            </ul>
          ),
        },
        {
          heading: 'Reporting',
          body: (
            <p>
              If you see something that crosses these lines, use the report button. Reports are
              reviewed, and action can range from content removal to account suspension, as described
              in our Terms &amp; Conditions.
            </p>
          ),
        },
        {
          heading: 'This is a living document',
          body: (
            <p>
              As Envoke grows, these guidelines may be updated to reflect what the community actually
              needs.
            </p>
          ),
        },
      ]}
    />
  );
}
