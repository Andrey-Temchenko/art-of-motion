'use client';

import {ArrowUp} from 'lucide-react';
import {useEffect, useState} from 'react';

export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

  return (
    <button
      onClick={scrollToTop}
      className={`group bg-brand-balance ring-brand-stretch/30 hover:ring-brand-stretch/60 fixed right-6 bottom-6 z-50 flex size-14 cursor-pointer items-center justify-center rounded-full text-white shadow-xl ring-4 transition-all duration-300 hover:scale-110 active:scale-95 md:right-10 md:bottom-10 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-8 opacity-0'
      }`}
      aria-label="Scroll to top"
    >
      <ArrowUp className="size-6" strokeWidth={2.5} />
    </button>
  );
}
