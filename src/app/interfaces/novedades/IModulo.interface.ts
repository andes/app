export interface IModulo {
    _id: string;
    nombre: string;
    nombreSubmodulo: string;
    descripcion: string;
    subtitulo: string;
    color: string;
    icono: string;
    linkAcceso: string;
    permisos: [string];
    activo: boolean;
    principal: boolean;
    submodulos: [any];
}
