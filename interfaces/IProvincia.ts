export interface IProvincia{
    nombre: String;
    localidades: [ {
            nombre: String,
            codigoPostal: String,
        }]
}