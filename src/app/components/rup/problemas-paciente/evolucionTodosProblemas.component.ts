import { Plex } from '@andes/plex';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { Auth } from '@andes/auth';
import * as moment from 'moment';

@Component({
    selector: 'rup-evolucionaProblemasTodos',
    templateUrl: 'evolucionTodosProblemas.html'
})
export class EvolucionTodosProblemasComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente[]> = new EventEmitter<IProblemaPaciente[]>();
    @Input() problemas: IProblemaPaciente[];
    cronico = true;
    cronicohtml: String = '';
    inicioEstimadoUnidad: any = null;
    estadoActual: any = { id: 'activo', nombre: 'Activo' };
    observacion: String = '';
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados      = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' } , { id: 'dias', nombre: 'Día(s)' }  ];


    constructor(private servProbPaciente: ProblemaPacienteService,
                public plex: Plex, public auth: Auth) { }


    ngOnInit() {
    }

    evolucionar(event) {

       // Calculo fecha inicio del problema
            let fechaCalc;
            switch (true) {
                    case (this.inicioEstimadoTiempo.id === 'anios'):
                        fechaCalc = moment().subtract('years', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'mes'):
                        fechaCalc = moment().subtract('months', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'semanas'):
                        fechaCalc = moment().subtract('week', this.inicioEstimadoUnidad);
                        break;
                    case (this.inicioEstimadoTiempo.id === 'dias'):
                        fechaCalc = moment().subtract('days', this.inicioEstimadoUnidad);
                        break;
                    default:
                        fechaCalc = new Date();
            }

        let problema;

        if (event.formValid) {

             let unaEvolucion = {
                    fecha: fechaCalc || new Date(),
                    observacion: this.observacion,
                    profesional: this.auth.profesional.id,
                    organizacion: this.auth.organizacion.id,
                    cronico: this.cronico,
                    estado: this.estadoActual.id,
                    segundaOpinion: null,
            };
            let cant = this.problemas.length;

            for (let i = 0; i < cant; i++) {
              problema = this.problemas[i];
              delete problema.$order;
              this.problemas[i] = problema;
              this.problemas[i].evoluciones.push(unaEvolucion);
            }

            this.servProbPaciente.putAll(this.problemas).subscribe(resultado => {
                if (resultado) {
                    this.evtData.emit(this.problemas);
                } else {
                    this.plex.alert('Ha ocurrido un error al almacenar la evolución de los problemas.');
                }
            });

        } else {
            this.plex.alert('Completar los campos requeridos.');
        }
    }

    cerrar() {
        this.evtData.emit(this.problemas);
    }

}
