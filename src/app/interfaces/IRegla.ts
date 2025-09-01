export interface IRegla {
    origen: {
        organizacion: {
            nombre: string;
            id: string;
        };
        prestaciones: [
            {
                // prestacion: SnomedConcept,
                auditable: {
                    type: boolean;
                    default: false;
                };
            }
        ];
    };
    destino: {
        organizacion: {
            nombre: string;
            id: string;
        };
        prestacion: {
            id: string;
            conceptId: string;
            term: string;
            fsn: string;
            // semanticTag: SemanticTag
        };
    };
}
