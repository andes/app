export interface ICiudadano {
    id: string;
    fechaRegistro: Date,
    nroTramite: string,
    documento: string;
    nombre: string;
    apellido: string;
    sexo: string
    fechaNacimiento: Date,
    cuil: string;
    telefono: string;
    localidad: string;
    estado: string;
}