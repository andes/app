export interface ICiudadano {
    id: string;
    fechaRegistro: Date;
    nroTramite: string;
    grupo: string;
    documento: string;
    nombre: string;
    apellido: string;
    sexo: string;
    fechaNacimiento: Date;
    telefono: string;
    email: string;
    localidad: string;
    estado: string;
    alergia: boolean;
    condicion: boolean;
    enfermedad: boolean;
    convaleciente: boolean;
    aislamiento: boolean;
    vacuna: boolean;
    plasma: boolean;
    mamar: boolean;
    embarazada: boolean;
    establecimiento: string;
    localidadEstablecimiento: string;
    relacion: string;
}
