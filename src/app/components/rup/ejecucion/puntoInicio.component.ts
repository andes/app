import { IOrganizacion } from './../../../interfaces/IOrganizacion';
import { OrganizacionComponent } from './../../organizacion/organizacion.component';
import { IProfesional } from './../../../interfaces/IProfesional';
import { Auth } from '@andes/auth';
import { AgendaService } from './../../../services/turnos/agenda.service';
import { ITipoPrestacion } from './../../../interfaces/ITipoPrestacion';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { IPrestacionPaciente } from './../../../interfaces/rup/IPrestacionPaciente';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProblemaPacienteService } from './../../../services/rup/problemaPaciente.service';
import { IPaciente } from './../../../interfaces/IPaciente';
import { IProblemaPaciente } from './../../../interfaces/rup/IProblemaPaciente';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'rup-puntoInicio',
    templateUrl: 'puntoInicio.html'
})

export class PuntoInicioComponent implements OnInit {

    public profesional: IProfesional;
    public usuario: IPaciente;
    public listaPrestaciones: IPrestacionPaciente[] = [];
    public prestacionSeleccionada: IPrestacionPaciente = null; // será un IPaciente
    public enEjecucion = false;
    public alerta = false;
    public agendas: any = [];
    public fechaActual = new Date();
    public bloqueSeleccionado: any;
    public turnosPrestacion: any = [];
    public breadcrumbs: any;

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioProblemasPaciente: ProblemaPacienteService,
        public servicioAgenda: AgendaService, public auth: Auth,
        private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {
        this.breadcrumbs = this.route.routeConfig.path;
        console.log('pantalla:', this.breadcrumbs);

        this.loadAgendasXDia();
    }

    loadAgendasXDia() {
        if (this.auth.profesional) {
                    let fechaDesde = this.fechaActual.setHours(0, 0, 0, 0);
                    let fechaHasta = this.fechaActual.setHours(23, 59, 0, 0);
                    this.servicioAgenda.get({
                        fechaDesde: fechaDesde,
                        fechaHasta: fechaHasta,
                        idProfesional: this.auth.profesional.id,
                        organizacion: this.auth.organizacion.id
                    }).subscribe(
                        agendas => { this.agendas = agendas; },
                        err => {
                            if (err) {
                                console.log(err);
                            }
                        });
                }else {
                    this.alerta = true;
                }
            }


    listadoTurnos(bloque) {
        this.bloqueSeleccionado = bloque;
        let turnos = this.bloqueSeleccionado.turnos.map(elem => { return elem.id; });
        this.servicioPrestacion.get({ turnos: turnos }).subscribe(resultado => {
            this.listaPrestaciones = resultado;
            this.listaPrestaciones.forEach(prestacion => {
                this.turnosPrestacion[prestacion.id.toString()] = this.bloqueSeleccionado.turnos.find(t => {
                    return t.id === prestacion.solicitud.idTurno;
                });
            });
        });
    }

    elegirPrestacion(id) {
        this.router.navigate(['/rup/resumen', id]);
    }

    onReturn() {
        this.router.navigate(['/rup']);
    }

} // export class Punto Inicio Component