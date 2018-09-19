import { SnomedService } from '../../../../services/term/snomed.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { RUPComponent } from './../core/rup.component';
import { IPacienteMatch } from '../../../mpi/interfaces/IPacienteMatch.inteface';
import { IPaciente } from '../../../../interfaces/IPaciente';
import { Plex } from '@andes/plex';
import { PacienteBuscarResultado } from '../../../mpi/interfaces/PacienteBuscarResultado.inteface';

@Component({
    selector: 'rup-ActividadNoNominalizada',
    templateUrl: 'informeActividadNoNominalizada.html'
})
export class InformeActividadNoNominalizadaComponent extends RUPComponent implements OnInit {

    public elegirOtraActividad = false;
    public listaActividades = [];
    public tematicas = [
        { id: 'Adicciones', nombre: 'Adicciones' },
        { id: 'Adolescencia', nombre: 'Adolescencia' },
        { id: 'Adulto mayor', nombre: 'Adulto mayor' },
        { id: 'Alimentación', nombre: 'Alimentación' },
        { id: 'Crianza', nombre: 'Crianza' },
        { id: 'Embarazo, parto y puerperio', nombre: 'Embarazo, parto y puerperio' },
        { id: 'Emergencias / Urgencias', nombre: 'Emergencias / Urgencias' },
        { id: 'Enfermedades crónicas no transmisibles', nombre: 'Enfermedades crónicas no transmisibles' },
        { id: 'Enfermedades infecciosas', nombre: 'Enfermedades infecciosas' },
        { id: 'Epidemiología / Estadística', nombre: 'Epidemiología / Estadística' },
        { id: 'Hábitos saludables', nombre: 'Hábitos saludables' },
        { id: 'Lactancia', nombre: 'Lactancia' },
        { id: 'Salud escolar', nombre: 'Salud escolar' },
        { id: 'Salud mental', nombre: 'Salud mental' },
        { id: 'Salud sexual y reproductiva', nombre: 'Salud sexual y reproductiva' },
        { id: 'Violencia', nombre: 'Violencia' },
        { id: 'Otra', nombre: 'Otra' }];
    public pacientes: IPacienteMatch[] | IPaciente[];
    public pacienteActivo: IPaciente;
    private plex: Plex;
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

        this.listaActividades = [
            {
                '_id': '57f505d669fe79a598ee542b',
                'fsn': 'cribado para papilomavirus humano (procedimiento)',
                'semanticTag': 'procedimiento',
                'conceptId': '700152009',
                'term': 'cribado para papilomavirus humano'
            },
            {
                '_id': '57f505d669fe79a598ee5428',
                'fsn': 'cribado para papilomavirus humano (procedimiento)',
                'semanticTag': 'procedimiento',
                'conceptId': '700152009',
                'term': 'cribado para papilomavirus humano (procedimiento)'
            },
            {
                '_id': '57f505d669fe79a598ee542c',
                'fsn': 'cribado para papilomavirus humano (procedimiento)',
                'semanticTag': 'procedimiento',
                'conceptId': '700152009',
                'term': 'tamizado para papilomavirus humano'
            },
            {
                '_id': '57f505d669fe79a598ee542a',
                'fsn': 'cribado para papilomavirus humano (procedimiento)',
                'semanticTag': 'procedimiento',
                'conceptId': '700152009',
                'term': 'detección selectiva para papilomavirus humano'
            },
            {
                '_id': '57f505dc69fe79a598eee464',
                'fsn': 'educación en el cuidado de la diabetes (procedimiento)',
                'semanticTag': 'procedimiento',
                'conceptId': '385805005',
                'term': 'educación en el cuidado de la diabetes (procedimiento)'
            }];
        // this.snomedService.getQuery({ expression: '^1661000013109' }).subscribe(result => {
        //     this.listaActividades = [...result];
        // });

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
            this.elegirOtraActividad = this.registro.valor.informe.tematica === 'Otra';
        }
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
        this.pacienteActivo = paciente;
        this.registro.valor.informe.pacientes.push(paciente);
        this.pacientes = null;
    }

    deletePaciente(indice) {
        this.registro.valor.informe.pacientes.splice(indice, 1);
    }
}
