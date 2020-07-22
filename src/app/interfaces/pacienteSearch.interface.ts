export interface PacienteSearch {
    type: string; // 'simplequery' | 'multimatch' | 'suggest';
    cadenaInput?: string;
    claveBlocking?: string;
    percentage?: boolean;
    documento?: string;
    nombre?: string;
    apellido?: string;
    sexo?: string;
    fechaNacimiento?: Date;
    escaneado?: boolean;
}
