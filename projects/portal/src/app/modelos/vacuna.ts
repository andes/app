export class Vacuna {
    id: number;
    fecha: string;
    codificacion: string;
    organizacion: string;
    nombre: string;
    dosis: string;
    esquema: string;
    lote: number;
    adjuntos: boolean;
    datosPrestacion: [
        {
            profesionales: string;
            organizacion: string;
        }
    ];
}