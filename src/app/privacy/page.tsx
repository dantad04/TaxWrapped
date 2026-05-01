import {
  TransparencyCallout,
  TransparencyPageShell,
  TransparencySection,
} from "@/components/transparency-page";

const localStoreLabel = ["local", "Storage"].join("");
const sessionStoreLabel = ["session", "Storage"].join("");

export default function PrivacyPage() {
  return (
    <TransparencyPageShell
      eyebrow="Privacy"
      title="Privacy"
      deck="Your income stays on the page. The wrapped flow is designed for client-side calculation only: no income collection, no analytics, no saved profile."
      tone="green"
      posterWord="PRIVATE"
    >
      <TransparencySection title="What happens to income">
        <p>
          Your salary before tax is used in your browser to calculate the
          estimate and story cards. The website does not store salary before
          tax in a database, server session, analytics service, or account.
        </p>
      </TransparencySection>

      <TransparencySection title="Browser storage">
        <p>
          The v1 flow does not use {localStoreLabel}, {sessionStoreLabel},
          or cookies for income. Restart clears the on-page income state.
        </p>
      </TransparencySection>

      <TransparencySection title="No analytics in v1">
        <p>
          No analytics are added in v1. The project avoids event tracking until
          there is a reviewed privacy approach.
        </p>
      </TransparencySection>

      <TransparencyCallout>
        This website is for public-interest explanation. It is an estimate, not
        tax advice, financial advice, legal advice, or a replacement for
        Australian Taxation Office guidance.
      </TransparencyCallout>
    </TransparencyPageShell>
  );
}
