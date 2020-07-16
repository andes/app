export interface IArgumentoQuery {
    key: string;
    descripcion?: string;
    label: string; // label en HTML
    param: string;
    componente: string;
    tipo: string;
    nombre: string; // name en html
    valor: any;  // contenido del parámetro
    required?: boolean; // campo requerido (aun no usado desde BD)
}
