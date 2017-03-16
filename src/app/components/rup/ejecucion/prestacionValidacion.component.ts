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

    showEjecucion = true;
    mensaje = "";

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex) {
    }

    ngOnInit() {
        this.loadPrestacionesEjacutadas();

    }

    loadPrestacionesEjacutadas() {
        this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id, estado: 'ejecucion' }).subscribe(resultado => {
            this.prestacionesEjecutadas = resultado;

            this.prestacion.ejecucion.listaProblemas.forEach(_problema => {
                let idProblema = _problema.id.toString();

                this.prestaciones[idProblema] = this.buscarPrestacionesPorProblema(_problema);

            });
        });

        this.servicioPrestacion.get({ idPrestacionOrigen: this.prestacion.id, estado: 'pendiente' }).subscribe(resultado => {
            this.prestacionesSolicitadas = resultado;

            this.prestacion.ejecucion.listaProblemas.forEach(_problema => {
                let idProblema = _problema.id.toString();

                this.prestacionesPlan[idProblema] = this.buscarPrestacionesPorProblema(_problema);

            });
        });
    }

    filtrarPrestaciones(prestacionEj: IPrestacionPaciente, idProblema) {
        debugger;
        if (prestacionEj.solicitud.listaProblemas.find(p => p.id = idProblema)) {
            return prestacionEj;
        } else {
            return null;
        }
    }

    buscarPrestacionesPorProblema(problema: IProblemaPaciente) {
        // return this.prestacionesEjecutadas.filter(data => {
        return this.prestacionesEjecutadas.filter(data => {
            if (data.solicitud.listaProblemas.find(p => p.id == problema.id))
                return data;
        });
    }

    buscarPlanesPorProblema(problema) {
        return this.prestacionesSolicitadas.filter(data => {
            if (data.solicitud.listaProblemas.find(p => p.id == problema.id))
                return data;
        });
    }

    validarPrestacion() {
        this.plex.confirm('Está seguro que desea validar la prestación?').then(resultado => {
            var listaFinal = [];

            if (resultado) {
                this.prestacionesEjecutadas.forEach(prestacion => {
                    prestacion.estado.push({
                        timestamp: new Date(),
                        tipo: 'validada'
                    });

                    this.servicioPrestacion.put(prestacion).subscribe(prestacion => {
                        listaFinal.push(prestacion);
                        if (listaFinal.length == this.prestacionesEjecutadas.length) {
                            this.prestacion.estado.push({
                                timestamp: new Date(),
                                tipo: 'validada'
                            });

                            this.servicioPrestacion.put(this.prestacion).subscribe(prestacion => {
                                if (prestacion) {
                                    this.showEjecucion = false;
                                    this.mensaje = "La prestación ha sido validada correctamente";
                                }
                            });
                        }
                    });
                })
            }
        });
    }

}