import Link from 'next/link';

export const metadata = { title: 'About — StudyFlow AI' };

export default function AboutPage(){
  return (
    <div className="legal-page">
      <div className="legal-card">
        <Link href="/" className="legal-back">← Back to StudyFlow</Link>
        <span className="eyebrow">About</span>
        <h1 className="font-display">Built by a student, for students.</h1>

        <p>
          StudyFlow AI is an independent project crafted with ❤️ by <strong>Kavish</strong> —
        </p>

        <p>
          StudyFlow is being introduced to the world in collaboration with{' '}
          <strong>PRISMxSTUDIO</strong>, run by <strong>Lithishwar</strong>, 
        </p>

        <p>
          The goal is simple: give students one place to plan their studies, track exams
          and marks, log real study sessions, and connect with a community of people doing
          the same thing — without the clutter of ten different apps.
        </p>

        <h2>Get in touch</h2>
        <p>
          Questions, bug reports, or ideas for what to build next? Reach out at{' '}
          <a href="mailto:skavish709@gmail.com">skavish709@gmail.com</a>.
        </p>

        <div className="legal-links">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
