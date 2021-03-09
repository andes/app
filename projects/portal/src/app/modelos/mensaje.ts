import { Documento } from '../modelos/documento';

export class Mensaje {
    id: number;
    estado: boolean;
    prioridad: number;
    fecha: string;
    hora: String;
    autor: string;
    tipoPrestacion: string;
    remitente: string;
    efector: string;
    titulo: string;
    nota: string;
    adjuntos: Documento[];
}
