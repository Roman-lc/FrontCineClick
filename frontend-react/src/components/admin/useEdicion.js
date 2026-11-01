import { useState } from 'react';
import { erroresDeApi } from './erroresApi';

const iguales = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// Estado del formulario del drawer: valores, errores por campo (del front y del backend), cambios sin
// guardar y envio. Los ids de los controles siguen la convencion "campo-<nombre>" para poder llevar
// el foco al primer campo con error.
//   vacio: valores de un alta. aFormulario(item): valores para editar. validar(valores): { campo: error }.
//   guardar(valores, item): promesa del alta o la modificacion.
export function useEdicion({ vacio, aFormulario, validar, guardar, confirmar, onGuardado }) {
  const [edicion, setEdicion] = useState(null); // { item, inicial }
  const [valores, setValores] = useState(vacio);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  const abierto = edicion !== null;
  const sucio = abierto && !iguales(valores, edicion.inicial);

  const abrir = (item = null) => {
    const inicial = item ? aFormulario(item) : vacio;
    setEdicion({ item, inicial });
    setValores(inicial);
    setErrores({});
    setErrorGeneral('');
  };

  const cerrar = async () => {
    if (guardando) return;
    if (sucio) {
      const descartar = await confirmar({
        titulo: '¿Descartar los cambios?',
        mensaje: 'Hay cambios sin guardar en el formulario. Si cerrás, se pierden.',
        textoConfirmar: 'Descartar',
        textoCancelar: 'Seguir editando',
        peligro: true,
      });
      if (!descartar) return;
    }
    setEdicion(null);
  };

  // Al corregir un campo con error se vuelve a validar solo ese campo (asi el error se va al arreglarlo)
  const cambiar = (campo, valor) => {
    const nuevos = typeof campo === 'object' ? { ...valores, ...campo } : { ...valores, [campo]: valor };
    setValores(nuevos);
    const campos = typeof campo === 'object' ? Object.keys(campo) : [campo];
    if (campos.some((c) => errores[c])) {
      const validos = validar(nuevos);
      setErrores((prev) => {
        const siguiente = { ...prev };
        for (const c of campos) {
          if (validos[c]) siguiente[c] = validos[c];
          else delete siguiente[c];
        }
        return siguiente;
      });
    }
  };

  // Al salir de un campo se muestra su error, antes de enviar
  const tocar = (campo) => {
    const error = validar(valores)[campo];
    setErrores((prev) => {
      const siguiente = { ...prev };
      if (error) siguiente[campo] = error;
      else delete siguiente[campo];
      return siguiente;
    });
  };

  const enfocarPrimerError = (errs) => {
    const primero = Object.keys(errs)[0];
    if (primero) requestAnimationFrame(() => document.getElementById(`campo-${primero}`)?.focus());
  };

  const enviar = async (e) => {
    e.preventDefault();
    const errs = validar(valores);
    setErrores(errs);
    setErrorGeneral('');
    if (Object.keys(errs).length) {
      enfocarPrimerError(errs);
      return;
    }
    setGuardando(true);
    try {
      const resultado = await guardar(valores, edicion.item);
      setEdicion(null);
      onGuardado?.(resultado, edicion.item);
    } catch (err) {
      const { porCampo, general } = erroresDeApi(err);
      setErrores(porCampo);
      setErrorGeneral(general);
      enfocarPrimerError(porCampo);
    } finally {
      setGuardando(false);
    }
  };

  return { abierto, item: edicion?.item ?? null, valores, errores, errorGeneral, guardando, sucio, abrir, cerrar, cambiar, tocar, enviar };
}
