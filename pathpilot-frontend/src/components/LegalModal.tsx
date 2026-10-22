import React from 'react';
import { X } from 'lucide-react';

export type LegalTab = 'terms' | 'privacy';

type LegalModalProps = {
  open: boolean;
  activeTab: LegalTab;
  onTabChange: (tab: LegalTab) => void;
  onClose: () => void;
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-2">
    <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">{title}</h3>
    <div className="space-y-2 text-sm leading-6 text-[var(--text-secondary)]">{children}</div>
  </section>
);

export const LegalModal: React.FC<LegalModalProps> = ({ open, activeTab, onTabChange, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-dialog-title"
        className="flex max-h-[min(88vh,860px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl"
      >
        <header className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--brand-primary)]">VertexPath · Legal</p>
            <h2 id="legal-dialog-title" className="mt-1 font-display text-xl font-semibold text-[var(--text-primary)]">
              {activeTab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close legal information" className="rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]">
            <X className="h-5 w-5" />
          </button>
        </header>

        <nav aria-label="Legal documents" className="flex gap-6 border-b border-[var(--border)] px-5 sm:px-7">
          {(['terms', 'privacy'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              aria-current={activeTab === tab ? 'page' : undefined}
              className={`border-b-2 py-3 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </button>
          ))}
        </nav>

        <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <p className="text-xs text-[var(--text-muted)]">Last updated: October 22, 2026</p>


          {activeTab === 'terms' ? (
            <>
              <Section title="1. About these terms"><p>These Terms apply when you access or use VertexPath, a career-planning and developer-preparation service built and operated by Kaustubh Jadhav (“we,” “us,” or “our”). By using the service, you agree to these Terms. If you do not agree, do not use VertexPath.</p></Section>
              <Section title="2. Who may use VertexPath"><p>You may use VertexPath only if you can legally agree to these Terms. If you are below the age of legal majority where you live, use the service only with permission and supervision from a parent or legal guardian, where permitted by law.</p></Section>
              <Section title="3. Accounts and security"><p>Provide accurate account information, keep your sign-in credentials private, and tell us promptly if you believe your account has been accessed without permission. You are responsible for activity carried out through your account, except where applicable law says otherwise.</p></Section>
              <Section title="4. Your content and AI features"><p>You keep the rights you have in material you submit, including resumes, job descriptions, messages, profile details, and project ideas. You allow us to host, transmit, store, and process that material only as needed to operate the features you request, protect the service, and provide support.</p><p>VertexPath may use AI to produce roadmaps, resume feedback, project plans, interview practice, and other suggestions. AI output can be inaccurate, incomplete, or unsuitable for your situation. Review it before relying on or sharing it. It is informational career support, not a promise of employment or professional legal, financial, or recruiting advice.</p></Section>
              <Section title="5. Acceptable use"><p>Do not use VertexPath unlawfully; submit content you do not have permission to use; attempt to access another person’s account or data; disrupt, reverse engineer, or abuse the service; or use generated material to mislead, harass, or violate another person’s rights.</p></Section>
              <Section title="6. Third-party services"><p>Some features depend on hosting, storage, email, AI, and other providers. Those providers may have separate terms and privacy practices. We do not control services operated by third parties.</p></Section>
              <Section title="7. Availability and changes"><p>We may update, suspend, or discontinue features to maintain or improve VertexPath. We will make reasonable efforts to keep the service available, but uninterrupted access is not guaranteed. We may revise these Terms; the date above indicates the latest revision. Continued use after an update means you accept the revised Terms where the law allows.</p></Section>
              <Section title="8. Disclaimers and liability"><p>To the extent permitted by law, VertexPath is provided “as is” and “as available,” without warranties that the service or its AI output will be uninterrupted, error-free, accurate, or fit for a particular purpose. Nothing in these Terms limits rights or remedies that cannot lawfully be limited.</p><p>To the maximum extent permitted by applicable law, we are not liable for indirect, incidental, special, consequential, or punitive losses arising from use of the service. Any liability that cannot be excluded remains subject to applicable law.</p></Section>
              <Section title="9. Contact"><p>Questions about the Terms: kaustubhjadhav0043@gmail.com.</p></Section>
            </>
          ) : (
            <>
              <Section title="1. Who is responsible"><p>VertexPath is developed and operated by Kaustubh Jadhav. For privacy questions or requests, contact kaustubhjadhav0043@gmail.com.</p></Section>
              <Section title="2. Information the service handles"><p><strong>Account and profile:</strong> name, email address, password credential (stored as a password hash), email-verification data, career goal, experience level, technologies, preferences, avatar, and related profile settings.</p><p><strong>Content you submit:</strong> resumes and other uploaded documents, job descriptions, prompts, interview answers, chat messages, contact-form messages, and the career or project information you choose to provide. The service may also store generated results such as roadmaps, analyses, and project plans.</p><p><strong>Device storage:</strong> the browser stores sign-in/session tokens and some cached profile preferences in local storage. Anyone with access to your browser profile may be able to access that stored data. Sign out on shared devices.</p></Section>
              <Section title="3. How information is used"><p>We use this information to create and secure accounts, verify email addresses, save profile and career progress, process documents, provide requested career and AI features, answer support requests, and maintain and troubleshoot the service.</p></Section>
              <Section title="4. AI processing and service providers"><p>When you use AI features, relevant prompts and content may be sent to the configured Google Gemini APIs for generation and embeddings. Resume documents can also be parsed and indexed in ChromaDB so the service can answer document questions. Do not submit information you would not want processed by these services.</p><p>The application is built to use PostgreSQL for account and application records, server-side file storage, and Cloudflare R2 when configured for uploaded files. It also uses an email provider to send account verification and service messages. The exact hosting and storage setup can differ between local development and production. Each provider handles data under its own terms; this policy does not make claims about provider retention or model-training practices.</p><p>We do not sell personal information. We disclose it to providers only as needed to operate the features and infrastructure described above, or when required to protect rights, safety, or comply with law.</p></Section>
              <Section title="5. Storage, deletion, and retention"><p>We do not currently have a fixed deletion schedule for all account data. We retain information while it is needed to provide the service, maintain your account, resolve issues, or meet legal obligations; backups and provider records may persist for additional periods.</p><p>You can delete uploaded documents from the service. The application also attempts to remove the associated file and document index, but deletion from a remote provider may fail and backups or provider logs may persist for a limited period. The current app does not provide a self-service account deletion control. Contact kaustubhjadhav0043@gmail.com to request account deletion or access.</p></Section>
              <Section title="6. Security"><p>We use technical and organizational measures intended to protect information. No internet transmission or storage system can be guaranteed completely secure. The application stores session tokens in browser local storage, so protect access to your device and sign out when using a shared device.</p></Section>
              <Section title="7. Your choices and privacy rights"><p>You may update profile information in the app, remove uploaded documents, and sign out to clear locally stored session data. Depending on where you live, you may have additional rights to request access, correction, deletion, or restriction of personal information. Send requests to kaustubhjadhav0043@gmail.com; we will respond as required by applicable law.</p></Section>
              <Section title="8. Children"><p>VertexPath is not designed for children who are not legally able to consent to the processing of their information. If you believe a child has provided personal information, contact kaustubhjadhav0043@gmail.com so the operator can review the request.</p></Section>
              <Section title="9. Changes"><p>We may update this policy as the service or its providers change. We will update the date at the top when changes are made. Material changes should be communicated through the service or another appropriate channel.</p></Section>
              <Section title="10. Contact"><p>Privacy contact: kaustubhjadhav0043@gmail.com. VertexPath is developed and operated by Kaustubh Jadhav.</p></Section>
            </>
          )}
        </div>

        <footer className="flex justify-end border-t border-[var(--border)] px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-lg bg-[var(--brand-primary)] px-5 py-2.5 text-sm font-semibold text-[#111318] transition-colors hover:bg-[var(--brand-hover)]">Close</button>
        </footer>
      </section>
    </div>
  );
};

export default LegalModal;
