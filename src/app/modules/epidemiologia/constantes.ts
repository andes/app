export const tipoContactos = [
    { id: 'conviviente', nombre: 'Conviviente' },
    { id: 'laboral', nombre: 'Laboral' },
    { id: 'social', nombre: 'Social' },
    { id: 'noConviviente', nombre: 'Familiar no conviviente' }
];

export const estadosSeguimiento = [
    { id: 'pendiente', nombre: 'Pendiente' },
    { id: 'seguimiento', nombre: 'Seguimiento' },
    { id: 'alta', nombre: 'De Alta' },
    { id: 'fallecido', nombre: 'Fallecido' }
];

export const SECCION_CLASIFICACION = 'Tipo de confirmación y Clasificación Final';
export const SECCION_OPERACIONES = 'Operaciones';
export const SECCION_MPI = 'Mpi';
export const SECCION_CONTACTOS_ESTRECHOS = 'Contactos Estrechos';
export const SECCION_USUARIO = 'Usuario';
export const SECCION_LABORATORIO = 'Laboratorio';
export const FIELD_PRC = 'identificadorpcr';
export const SECCION_ESTRATEGIA = 'Definición de estratégia de vigilancia';
export const SECCION_SIGNOS_SINTOMAS = 'Signos y Sintomas';


export const TYPE_FICHA = Object.freeze({
    UMA: 'UMA',
    COVID: 'covid19',
    HANTAVIRUS: 'Hantavirus'
});

export const CLASIFICACIONESVSR = [
    {
        'id': 'InternadoY_Ofallecid_COVID_IRA',
        'nombre': 'Internado y/o fallecido por COVID-19 o IRA'
    },
    {
        'id': 'Unidad_UC-IRAG',
        'nombre': 'Unidad centinela de infección respiratoria aguda grave (UC-IRAG)'
    },
    {
        'id': 'MonitoreoVSRAmbulatorio',
        'nombre': 'Monitoreo de SARS-CoV2, influenza y VSR en ambulatorios'
    },
    {
        'id': 'ControlAmbulatorio',
        'nombre': 'COVID-19, influenza y OVR en ambulatorio'
    }
];
