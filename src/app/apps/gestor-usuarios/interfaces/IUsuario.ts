export interface IUsuario {
    id: string;
    nombre: string;
    apellido: string;
    documento: string;
    foto: string;
    disclaimers?: any[];
    lastLogin?: Date;
    email?: string;
    tipo?: string;
    usuario: number;
}
