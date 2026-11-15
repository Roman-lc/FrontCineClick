import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import AyudaFlotante from './AyudaFlotante';
import BarraAdmin from './BarraAdmin';
import { useAuth } from '../../app/useAuth';
import { useColorDeTema } from '../../lib/useColorDeTema';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();
  const { isAdmin } = useAuth();
  useColorDeTema();
  const mainRef = useRef(null);
  const rutaAnterior = useRef(pathname);

  useEffect(() => {
    if (rutaAnterior.current === pathname) return;
    rutaAnterior.current = pathname;
    window.scrollTo(0, 0);
    mainRef.current?.focus();
  }, [pathname]);

  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      {isAdmin && <BarraAdmin />}
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <AyudaFlotante />
    </>
  );
}
