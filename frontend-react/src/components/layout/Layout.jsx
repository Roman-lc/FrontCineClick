import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  const { pathname } = useLocation();
  const mainRef = useRef(null);
  const rutaAnterior = useRef(pathname);

  // Al cambiar de pagina: volver arriba y llevar el foco al contenido,
  // asi quien navega con teclado o lector de pantalla no queda en el menu.
  // En la primera carga no se mueve el foco, para que el primer Tab llegue a "Saltar al contenido".
  // (Se compara con la ruta anterior y no con un "es la primera vez" porque StrictMode corre el efecto dos veces.)
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
      <Header />
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
