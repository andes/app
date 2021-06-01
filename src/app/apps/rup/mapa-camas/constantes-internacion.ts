export const modelInformeIngreso = {
    fechaIngreso: new Date(),
    horaNacimiento: new Date(),
    edadAlIngreso: null,
    origen: null,
    ocupacionHabitual: null,
    situacionLaboral: null,
    nivelInstruccion: null,
    especialidades: [],
    asociado: null,
    obraSocial: null,
    nroCarpeta: null,
    motivo: null,
    organizacionOrigen: null,
    profesional: null,
    PaseAunidadOrganizativa: null
};

export const snomedIngreso = {
    fsn: 'documento de solicitud de admisión (elemento de registro)',
    semanticTag: 'elemento de registro',
    conceptId: '721915006',
    term: 'documento de solicitud de admisión'
};

export const snomedEgreso = {
    fsn: 'alta del paciente (procedimiento)',
    semanticTag: 'procedimiento',
    conceptId: '58000006',
    term: 'alta del paciente'
};

export const pacienteAsociado = [
    { id: 'Plan de salud privado o Mutual', nombre: 'Plan de salud privado o Mutual' },
    { id: 'Plan o Seguro público', nombre: 'Plan o Seguro público' },
    { id: 'Ninguno', nombre: 'Ninguno' }
];

export const origenHospitalizacion = [
    { id: 'consultorio externo', nombre: 'Consultorio externo' },
    { id: 'emergencia', nombre: 'Emergencia' },
    { id: 'traslado', nombre: 'Traslado' },
    { id: 'sala de parto', nombre: 'Sala de parto' },
    { id: 'otro', nombre: 'Otro' }
];

export const nivelesInstruccion = [
    { id: 'ninguno', nombre: 'Ninguno' },
    { id: 'primario incompleto', nombre: 'Primario incompleto' },
    { id: 'primario completo', nombre: 'Primario completo' },
    { id: 'secundario incompleto', nombre: 'Secundario incompleto' },
    { id: 'secundario completo', nombre: 'Secundario completo' },
    { id: 'Ciclo EGB (1 y 2) incompleto', nombre: 'Ciclo EGB (1 y 2) incompleto' },
    { id: 'Ciclo EGB (1 y 2) completo', nombre: 'Ciclo EGB (1 y 2) completo' },
    { id: 'Ciclo EGB 3 incompleto', nombre: 'Ciclo EGB 3 incompleto' },
    { id: 'Ciclo EGB 3 completo', nombre: 'Ciclo EGB 3 completo' },
    { id: 'Polimodal incompleto', nombre: 'Polimodal incompleto' },
    { id: 'Polimodal completo', nombre: 'Polimodal completo' },
    { id: 'terciario/universitario incompleto', nombre: 'Terciario/Universitario incompleto' },
    { id: 'terciario/universitario completo', nombre: 'Terciario/Universitario completo' }
];

export const situacionesLaborales = [
    { id: 'Trabaja o está de licencia', nombre: 'Trabaja o está de licencia' },
    { id: 'No trabaja y busca trabajo', nombre: 'No trabaja y busca trabajo' },
    { id: 'No trabaja y no busca trabajo', nombre: 'No trabaja y no busca trabajo' }
];

export const modelRegistroInternacion = {
    destacado: false,
    esSolicitud: false,
    esDiagnosticoPrincipal: false,
    esPrimeraVez: undefined,
    relacionadoCon: [],
    nombre: 'alta del paciente',
    concepto: {
        fsn: 'alta del paciente (procedimiento)',
        semanticTag: 'procedimiento',
        conceptId: '58000006',
        term: 'alta del paciente'
    },
    valor: {
        InformeEgreso: {
            fechaEgreso: null,
            nacimientos: [
                {
                    pesoAlNacer: null,
                    condicionAlNacer: null,
                    terminacion: null,
                    sexo: null
                }
            ],
            procedimientosQuirurgicos: [],
            causaExterna: {
                producidaPor: null,
                lugar: null,
                comoSeProdujo: null
            },
        }
    }
};

export const listaTipoEgreso = [
    { id: 'Alta médica', nombre: 'Alta médica' },
    { id: 'Defunción', nombre: 'Defunción' },
    { id: 'Traslado', nombre: 'Traslado' },
    { id: 'Retiro Voluntario', nombre: 'Retiro Voluntario' },
    { id: 'Otro', nombre: 'Otro' }
];

export const causaExterna = {
    producidaPor: [
        { id: 'Accidente', nombre: 'Accidente' },
        { id: 'lesionAutoinfligida', nombre: 'Lesión autoinflingida' },
        { id: 'agresion', nombre: 'Agresión' }, { id: 'seIgnora', nombre: 'Se ignora' }
    ],
    lugar: [
        { id: 'domicilioParticular', nombre: 'Domicilio Particular' },
        { id: 'viaexport consto', nombre: 'Vía pública' },
        { id: 'lugarDetrabajo', nombre: 'Lugar de trabajo' },
        { id: 'otro', nombre: 'otro' },
        { id: 'seIgnora', nombre: 'Se ignora' }
    ]
};

export const opcionesTipoParto = [
    { id: 'Simple', label: 'Simple' },
    { id: 'Multiple', label: 'Multiple' }
];

export const opcionesCondicionAlNacer = [
    { id: 'Nac. Vivo', label: 'Nac. Vivo' },
    { id: 'Def. fetal', label: 'Def. fetal' }
];

export const opcionesTerminacion = [
    { id: 'Vaginal', label: 'Vaginal' },
    { id: 'Cesária', label: 'Cesária' }
];

export const opcionesSexo = [
    { id: 'femenino', label: 'femenino' },
    { id: 'masculino', label: 'masculino' },
    { id: 'indeterminado', label: 'indeterminado' }
];

export const aporteOxigeno = { conceptId: '261746005' };
export const respirador = { conceptId: '706172005' };
export const monitorTelemetrico = { conceptId: '706636004' };
export const monitorFisiologico = { conceptId: '5159002' };
