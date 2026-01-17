import Link from 'next/link';

const DEMO_LINKS = [
  {
    href: '/visitor',
    title: 'Visitor',
    description: 'Request entry to visit a resident',
    icon: UserIcon,
    color: 'bg-blue-500',
  },
  {
    href: '/residents',
    title: 'Resident',
    description: 'Approve or reject visitor requests',
    icon: HomeIcon,
    color: 'bg-coral-500',
  },
  {
    href: '/verify',
    title: 'Guard',
    description: 'Verify visitor pass codes',
    icon: ShieldIcon,
    color: 'bg-emerald-500',
  },
] as const;

export default function HomePage() {
  return (
    <div className="container-app">
      <header className="page-header pt-8">
        <div className="w-16 h-16 bg-coral-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-navy-900 mb-3">Visitor Pass</h1>
        <p className="text-gray-500 text-lg">Building access management system</p>
      </header>

      <section className="mt-12">
        <p className="text-sm text-gray-400 uppercase tracking-wide font-medium mb-4">
          Select your role
        </p>

        <div className="space-y-4">
          {DEMO_LINKS.map((link) => (
            <DemoCard key={link.href} {...link} />
          ))}
        </div>
      </section>

      <footer className="mt-16 text-center">
        <p className="text-sm text-gray-400">
          Demo application for visitor management
        </p>
      </footer>
    </div>
  );
}

interface DemoCardProps {
  href: string;
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
}

function DemoCard({ href, title, description, icon: Icon, color }: DemoCardProps) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:border-gray-200 active:scale-[0.98]">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-navy-900 mb-0.5">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
          <div className="text-gray-300 group-hover:text-gray-400 transition-colors">
            <ArrowIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// Icons
// ============================================

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );
}
