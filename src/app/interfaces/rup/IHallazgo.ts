export interface IHallazgo {
    concepto: {
        conceptId: String;
        term: String;
        fsn: String;
        semanticTag: String;
    };
    evoluciones: [{
        fechaCarga: Date,
        fechaInicio: Date,
        descripcion: String,
        estado: String,
        esCronico: Boolean,
        esEnmienda: Boolean,
        evolucion: String
    }];
}
