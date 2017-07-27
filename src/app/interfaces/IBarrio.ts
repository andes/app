export interface IBarrio {
    id: String;
    nombre: String;
    localidad: {
            _id: String,
            nombre: String
        };
}
