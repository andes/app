export class Organizacion {
    id: Number;
    nombre: String;
    tipoEstablecimiento: String;
    // direccion
    direccion: String;
    zona: String;
    ciudad: String;
    // contacto
    contacto: String;
    telefono: String;
    foto: String;
    edificio: [{
        id: String,
        descripcion: String,
        contacto: String,
        direccion: String,
    }];
    espacioFisico: {
        id: string,
        nombre: string,
        servicio: {
            id: string,
            nombre: string
        };
        sector: {
            id: string,
            nombre: string
        };
    };
    nivelComplejidad: Number;
    activo: Boolean;
    fechaAlta: String;
    fechaBaja: String;
    servicios: String;
    mapaSectores: String;
    unidadesOrganizativas: String;
    showMapa?: boolean;
    aceptaDerivacion?: boolean;
    esCOM?: boolean;
    trasladosEspeciales?: Boolean;
}
