import { Component, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPacienteMatch } from '../../../mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../../core/mpi/interfaces/IPaciente';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';
import { RupElement } from '.';

@Component({
    selector: 'rup-ActividadNoNominalizada',
    templateUrl: 'informeActividadNoNominalizada.html'
})
@RupElement('InformeActividadNoNominalizadaComponent')
export class InformeActividadNoNominalizadaComponent extends RUPComponent implements OnInit {

    public elegirOtraActividad = false;
    public listaActividades = [];
    public tematicas = [
        { id: 'Adicciones', nombre: 'Adicciones' },
        { id: 'Adolescencia', nombre: 'Adolescencia' },
        { id: 'Adulto mayor', nombre: 'Adulto mayor' },
        { id: 'Crianza', nombre: 'Crianza' },
        { id: 'Embarazo, parto y puerperio', nombre: 'Embarazo, parto y puerperio' },
        { id: 'Enfermedades crónicas no transmisibles', nombre: 'Enfermedades crónicas no transmisibles' },
        { id: 'Enfermedades infecciosas', nombre: 'Enfermedades infecciosas' },
        { id: 'Epidemiología / Estadística', nombre: 'Epidemiología / Estadística' },
        { id: 'Hábitos saludables / Alimentación', nombre: 'Hábitos saludables / Alimentación' },
        { id: 'Niñez sana', nombre: 'Niñez sana' },
        { id: 'Lactancia', nombre: 'Lactancia' },
        { id: 'Organización tarea', nombre: 'Organización tarea' },
        { id: 'Otra', nombre: 'Otra' },
        { id: 'Salud ambiental', nombre: 'Salud ambiental' },
        { id: 'Salud escolar', nombre: 'Salud escolar' },
        { id: 'Salud mental', nombre: 'Salud mental' },
        { id: 'Salud laboral', nombre: 'Salud laboral' },
        { id: 'Salud sexual y reproductiva', nombre: 'Salud sexual y reproductiva' },
        { id: 'Urgencias / Emergencias', nombre: 'Urgencias / Emergencias' },
        { id: 'Violencia', nombre: 'Violencia' }
    ];

    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    private turno;

    ngOnInit() {
        if (!this.registro.valor) {
            this.registro.valor = {
                informe: { pacientes: [] }
            };
        }
        this.turno = this.prestacion.solicitud.turno ? this.prestacion.solicitud.turno : null;
        if (this.turno) {
            this.agendaService.get({ turno: this.turno }).subscribe(agendas => {
                this.registro.valor.informe.profesionales = agendas[0].profesionales;
                this.registro.valor.informe.fecha = agendas[0].horaInicio;
                this.registro.valor.informe.horaIngreso = agendas[0].horaInicio;
                this.registro.valor.informe.horaFin = agendas[0].horaFin;
            });
        }

        this.snomedService.getQuery({ expression: '^2691000013105' }).subscribe(result => {
            this.listaActividades = [...result];
        });

    }

    loadProfesionales(event) {
        if (event && event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.serviceProfesional.get(query).subscribe(event.callback);
        } else {
            let callback = (this.registro.valor.informe.profesionales) ? this.registro.valor.informe.profesionales : null;
            event.callback(callback);
        }
    }

    loadActividades($event) {
        this.snomedService.getQuery({ expression: '^2051000013106' }).subscribe(result => {
            $event.callback(result);
        });
    }

    mostrarOtraTematica() {
        if (this.registro.valor.informe.tematica) {
            this.registro.valor.informe.tematica = ((typeof this.registro.valor.informe.tematica === 'string')) ? this.registro.valor.informe.tematica : (Object(this.registro.valor.informe.tematica).id);
        }

        this.registro.valor.informe.otraTematica = this.registro.valor.informe.tematica === 'Otra' ? this.registro.valor.informe.otraTematica : '';
    }

    searchStart() {
        this.pacientes = null;
    }

    searchEnd(resultado: PacienteBuscarResultado) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        } else {
            this.pacientes = resultado.pacientes;
        }
    }

    searchClear() {
        this.pacientes = null;
    }

    seleccionarPaciente(paciente: IPaciente) {
        if (!this.registro.valor.informe.pacientes.some((p) => p.id === paciente.id)) {
            this.pacienteActivo = paciente;
            this.registro.valor.informe.pacientes.push(paciente);
        } else {
            this.plex.info('warning', 'El paciente ya había sido seleccionado.', 'Información');
        }
        this.pacientes = null;
    }

    deletePaciente(indice) {
        this.registro.valor.informe.pacientes.splice(indice, 1);
    }
}
