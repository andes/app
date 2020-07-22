export interface IModulo {
    _id: string;
    nombre: string;
    descripcion: string;
    subtitulo: string;
    color: string;
    icono: string;
    linkAcceso: string;
    permisos: [string];
}
