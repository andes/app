export interface IRegla {
    origen: {
        organizacion: {
            nombre: string,
            id: string
        },
        prestaciones: [
            {
                // prestacion: SnomedConcept,
                auditable: {
                    type: Boolean,
                    default: false
                }
            }
        ],
    };
    destino: {
        organizacion: {
            nombre: string,
            id: string
        },
        prestacion: {
            id: string,
            conceptId: String,
            term: String,
            fsn: String,
            // semanticTag: SemanticTag
        }
    };
}
