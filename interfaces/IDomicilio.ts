export interface IDomicilio{
    calle: String;
    numero: Number;
    provincia: {
        nombre: String,
        localidad: {
        nombre: String,
        codigoPostal: String,
    };
    }


}