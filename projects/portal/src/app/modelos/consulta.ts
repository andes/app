// TODO: O un objeto enorme que contemple toda la HUDS o interfaces que segementen la HUDS
export interface Prestacion {
    auditable: boolean;
    nombre: string;
    id?: number;
    profesional: string;
    organizacion: string;
    servicio: string;
    sector: string;
    fecha: string;
    conceptId: string;
    term: string;
    fsn: string;
    semanticTag: string;
    icono: string;
    color: string;
    noNominalizada?: boolean;
    registros: [
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        },
        {
            evolucion: string;
            valor: any;
            esDiagnosticoPrincipal: boolean;
            semanticTag: string;
            icono: string;
            color: string;
            term: string;
            fecha: string;
            estado: boolean;
        }
    ],
}