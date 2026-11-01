// Conjuntos cerrados: replican los enums del backend (que es la fuente de verdad) para armar los
// selects de los formularios y mostrar cada valor con su texto.

export const PROVINCIAS = [
  { valor: 'CABA', texto: 'Ciudad Autónoma de Buenos Aires', corto: 'CABA' },
  { valor: 'BUENOS_AIRES', texto: 'Buenos Aires' },
  { valor: 'CATAMARCA', texto: 'Catamarca' },
  { valor: 'CHACO', texto: 'Chaco' },
  { valor: 'CHUBUT', texto: 'Chubut' },
  { valor: 'CORDOBA', texto: 'Córdoba' },
  { valor: 'CORRIENTES', texto: 'Corrientes' },
  { valor: 'ENTRE_RIOS', texto: 'Entre Ríos' },
  { valor: 'FORMOSA', texto: 'Formosa' },
  { valor: 'JUJUY', texto: 'Jujuy' },
  { valor: 'LA_PAMPA', texto: 'La Pampa' },
  { valor: 'LA_RIOJA', texto: 'La Rioja' },
  { valor: 'MENDOZA', texto: 'Mendoza' },
  { valor: 'MISIONES', texto: 'Misiones' },
  { valor: 'NEUQUEN', texto: 'Neuquén' },
  { valor: 'RIO_NEGRO', texto: 'Río Negro' },
  { valor: 'SALTA', texto: 'Salta' },
  { valor: 'SAN_JUAN', texto: 'San Juan' },
  { valor: 'SAN_LUIS', texto: 'San Luis' },
  { valor: 'SANTA_CRUZ', texto: 'Santa Cruz' },
  { valor: 'SANTA_FE', texto: 'Santa Fe' },
  { valor: 'SANTIAGO_DEL_ESTERO', texto: 'Santiago del Estero' },
  { valor: 'TIERRA_DEL_FUEGO', texto: 'Tierra del Fuego, Antártida e Islas del Atlántico Sur', corto: 'Tierra del Fuego' },
  { valor: 'TUCUMAN', texto: 'Tucumán' },
];

export const BARRIOS_CABA = [
  'Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita',
  'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers',
  'Mataderos', 'Monte Castro', 'Monserrat', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda',
  'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra',
  'San Cristóbal', 'San Nicolás', 'San Telmo', 'Vélez Sarsfield', 'Versalles', 'Villa Crespo',
  'Villa del Parque', 'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro', 'Villa Ortúzar',
  'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza',
];

export const CLASIFICACIONES = [
  { valor: 'ATP', texto: 'ATP', completo: 'Apta para todo público', edad: 0 },
  { valor: 'MAS_13', texto: '+13', completo: 'Apta para mayores de 13 años', edad: 13 },
  { valor: 'MAS_16', texto: '+16', completo: 'Apta para mayores de 16 años', edad: 16 },
  { valor: 'MAS_18', texto: '+18', completo: 'Apta para mayores de 18 años', edad: 18 },
];

export const IDIOMAS = [
  { valor: 'CASTELLANO', texto: 'Castellano', corto: 'Cast.' },
  { valor: 'SUBTITULADA', texto: 'Subtitulada', corto: 'Subt.' },
];

export const GENEROS = [
  { valor: 'ACCION', texto: 'Acción' },
  { valor: 'COMEDIA', texto: 'Comedia' },
  { valor: 'DRAMA', texto: 'Drama' },
  { valor: 'TERROR', texto: 'Terror' },
  { valor: 'CIENCIA_FICCION', texto: 'Ciencia ficción' },
  { valor: 'ANIMACION', texto: 'Animación' },
  { valor: 'DOCUMENTAL', texto: 'Documental' },
];

export const FORMATOS_FUNCION = [
  { valor: 'DOS_D', texto: '2D' },
  { valor: 'TRES_D', texto: '3D' },
  { valor: 'IMAX', texto: 'IMAX' },
  { valor: 'CUATRO_D', texto: '4D' },
];

export const TIPOS_SALA = [
  { valor: 'TRADICIONAL', texto: 'Tradicional' },
  { valor: 'PREMIUM', texto: 'Premium' },
  { valor: 'IMAX', texto: 'IMAX' },
  { valor: 'CUATRO_D', texto: '4D' },
];

// Busca el elemento de un catalogo por su valor; si no esta (un valor nuevo del backend) devuelve
// uno armado con el valor tal cual, para no ocultar el dato.
export function itemDe(catalogo, valor) {
  return catalogo.find((item) => item.valor === valor) ?? { valor, texto: valor ?? '' };
}
