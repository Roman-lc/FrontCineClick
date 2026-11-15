import { useState } from 'react';

export function useFormulario(iniciales, validadores, onSucio) {
  const [valores, setValores] = useState(iniciales);
  const [tocados, setTocados] = useState({});
  const [errores, setErrores] = useState({});
  const [servidor, setServidor] = useState({});

  const validar = (campo, v) => validadores[campo]?.(v) ?? null;

  const actualizar = (nuevos) => {
    setValores(nuevos);
    onSucio?.(JSON.stringify(nuevos) !== JSON.stringify(iniciales));
  };

  const cambiar = (campo, valor) => {
    const nuevos = { ...valores, [campo]: valor };
    actualizar(nuevos);
    setServidor((s) => ({ ...s, [campo]: undefined }));
    if (tocados[campo]) setErrores((e) => ({ ...e, [campo]: validar(campo, nuevos) }));
  };

  const salir = (campo, normalizar) => {
    const nuevos = normalizar ? { ...valores, [campo]: normalizar(valores[campo]) } : valores;
    if (normalizar && nuevos[campo] !== valores[campo]) actualizar(nuevos);
    setTocados((t) => ({ ...t, [campo]: true }));
    setErrores((e) => ({ ...e, [campo]: validar(campo, nuevos) }));
  };

  const validarTodo = () => {
    const campos = Object.keys(validadores);
    const encontrados = Object.fromEntries(campos.map((c) => [c, validar(c, valores)]).filter(([, e]) => e));
    setErrores(encontrados);
    setTocados(Object.fromEntries(campos.map((c) => [c, true])));
    return campos.find((c) => encontrados[c]) ?? null;
  };

  const error = (campo) => servidor[campo] || (tocados[campo] ? errores[campo] : undefined) || undefined;

  return { valores, cambiar, salir, validarTodo, error, setServidor };
}
