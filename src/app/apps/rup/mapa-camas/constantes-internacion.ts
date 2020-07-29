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

export const diagnosticosNoMasculinos = [
    { desde: 'A00', hasta: 'B26.0' },
    { desde: 'B26.0', hasta: 'C60.0' },
    { desde: 'C63.9', hasta: 'D07.4' },
    { desde: 'D07.6', hasta: 'D17.6' },
    { desde: 'D17.6', hasta: 'D29.0' },
    { desde: 'D29.9', hasta: 'D40.0' },
    { desde: 'D40.9', hasta: 'E29.0' },
    { desde: 'E29.9', hasta: 'E89.5' },
    { desde: 'E89.5', hasta: 'F52.4' },
    { desde: 'F52.4', hasta: 'I86.1' },
    { desde: 'I86.1', hasta: 'L29.1' },
    { desde: 'L29.1', hasta: 'N40.0' },
    { desde: 'N51.8', hasta: 'Q53.0' },
    { desde: 'Q55.9', hasta: 'R86' },
    { desde: 'R86', hasta: 'S31.2' },
    { desde: 'S31.3', hasta: 'Z12.4' },
    { desde: 'Z12.6', hasta: 'Z99.9' }
];

export const diagnosticosNoFemeninos = [
    { desde: 'A00', hasta: 'A34' },
    { desde: 'A34', hasta: 'B37.3' },
    { desde: 'B37.3', hasta: 'C51.0' },
    { desde: 'C58', hasta: 'C79.6' },
    { desde: 'C79.6', hasta: 'D06.0' },
    { desde: 'D07.3', hasta: 'D25.0' },
    { desde: 'D28.9', hasta: 'D39.0' },
    { desde: 'D39.9', hasta: 'E28.0' },
    { desde: 'E28.9', hasta: 'E89.4' },
    { desde: 'E89.4', hasta: 'F52.5' },
    { desde: 'F52.5', hasta: 'F53.0' },
    { desde: 'F53.9', hasta: 'I86.3' },
    { desde: 'I86.3', hasta: 'L29.2' },
    { desde: 'L29.2', hasta: 'L70.5' },
    { desde: 'L70.5', hasta: 'M80.0' },
    { desde: 'M80.1', hasta: 'M81.0' },
    { desde: 'M81.1', hasta: 'M83.0' },
    { desde: 'M83.0', hasta: 'N70.0' },
    { desde: 'N98.9', hasta: 'N99.2' },
    { desde: 'N99.3', hasta: 'O00.0' },
    { desde: 'O99.8', hasta: 'P54.6' },
    { desde: 'P54.6', hasta: 'Q50.0' },
    { desde: 'Q52.9', hasta: 'R87' },
    { desde: 'R87', hasta: 'S31.4' },
    { desde: 'S31.4', hasta: 'S37.4' },
    { desde: 'S37.6', hasta: 'T19.2' },
    { desde: 'T19.3', hasta: 'T83.3' },
    { desde: 'T83.3', hasta: 'Z01.4' },
    { desde: 'Z01.4', hasta: 'Z12.4' },
    { desde: 'Z12.4', hasta: 'Z30.1' },
    { desde: 'Z30.1', hasta: 'Z30.3' },
    { desde: 'Z30.3', hasta: 'Z30.5' },
    { desde: 'Z30.5', hasta: 'Z31.1' },
    { desde: 'Z31.1', hasta: 'Z31.2' },
    { desde: 'Z31.2', hasta: 'Z32.0' },
    { desde: 'Z37.9', hasta: 'Z39.0' },
    { desde: 'Z39.2', hasta: 'Z43.7' },
    { desde: 'Z43.7', hasta: 'Z87.5' },
    { desde: 'Z87.5', hasta: 'Z97.5' },
    { desde: 'Z97.5', hasta: 'Z99.9' }
];
