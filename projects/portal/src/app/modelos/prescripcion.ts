export interface Prescripcion {
    id: number;
    nombre: string;
    nombreComercial: string;
    cantidad: string;
    formaFarmaceutica: string;
    fechaIndicacion: string;
    recetable: boolean;
    activo: boolean;
    indicacion: {
        horario: string;
        referencia: string;
        administracion: string;
        vigencia: string;
        dosis: string;
        distribucion: [string, string, string, string, string, string, string];
    };
    profesional: string;
    organizacion: string;
    servicio: string;
    ambito: string;
    nota: string;
}
