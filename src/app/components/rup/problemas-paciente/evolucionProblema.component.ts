import { Plex } from '@andes/plex';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
import { Auth } from '@andes/auth';
import { IProfesional } from './../../../interfaces/IProfesional';
import * as moment from 'moment';

@Component({
    selector: 'rup-evolucionaProblema',
    templateUrl: 'evolucionProblema.html'
})
export class EvolucionProblemaComponent implements OnInit {

    @Output() evtData: EventEmitter<IProblemaPaciente> = new EventEmitter<IProblemaPaciente>();
    @Input() problema: IProblemaPaciente;


    cronico = true;
    cronicohtml: String = '';
    inicioEstimadoUnidad: any = null;
    estadoActual: any = { id: 'activo', nombre: 'Activo' };
    observacion: String = '';
    inicioEstimadoTiempo: any = { id: 'dias', nombre: 'Día(s)' };
    estados      = [{ id: 'resuelto', nombre: 'Resuelto' }, { id: 'inactivo', nombre: 'Inactivo' }, { id: 'activo', nombre: 'Activo' }];
    unidadTiempo = [{ id: 'anios', nombre: 'Año(s)' }, { id: 'mes', nombre: 'Mes(es)' }, { id: 'semanas', nombre: 'Semana(s)' } , { id: 'dias', nombre: 'Día(s)' }  ];

    constructor(private servProbPaciente: ProblemaPacienteService,
                public plex: Plex,
                public auth: Auth) {}


    ngOnInit() {
        if (this.problema.evoluciones[this.problema.evoluciones.length - 1].cronico = true) {
            this.cronicohtml = 'Crónico';
        } else {
            this.cronicohtml = '';
         }


         this.servProbPaciente.getById(this.problema.id)
            .subscribe(problema => {
                this.problema = problema;
                this.problema.evoluciones.sort(function(a, b){
                    if ( a.fecha > b.fecha ) {
                        return -1;
                    }

                    if ( a.fecha < b.fecha ) {
                        return 1;
                    }

                    return 0;
                });
            });



    }

    evolucionarProblema(event) {

        if (event.formValid) {

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
            let unaEvolucion = {
                    fecha: fechaCalc || new Date(),
                    observacion: this.observacion,
                    profesional: this.auth.profesional.id,
                    organizacion: this.auth.organizacion.id,
                    cronico: this.cronico,
                    estado: this.estadoActual.id,
                    segundaOpinion: null,
            };


            // Guardo los datos del formulario
            this.problema.evoluciones.push(unaEvolucion);
            this.servProbPaciente.put(this.problema).subscribe(resultado => {
                if (resultado) {
                    this.evtData.emit(this.problema);
                } else {
                    this.plex.alert('Ha ocurrido un error al almacenar la evolución');
                }
            });

        } else {
            this.plex.alert('Completar datos requeridos');
        }
    }

    cerrar() {
        this.evtData.emit(null);
    }

}
