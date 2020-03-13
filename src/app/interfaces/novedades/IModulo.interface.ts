export interface IModulo {
    _id: string;
    nombre: string;
    descripcion: string;
    subtitulo: string;
    claseCss: string;
    icono: string;
    linkAcceso: string;
    permisos: [string];
}
