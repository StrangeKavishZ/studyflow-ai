import Link from 'next/link';

export const metadata = { title: 'Terms of Service — StudyFlow AI' };

export default function TermsPage(){
  return (
    <div className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">← Back to StudyFlow</Link>
        <span className="eyebrow">Terms of Service</span>
        <h1 className="font-display">The simple version.</h1>
        <p className="muted">Last updated: September 2026</p>

        <p>
          StudyFlow AI is provided as a free, independent student project. By using it,
          you agree to the following:
        </p>

        <h2>Using StudyFlow</h2>
        <ul>
          <li>You must provide a real, working email to create an account.</li>
          <li>You're responsible for keeping your login credentials secure.</li>
          <li>You won't use StudyFlow to harass, spam, or share harmful content with other users, especially in the Community section.</li>
          <li>You won't attempt to access other users' data or interfere with the service.</li>
        </ul>

        <h2>Community conduct</h2>
        <p>
          The Community section is meant to be a supportive space for students. Be
          respectful. Content that is abusive, sexually explicit, or intended to harm
          others may be removed, and accounts may be restricted.
        </p>

        <h2>Your content</h2>
        <p>
          You own the tasks, notes, and messages you create. By posting in the
          Community, you're allowing other members to see that content as part of
          normal use of the app.
        </p>

        <h2>No guarantees</h2>
        <p>
          StudyFlow is provided "as is," built and maintained by a single developer as
          a passion project. While care is taken to keep your data safe and the app
          working, we can't guarantee it will always be available, error-free, or
          permanent. Please don't treat StudyFlow as your only backup for critical
          academic records.
        </p>

        <h2>AI Companion</h2>
        <p>
          The AI Companion feature uses a third-party AI model (Google Gemini) to
          generate responses. AI-generated answers can be wrong or incomplete — use
          your own judgement, especially for anything exam- or grade-critical.
        </p>

        <h2>Changes and availability</h2>
        <p>
          Features may be added, changed, or removed as StudyFlow develops. We'll try
          to avoid breaking changes that affect your existing data, but this is an
          early-stage project and things may evolve quickly.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about these terms? Email <a href="mailto:skavish709@gmail.com">skavish709@gmail.com</a>.
        </p>

        <div className="legal-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </div>
  );
}
