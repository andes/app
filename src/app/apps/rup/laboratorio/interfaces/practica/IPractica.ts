
export interface IPractica {
    id: string;
    _id: any;
    codigo: string;
    codigoNomenclador: string;
    nombre: string;
    descripcion: string;
    concepto: {
        fsn: string,
        term: string,
        conceptId: string,
        semanticTag: string
    };
    sistema: {
        fsn: string,
        term: string,
        conceptId: string,
        semanticTag: string
    };
    tipoLaboratorio: {
        nombre: string,
        nomencladorProvincial: Number
    };
    area: {
        nombre: string,
        conceptoSnomed: {
            fsn: string,
            term: string,
            conceptId: string,
            semanticTag: string
        }
    };
    categoria: string;
    ordenImpresion: Number;
    unidadMedida: {
        fsn: string,
        term: string,
        conceptId: string,
        semanticTag: string
    };
    resultado: {
        formato: {
            tipo: string,
            decimales: Number,
            exponencial: Boolean,
            multiplicador: Number
        },
        resultadosAnteriores: [
            {
                valor: {
                    type: Number,
                    required: false
                },
                unidadMedida: String,
                fechaTomaMuestra: {
                    type: Date,
                    required: false,
                    es_indexed: true
                }

            }
        ]

    };
    reactivos: [
        {
            fabricante: string,
            denominacion: string,
            numeroReferencia: string,
            valoresReferencia: [
                {
                    sexo: string,
                    todasEdades: Boolean,
                    edadDesde: Number,
                    edadHasta: Number,
                    unidadEdad: string,
                    tipoValor: Number,
                    valorMinimo: Number,
                    valorMaximo: Number
                }
            ]
        }
    ];
    valoresCriticos: {
        minimo: Number,
        maximo: Number
    };
    requeridos: [];
    activo: Boolean;

}
