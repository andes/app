import { Vacuna } from '../modelos/vacuna';

export const VACUNAS: Vacuna[] = [
    {
        id: 4660007930616,
        fecha: '23/01/2021',
        codificacion: 'Z26.9 - Necesidad de inmunización contra enfermedad infecciosa no especificada',
        organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
        nombre: 'Sputnik V COVID19 Instituto Gamaleya',
        dosis: '2da Dosis - rAd5-s',
        esquema: 'Personal de Salud',
        lote: 4660007930616,
        adjuntos: false,
        datosPrestacion: [
            {
                profesionales: 'Monteverde, María Laura',
                organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
            }
        ],
    },
    {
        id: 486081120,
        fecha: '21/01/2021',
        codificacion: 'Z26.9 - Necesidad de inmunización contra enfermedad infecciosa no especificada',
        organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
        nombre: 'Sputnik V COVID19 Instituto Gamaleya',
        dosis: '1ra Dosis - rAd5-s',
        esquema: 'Personal de Salud',
        lote: 486081120,
        adjuntos: false,
        datosPrestacion: [
            {
                profesionales: 'Monteverde, María Laura',
                organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
            }
        ],
    },
    {
        id: 12329,
        fecha: '26/03/2020',
        codificacion: 'Z26.9 - Necesidad de inmunización contra enfermedad infecciosa no especificada',
        organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
        nombre: 'Antigripal',
        dosis: 'Dosis Anual',
        esquema: 'Personal de Salud',
        lote: 12329,
        adjuntos: false,
        datosPrestacion: [
            {
                profesionales: 'Molini, Walter Juan',
                organizacion: 'HOSPITAL PROVINCIAL NEUQUEN - DR. EDUARDO CASTRO RENDON',
            }
        ],
    },
];
