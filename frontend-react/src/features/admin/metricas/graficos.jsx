import { useState } from 'react';
import { Bar, BarChart, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { miles, pesos } from './formato';
import { useThemeColors } from './useThemeColors';
import admin from '../../../components/admin/admin.module.css';
import styles from './metricas.module.css';

// Graficos hechos con Recharts. Para los lectores de pantalla cada uno tiene una tabla visualmente
// oculta con los mismos datos (el SVG queda aria-hidden).

const estiloTooltip = (c) => ({
  contentStyle: { background: c.superficie, border: `1px solid ${c.borde}`, borderRadius: 6, color: c.texto, fontSize: 13 },
  labelStyle: { color: c.texto, fontWeight: 700 },
  itemStyle: { color: c.texto },
  cursor: { fill: c.superficie2 },
});

export function RankingPeliculas({ ranking }) {
  const colores = useThemeColors();
  const [medida, setMedida] = useState('entradas');
  const formatear = medida === 'entradas' ? miles : pesos;
  const datos = [...ranking].sort((a, b) => Number(b[medida]) - Number(a[medida])).map((p) => ({ ...p, valor: Number(p[medida]) }));

  return (
    <>
      <div className={`${admin.segmentos} ${styles.selectorRanking}`} role="group" aria-label="Ordenar el ranking por">
        {[
          ['entradas', 'Entradas'],
          ['ingresos', 'Ingresos'],
        ].map(([valor, texto]) => (
          <button key={valor} type="button" className={admin.segmento} aria-pressed={medida === valor} onClick={() => setMedida(valor)}>
            {texto}
          </button>
        ))}
      </div>
      {colores && (
        <div aria-hidden="true" className={styles.grafico}>
          <ResponsiveContainer width="100%" height={Math.max(160, datos.length * 34 + 20)}>
            <BarChart data={datos} layout="vertical" margin={{ top: 4, right: 72, bottom: 4, left: 4 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="titulo"
                width={150}
                tickLine={false}
                axisLine={{ stroke: colores.borde }}
                tick={{ fill: colores.texto, fontSize: 12 }}
                tickFormatter={(t) => (t.length > 22 ? `${t.slice(0, 21)}…` : t)}
              />
              <Tooltip {...estiloTooltip(colores)} formatter={(v) => [formatear(v), medida === 'entradas' ? 'Entradas' : 'Ingresos']} />
              <Bar dataKey="valor" fill={colores.texto} radius={[0, 4, 4, 0]} barSize={18} isAnimationActive={false}>
                <LabelList dataKey="valor" position="right" formatter={formatear} fill={colores.texto} fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <table className="visually-hidden">
        <caption>Ranking de películas por {medida}</caption>
        <thead>
          <tr>
            <th scope="col">Película</th>
            <th scope="col">Entradas</th>
            <th scope="col">Ingresos</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((p) => (
            <tr key={p.peliculaId}>
              <th scope="row">{p.titulo}</th>
              <td>{miles(p.entradas)}</td>
              <td>{pesos(p.ingresos)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

export function TiposEntrada({ tipos }) {
  const colores = useThemeColors();
  if (!colores) return null;
  const paleta = [colores.texto, colores.media, colores.bordeInput];
  const datos = tipos.map((t, i) => ({ ...t, cantidad: Number(t.cantidad), fill: paleta[i % paleta.length] }));
  const total = datos.reduce((suma, t) => suma + t.cantidad, 0);

  return (
    <div className={styles.anillo}>
      <div aria-hidden="true" className={styles.anilloGrafico}>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={datos} dataKey="cantidad" nameKey="nombre" innerRadius={52} outerRadius={80} paddingAngle={2} stroke={colores.superficie} isAnimationActive={false} />
            <Tooltip {...estiloTooltip(colores)} formatter={(v, nombre) => [`${miles(v)} entradas`, nombre]} />
          </PieChart>
        </ResponsiveContainer>
        <p className={styles.anilloCentro}>
          <strong>{miles(total)}</strong>
          <span>entradas</span>
        </p>
      </div>
      <div className={styles.tablaChicaCaja}>
        <table className={styles.tablaChica}>
          <caption className="visually-hidden">Entradas vendidas por tipo</caption>
          <thead>
            <tr>
              <th scope="col">Tipo</th>
              <th scope="col">Cantidad</th>
              <th scope="col">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            {datos.map((t) => (
              <tr key={t.tipo}>
                <th scope="row">
                  <span className={styles.muestra} style={{ background: t.fill }} aria-hidden="true" />
                  {t.nombre}
                </th>
                <td>{miles(t.cantidad)}</td>
                <td>{pesos(t.ingresos)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
