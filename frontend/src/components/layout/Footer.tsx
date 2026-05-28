export default function Footer() {
  return (
    <footer className="bg-kleia-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xl font-bold font-heading tracking-tight">
              Kleia-up
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/70 font-body">
            <a
              href="https://kleia-up.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              kleia-up.fr
            </a>
            <a
              href="mailto:contact@kleia-up.fr"
              className="hover:text-white transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-sm text-white/60 font-body">
            &copy; {new Date().getFullYear()} Kleia-up. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}