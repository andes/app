import moment from 'moment';
import { Component } from '@angular/core';
import { Plex } from '@andes/plex';
import { IPaciente } from '../../../../../core/mpi/interfaces/IPaciente';
import { IngresoPacienteService } from './ingreso-paciente-workflow/ingreso-paciente-workflow.service';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { map } from 'rxjs/operators';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'app-elegir-paciente',
    templateUrl: './elegir-paciente.component.html',
})

export class ElegirPacienteComponent {
    public snapshot;
    public selectedCama;

    constructor(
        private plex: Plex,
        private ingresoPacienteService: IngresoPacienteService,
        private pacienteService: PacienteService,
        private InternacionResumenHTTP: InternacionResumenHTTP,
        private auth: Auth,
        private mapaCamasService: MapaCamasService,
        private prestacionesService: PrestacionesService
    ) { }

    onPacienteSelected(paciente: IPaciente) {
        // Si se seleccionó por error un paciente fallecido
        this.pacienteService.checkFallecido(paciente);
        // verificamos internaciones en curso segun capa
        let request;
        if (this.mapaCamasService.capa === 'estadistica') {
            request = this.prestacionesService.get({
                ambitoOrigen: 'internacion',
                organizacion: this.auth.organizacion.id,
                conceptId: '32485007',
                idPaciente: paciente.id,
                estado: ['ejecucion', 'validada']
            }).pipe(
                map(prestaciones => {
                    const internacionEnCurso = prestaciones?.find(p => p.ejecucion.registros[0]?.valor.informeIngreso && !p.ejecucion.registros[1]?.valor.InformeEgreso);
                    return internacionEnCurso ? { fechaIngreso: internacionEnCurso.ejecucion.registros[0].valor.informeIngreso.fechaIngreso } : null;
                })
            );
        } else {
            request = this.InternacionResumenHTTP.search({
                organizacion: this.auth.organizacion.id,
                paciente: paciente.id
            }).pipe(
                map(internaciones => {
                    const internacionEnCurso = internaciones?.find(i => !i.fechaEgreso);
                    return internacionEnCurso ? { fechaIngreso: internacionEnCurso?.fechaIngreso } : null;
                })
            );
        }
        request.subscribe(internacionEnCurso => {
            if (internacionEnCurso) {
                this.plex.info('warning', `${paciente.apellido}, ${paciente.alias || paciente.nombre}, DNI: ${paciente.documento || paciente.numeroIdentificacion || 'Sin DNI'} tiene una internación
                en curso con fecha de ingreso el <b>${moment(internacionEnCurso.fechaIngreso).format('DD/MM/YYYY HH:mm')}</b>.`, 'Paciente ya internado');
            } else {
                this.ingresoPacienteService.selectPaciente(paciente.id);
            }
        });
    }

    searchEnd(resultado: any) {
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
        }
    }
}
