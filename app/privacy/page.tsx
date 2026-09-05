import Link from 'next/link';

export const metadata = { title: 'Privacy Policy — StudyFlow AI' };

export default function PrivacyPage(){
  return (
    <div className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">← Back to StudyFlow</Link>
        <span className="eyebrow">Privacy Policy</span>
        <h1 className="font-display">Your data, explained plainly.</h1>
        <p className="muted">Last updated: September 2026</p>

        <p>
          StudyFlow AI is a small, independent project. This policy explains what
          information the app collects, why, and how it's protected — in plain language,
          not legal filler.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account info:</strong> your email address, used only for login via Supabase authentication.</li>
          <li><strong>Profile details:</strong> display name, username, avatar colour, school name, class/board, and academic goals you choose to enter.</li>
          <li><strong>Study data:</strong> tasks, study sessions, exam entries, marks, and topics you log — this is the core of what makes StudyFlow useful to you.</li>
          <li><strong>Community content:</strong> messages, replies, reactions, and any images you choose to share in the Community section.</li>
        </ul>

        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell your data to anyone, ever.</li>
          <li>We don't show ads or share your information with advertisers.</li>
          <li>We don't read your private study data — tasks, marks, and exams are visible only to you.</li>
        </ul>

        <h2>Who can see what</h2>
        <p>
          Your tasks, exams, marks, and study sessions are private to your account.
          Your display name, username, and avatar are visible to other members of the
          Community. Study minutes are only shown to others if you explicitly opt in
          to the weekly leaderboard — this is off by default.
        </p>

        <h2>How your data is stored</h2>
        <p>
          Data is stored with Supabase, a hosted database provider, protected by
          row-level security rules that restrict each table so only you (or, for
          Community content, other active members) can access it.
        </p>

        <h2>Third-party services</h2>
        <p>
          The AI Companion feature sends your question (and relevant study context you
          choose to include) to Google's Gemini API to generate a response. This
          message is not stored by StudyFlow beyond your session. Refer to Google's
          own privacy policy for how they handle API requests.
        </p>

        <h2>Your choices</h2>
        <p>
          You can edit or delete your tasks, exams, marks, and topics at any time from
          within the app. You can leave the Community at any time. To request full
          account deletion, email us and we'll remove your data.
        </p>

        <h2>Children's privacy</h2>
        <p>
          StudyFlow is built with students in mind. If you are under the age required
          by your country to manage your own account, please use StudyFlow with a
          parent or guardian's awareness.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          As StudyFlow grows, this policy may be updated. Meaningful changes will be
          reflected here with an updated date.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about your data? Email <a href="mailto:skavish709@gmail.com">skavish709@gmail.com</a>.
        </p>

        <div className="legal-links">
          <Link href="/terms">Terms of Service</Link>
          <Link href="/about">About</Link>
        </div>
      </div>
    </div>
  );
}
