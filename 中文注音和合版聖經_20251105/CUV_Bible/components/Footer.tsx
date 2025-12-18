

import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
  prevLink: string | null;
  nextLink: string | null;
}

const NavButton: React.FC<{ to: string | null; children: React.ReactNode }> = ({ to, children }) => {
  if (!to) {
    return (
      <span className="px-6 py-2 rounded-md bg-stone-200 text-stone-400 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link 
      to={to} 
      className="px-6 py-2 rounded-md bg-sky-700 text-white hover:bg-sky-800 transition-colors shadow"
    >
      {children}
    </Link>
  );
};

const Footer: React.FC<FooterProps> = ({ prevLink, nextLink }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white shadow-inner z-10 flex flex-row-reverse items-center justify-between px-4 md:px-8 border-t border-stone-200">
      <NavButton to={prevLink}>
        &larr; 上一章
      </NavButton>
      <NavButton to={nextLink}>
        下一章 &rarr;
      </NavButton>
    </footer>
  );
};

export default Footer;