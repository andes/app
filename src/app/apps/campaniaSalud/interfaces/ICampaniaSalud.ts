export interface ICampaniaSalud {
    id?: String;
    asunto: string;
    cuerpo: string;
    link: string;
    imagen: string;
    target: {
        sexo: string,
        grupoEtareo: {
            desde: Number,
            hasta: Number
        }
    };
    vigencia: {
        desde: Date,
        hasta: Date
    }
    fechaPublicacion: Date;
    activo: boolean;
    textoAccion: String;
}