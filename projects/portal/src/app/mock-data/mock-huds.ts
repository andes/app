import { Huds } from '../modelos/huds';

export const HUDS: Huds[] = [
    {
        id: 10,
        icono: 'termometro',
        color: 'info',
        fecha: '27/01/2021',

        tituloPrincipal: 'Registro de signos vitales',
        subtituloPrincipal: 'Molini, Walter Juan',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Unidad de terapia intensiva de adultos',

        tituloTerciario: 'Evolución',
        subtituloTerciario: 'Temperatura de 37,5. T.A baja: 96, alta: 125 mmHg. Saturación: 96%. Peso: 75 Kg. Talla: 185 cms.',

        badgePrincipal: 'activo',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 11,
        icono: 'recipiente',
        color: 'success',
        fecha: '03/11/2020',

        tituloPrincipal: 'Hemograma',
        subtituloPrincipal: 'Molini, Walter Juan',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Servicio de hemoterapia',

        tituloTerciario: 'Valor',
        subtituloTerciario: '52',

        badgePrincipal: 'activo',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 12,
        icono: 'trastorno',
        color: 'danger',
        fecha: '27/01/2021',

        tituloPrincipal: 'Hipertensión Arterial',
        subtituloPrincipal: 'Molini, Walter Juan',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Servicio de Clínica Médica',

        tituloTerciario: 'Evolución',
        subtituloTerciario: 'Tensión arterial dentro de los valores de referencia. T.A baja: 96, alta: 125 mmHg.',

        badgePrincipal: 'activo',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 13,
        icono: 'lupa-ojo',
        color: 'warning',
        fecha: '17/11/2021',

        tituloPrincipal: 'Antecedente familiar de asma',
        subtituloPrincipal: 'Monteverde, María Laura',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Servicio de Clínica Médica',

        tituloTerciario: 'Evolución',
        subtituloTerciario: 'paciente refiere disnea que se intensifica con el esfuerzo. Presencia de sibilancias autoescuchadas durante la noche. Tos, No presenta historia de alergias. Antecedentes familiar de Asma. Durante los ultimos dias presenta fiebre que no cede 38º. Mucosidad serosa',

        badgePrincipal: 'activo',
        badgeSecundario: '38º',
        badgeTerciario: '',

    },
    {
        id: 14,
        icono: 'turno-bold',
        color: 'info',
        fecha: '17/09/2020 | 10:30',

        tituloPrincipal: 'Consulta general de Medicina',
        subtituloPrincipal: 'Rinaldi, Sebastián Lorenzo',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Carranza, María Hilda',

        tituloTerciario: 'Motivo de consulta',
        subtituloTerciario: 'Dolor de cabeza, vómitos, fiebre',

        badgePrincipal: 'no asististe',
        badgeSecundario: '10:32',
        badgeTerciario: 'mobile',

    },
    {
        id: 15,
        icono: 'mano-corazon',
        color: 'success',
        fecha: '07/04/2021 | 10:30',

        tituloPrincipal: 'consulta domiciliaria',
        subtituloPrincipal: 'Stefenelli, Ruben Horacio',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Unidad de Terapia Intermedia',

        tituloTerciario: 'Motivo de consulta',
        subtituloTerciario: 'Dolor de cabeza, perdida de olfato, fiebre',

        badgePrincipal: 'no asististe',
        badgeSecundario: '10:32',
        badgeTerciario: 'procedimiento',

    },
    {
        id: 16,
        icono: 'mano-corazon',
        color: 'info',
        fecha: '17/09/2020 | 10:30',

        tituloPrincipal: 'Consulta general de Medicina',
        subtituloPrincipal: 'Rinaldi, Sebastián Lorenzo',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Carranza, María Hilda',

        tituloTerciario: 'Motivo de consulta',
        subtituloTerciario: 'Dolor de cabeza, vómitos, fiebre',

        badgePrincipal: '',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 17,
        icono: 'pildoras',
        color: 'success',
        fecha: '21/12/2020',

        tituloPrincipal: 'Enalapril 5 Mg/Ml, Solución Oral | Tabletas',
        subtituloPrincipal: 'Enalapril | 3 Envases',

        tituloSecundario: 'indicación',
        subtituloSecundario: '20 mg diarios durante 60 días | suministro oral',

        tituloTerciario: 'Nota',
        subtituloTerciario: 'El paciente presenta 3 episodios por día',

        badgePrincipal: 'vigente',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 18,
        icono: 'vacuna',
        color: 'info',
        fecha: '23/01/2021',

        tituloPrincipal: 'Sputnik V COVID19 Instituto Gamaleya',
        subtituloPrincipal: 'Z26.9 - Necesidad de inmunización contra enfermedad infecciosa no especificada',

        tituloSecundario: 'Hospital Provincial Neuquén',
        subtituloSecundario: 'Servicio de guardia',

        tituloTerciario: 'Esquema',
        subtituloTerciario: 'Personal de Salud',

        badgePrincipal: '2da Dosis - rAd5-s',
        badgeSecundario: '',
        badgeTerciario: '',

    },
    {
        id: 19,
        icono: 'pildoras',
        color: 'success',
        fecha: '03/10/2020',

        tituloPrincipal: 'Salbutamol | Inhalador',
        subtituloPrincipal: 'Ventolin | 2 unidades',

        tituloSecundario: 'indicación',
        subtituloSecundario: '20 mg diarios durante 3 meses | suministro oral',

        tituloTerciario: 'Nota',
        subtituloTerciario: 'Hipertensión esencial: Presión sistólica: 145 mm/Hg | Presión diastólica: 95 mm de Hg',

        badgePrincipal: 'vigente',
        badgeSecundario: 'próximo a renovar',
        badgeTerciario: '',
    },
];
