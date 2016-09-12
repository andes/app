export interface IDomicilio{
    calle: String;
    numero: Number;
    localidad: {
            nombre: String,
            codigoPostal: String,
        }
    provincia: String;

}