import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../services/rup/tipoProblema.service';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

import { ITipoProblema } from './../../../interfaces/rup/ITipoProblema';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';

import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';

import { Auth } from '@andes/auth';

import { Plex } from '@andes/plex';

@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html'
})
export class PrestacionValidacionComponent implements OnInit {

    @Input() prestacion: IPrestacionPaciente;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    prestacionesEjecutadas: IPrestacionPaciente[] = null;
    prestacionesSolicitadas: IPrestacionPaciente[] = null;

    // arreglo de prestaciones a mostrar por cada problema
    prestaciones: any[] = [];
    prestacionesPlan: any[] = [];

    cantidadPrestaciones: any[];

    showEjecucion = true;
    showValidacion = false;
    showPrestacionEjecucion = false;
    mensaje = '';

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex, public auth: Auth) {
    }

    ngOnInit() {
        this.loadPrestacionesEjacutadas();
        console.log('validacion: ', this.prestacion);
    }

    loadPrestacionesEjacutadas() {
        let estado = (this.prestacion.estado[this.prestacion.estado.length - 1].tipo === 'ejecucion') ? 'ejecucion' : 'validada';

            this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id, estado: estado }).subscribe(resultado => {
            this.prestacionesEjecutadas = resultado;

            // asignamos las prestaciones por problemas asi luego loopeamos
            this.prestacion.ejecucion.listaProblemas.forEach(_problema => {
                let idProblema = _problema.id.toString();

                this.prestaciones[idProblema] = this.buscarPrestacionesPorProblema(_problema);

            });
        });

        this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id, estado: 'pendiente' }).subscribe(resultado => {
            this.prestacionesSolicitadas = resultado;

            this.prestacion.ejecucion.listaProblemas.forEach(_problema => {
                let idProblema = _problema.id.toString();

                this.prestacionesPlan[idProblema] = this.buscarPlanesPorProblema(_problema);

            });
        });
    }

    filtrarPrestaciones(prestacionEj: IPrestacionPaciente, idProblema) {
        if (prestacionEj.solicitud.listaProblemas.find(p => p.id = idProblema)) {
            return prestacionEj;
        } else {
            return null;
        }
    }

    buscarPrestacionesPorProblema(problema: IProblemaPaciente) {
        // return this.prestacionesEjecutadas.filter(data => {
        return this.prestacionesEjecutadas.filter(data => {
            if (data.solicitud.listaProblemas.find(p => p.id === problema.id)) {
                return data;
            }
        });
    }

    buscarPlanesPorProblema(problema) {
        return this.prestacionesSolicitadas.filter(data => {
            if (data.solicitud.listaProblemas.find(p => p.id === problema.id)) {
                return data;
            }
        });
    }

    validarPrestacion() {
        this.plex.confirm('Está seguro que desea validar la prestación?').then(resultado => {
            let listaFinal = [];

            if (resultado) {
                this.prestacionesEjecutadas.forEach(prestacion => {
                    prestacion.estado.push({
                        timestamp: new Date(),
                        tipo: 'validada'
                    });

                    this.servicioPrestacion.put(prestacion).subscribe( prestacion => {
                        listaFinal.push(prestacion);
                        if (listaFinal.length === this.prestacionesEjecutadas.length) {
                            this.prestacion.estado.push({
                                timestamp: new Date(),
                                tipo: 'validada'
                            });

                            this.servicioPrestacion.put(this.prestacion).subscribe(prestacion => {
                                if (prestacion) {
                                    this.showEjecucion = false;
                                    this.showValidacion = true;
                                    this.mensaje = 'La prestación ha sido validada correctamente';
                                }
                            });
                        }
                    });
                });
            }
        });
    }

     volver() {
       this.showEjecucion = false;
       this.showValidacion = false;
       this.showPrestacionEjecucion = true;
       this.evtData.emit(this.prestacion);
    }
}

