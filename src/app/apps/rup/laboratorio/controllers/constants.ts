
export const Constantes = {
    conceptoPruebaLaboratorio: {
        refsetIds: [
            '900000000000497000'
        ],
        conceptId: '15220000',
        term: 'prueba de laboratorio',
        fsn: 'prueba de laboratorio (procedimiento)',
        semanticTag: 'procedimiento',
        id: '5b76c3cabd7c1f8e598d7392'
    },
    conceptopracticaLaboratorio: {
        fsn: 'procedimiento de medición (procedimiento)',
        term: 'procedimiento de medición',
        conceptId: '122869004',
        semanticTag: 'procedimiento'
    },
    estadoValidada: { tipo: 'validada' },
    modos: {
        recepcion: {
            id: 0,
            nombre: 'recepcion',
            titulo: 'Recepcionar Paciente',
        },
        listado: {
            id: 1,
            nombre: 'listado',
            titulo: 'Listado'
        },
        control: {
            id: 2,
            nombre: 'control',
            titulo: 'Auditoría de Protocolos'
        },
        carga: {
            id: 3,
            nombre: 'carga',
            titulo: 'Carga de Resultados'
        },
        validacion: {
            id: 4,
            nombre: 'validacion',
            titulo: 'Validación de Resultados',
        },
        recepcionSinTurno: {
            id: 5,
            nombre: 'recepcionSinTurno',
            titulo: 'Recepcionar Paciente Sin Turno'
        }
    },
    estadosLotes: {
        preparado: 'preparado',
        transporte:  'en transporte',
        recibido: 'recibido'
    }
};

