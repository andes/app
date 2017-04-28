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
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html'
})
export class PrestacionValidacionComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    prestacion: IPrestacionPaciente;
    prestacionesEjecutadas: IPrestacionPaciente[] = null;
    prestacionesSolicitadas: IPrestacionPaciente[] = null;

    // arreglo de prestaciones a mostrar por cada problema
    prestaciones: any[] = [];
    prestacionesPlan: any[] = [];
    cantidadPrestaciones: any[];

    validarlabel: String = '';
    validaboton = '';
    mensaje = '';

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private serviceTipoPrestacion: TipoPrestacionService,
        private servicioTipoProblema: TipoProblemaService,
        private servicioProblemaPac: ProblemaPacienteService,
        public plex: Plex, public auth: Auth, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.loadPrestacionesEjacutadas();
                    if ( (this.prestacion.estado[this.prestacion.estado.length - 1].tipo) !== 'validada') {
                        this.validarlabel = 'Validar';
                    } else {
                        this.validarlabel = 'Validada';
                        this.validaboton = 'deshabilitar';
                    };
            });

         });
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

            let cambioestado = {
            timestamp: new Date(),
            tipo: 'validada'
        };

            if (resultado) {
                console.log('Prestaciones Ejecutadas:', this.prestacionesEjecutadas);
                this.prestacionesEjecutadas.forEach(prestacion => {
                    prestacion.estado.push(cambioestado);
                    this.mensaje = 'Prestación validada correctamente';
                    this.validaboton = 'habilitada';
                    this.updateEstado(prestacion);
                });
            }
        });
    }


    updateEstado(prestacion) {

        console.log('prestacion.estado:', prestacion.estado );

        let cambios = {
              'op': 'estado',
              'estado': prestacion.estado
        };
        let listaFinal = [];

        console.log('patch prestacion :', prestacion);
        this.servicioPrestacion.patch(prestacion, cambios).subscribe( prestacion => {
        listaFinal.push(prestacion);
        if (listaFinal.length === this.prestacionesEjecutadas.length) {
            this.prestacion.estado.push({
                timestamp: new Date(),
                tipo: 'validada'
            });

            console.log('patch this.prestacion :', this.prestacion);
            this.servicioPrestacion.patch(this.prestacion, cambios).subscribe( prestacion => {
                if (prestacion) {
                    this.mensaje = 'La prestación ha sido validada correctamente';
                    this.validaboton = 'deshabilitar';
                }
            });
        }
        });
    }


     volver(ruta) {
         this.router.navigate(['rup/ejecucion', this.prestacion.id]);
    };
}

