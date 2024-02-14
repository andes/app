import { Auth } from '@andes/auth';
import { Pipe, PipeTransform } from '@angular/core';
import { IPaciente } from '../core/mpi/interfaces/IPaciente';

@Pipe({ name: 'pacienteRestringido' })
export class PacienteRestringidoPipe implements PipeTransform {
    constructor(private auth: Auth) { }

    transform(paciente: IPaciente): boolean {
        return !!this.auth.pacienteRestringido?.find(p => p.idPaciente === paciente.id);
    }
}
