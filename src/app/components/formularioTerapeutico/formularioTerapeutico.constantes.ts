export interface ISistemaFTP {
    id: string;
    codigo: string;
    nombre: string;
    icon: string;
    color: string;
}

export interface IMedicamentoFTP {
    _id?: string;
    sistema: { id: string; codigo: string; nombre: string };
    funcion: string;
    grupoFarmacologico?: string;
    descripcion: string;
    concepto?: { conceptId: string; term: string; fsn?: string; semanticTag?: string };
    nivelComplejidad?: string;
    especialidades?: string[];
    requisitos?: string;
    carroEmergencia?: string;
    indicaciones?: string;
    recomendaciones?: string;
    atc?: string;
    principioActivo?: string;
    via?: string;
    formaFarmaceutica?: string;
    potencia?: string;
    unidades?: string;
    presentacion?: string;
    borrado?: boolean;
}

export interface IOpcionFTP {
    id: string;
    nombre: string;
}

export const SISTEMAS_FTP: ISistemaFTP[] = [
    { id: 'respiratorio', codigo: '01', nombre: 'Sistema respiratorio', icon: 'pulmones-outline', color: '#00A5DD' },
    { id: 'vacunas', codigo: '14', nombre: 'Inmunología y vacunas', icon: 'vacuna', color: '#107CE6' },
    { id: 'gastrointestinal', codigo: '07', nombre: 'Sistema gastrointestinal', icon: 'gastrointestinal-outline', color: '#0443BF' },
    { id: 'cardiovascular', codigo: '02', nombre: 'Sistema cardiovascular', icon: 'corazon-outline', color: '#5700FF' },
    { id: 'genitourinario', codigo: '12', nombre: 'Aparato genitourinario', icon: 'riñones-outline', color: '#BA00FF' },
    { id: 'antineoplasicos-e-inmunosupresores', codigo: '18', nombre: 'Antineoplásicos e inmunosupresores', icon: 'antineoplasicos', color: '#E6104E' },
    { id: 'endocrino', codigo: '09', nombre: 'Sistema endocrino', icon: 'garganta', color: '#FF00A4' },
    { id: 'anticonceptivos', codigo: '21', nombre: 'Anticonceptivos', icon: 'aco-outline', color: '#C54B8C' },
    { id: 'anestesicos', codigo: '16', nombre: 'Anestésicos', icon: 'anestesia', color: '#F4A47E' },
    { id: 'emergencias-toxicologicas', codigo: '20', nombre: 'Emergencias toxicológicas', icon: 'toxi-emer', color: '#FFD400' },
    { id: 'analgesicos-puros', codigo: '04', nombre: 'Analgésicos puros', icon: 'frasco-outline', color: '#FF9D00' },
    { id: 'nervioso-central', codigo: '10', nombre: 'Sistema nervioso central', icon: 'sist-nervioso', color: '#EE5A24' },
    { id: 'sanguineo', codigo: '08', nombre: 'Sistema sanguíneo', icon: 'uni-gota', color: '#FF0000' },
    { id: 'contraste-radiologicos', codigo: '19', nombre: 'Contrastes radiológicos', icon: 'rayos', color: '#96001C' },
    { id: 'antinflamatorios', codigo: '05', nombre: 'Antiinflamatorios, analgésicos y antipiréticos', icon: 'pildora', color: '#A8102E' },
    { id: 'bloqueantes-neuromusculares', codigo: '17', nombre: 'Bloqueantes neuromusculares', icon: 'bloqueante', color: '#897150' },
    { id: 'oftalmologico', codigo: '13', nombre: 'Uso oftalmológico, otorrinolaringológico y odontológico', icon: 'oftalmologico', color: '#4A5E18' },
    { id: 'antiinfecciosos', codigo: '03', nombre: 'Antiinfecciosos', icon: 'infeccioso', color: '#72E8D7' },
    { id: 'metabolismo', codigo: '06', nombre: 'Metabolismo y medio interno', icon: 'metabolismo', color: '#5CB55C' },
    { id: 'antisepticos-y-desinfectantes', codigo: '15', nombre: 'Antisépticos y desinfectantes', icon: 'otro-frasco', color: '#6B8E23' },
    // Sin ícono propio en el maquetado: se usa uno genérico hasta que diseño defina el definitivo
    { id: 'trastornos-inmunologicos', codigo: '11', nombre: 'Trastornos inmunológicos', icon: 'escudo-check', color: '#00838F' }
];

export function getSistemaFTP(id: string): ISistemaFTP {
    return SISTEMAS_FTP.find(sistema => sistema.id === id);
}

export function opcionesDistintas(valores: string[]): IOpcionFTP[] {
    return Array.from(new Set(valores.filter(valor => !!valor)))
        .sort((a, b) => a.localeCompare(b))
        .map(valor => ({ id: valor, nombre: valor }));
}

export function normalizarTexto(texto: string): string {
    return (texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}
