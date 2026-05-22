import { useRef, type ReactNode } from 'react';

interface SkipLinkProps {
  children?: ReactNode;
}

export default function SkipLink({ children }: SkipLinkProps) {
  const skipRef = useRef<HTMLAnchorElement>(null);

  return (
    <>
      <a
        ref={skipRef}
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-kleia-violet focus:border-2 focus:border-kleia-violet focus:rounded-kleia focus:shadow-lg focus:outline-none"
        tabIndex={0}
      >
        Aller au contenu principal
      </a>
      {children}
    </>
  );
}
