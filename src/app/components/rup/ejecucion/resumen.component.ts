import { IPrestacion } from './../../../interfaces/turnos/IPrestacion';
import { IProblemaPaciente } from '../../../interfaces/rup/IProblemaPaciente';
import { PrestacionPacienteService } from '../../../services/rup/prestacionPaciente.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';
import { IPrestacionPaciente } from '../../../interfaces/rup/IPrestacionPaciente';
import { IPaciente } from '../../../interfaces/IPaciente';
import { ProblemaPacienteService } from '../../../services/rup/problemaPaciente.service';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'rup-resumen',
    templateUrl: 'resumen.html'
})

export class ResumenComponent implements OnInit {

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    prestacion: IPrestacionPaciente;
    paciente: IPaciente;
    idPrestacion: String;
    listaProblemas: IProblemaPaciente[] = [];
    prestacionesPendientes: IPrestacionPaciente[] = [];
    prestacionPeso: IPrestacionPaciente = null;
    prestacionTalla: IPrestacionPaciente = null;

    constructor(private servicioProblemasPaciente: ProblemaPacienteService,
        private servicioPrestacionPaciente: PrestacionPacienteService,
        private router: Router, private route: ActivatedRoute) {}

    ngOnInit() {

            this.route.params.subscribe(params => {
            let id = params['id'];
            this.servicioPrestacionPaciente.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.loadProblemas();
                this.loadPrestacionesPendientes();
                this.cargarIndicadores();
            });
        });
    }

    loadProblemas() {
        this.servicioProblemasPaciente.get({ idPaciente: this.prestacion.paciente.id }).subscribe(problemas => {
            this.listaProblemas = problemas;
        });
    }

    loadPrestacionesPendientes() {
        this.servicioPrestacionPaciente.get({ estado: 'pendiente', idPaciente: this.prestacion.paciente.id, limit: 10 })
            .subscribe(prestaciones => {
                this.prestacionesPendientes = prestaciones;
            });
    }

    cargarIndicadores() {
        // Indicador de Peso
        this.servicioPrestacionPaciente.getByKey({ key: 'peso', idPaciente: this.prestacion.paciente.id })
            .subscribe(prestacion => {
                if (prestacion && prestacion.length > 0) {
                    this.prestacionPeso = prestacion[0];
                }
            });



        // Indicador de Talla
        this.servicioPrestacionPaciente.getByKey({ key: 'talla', idPaciente: this.prestacion.paciente.id })
            .subscribe(prestacion => {
                if (prestacion && prestacion.length > 0) {
                     this.prestacionTalla = prestacion[0];
                }
            });
    }

    iniciarPrestacion(id) {

        let cambioestado = {
            timestamp: new Date(),
            tipo: 'ejecucion'
        };

        this.prestacion.estado.push(cambioestado);
        this.prestacion.ejecucion.listaProblemas = this.prestacion.solicitud.listaProblemas;
        this.update();
        this.router.navigate(['/rup/ejecucion', id]);

    }

    update() {
        let cambios = {
              'op': 'estado',
              'estado': this.prestacion.estado
        };
        this.servicioPrestacionPaciente.patch(this.prestacion, cambios ).subscribe(prestacion => { });

        // Actualiza Lista Problemas en la prestación
         let cambiosProblemas = {
              'op': 'listaProblemas',
              'problemas': this.prestacion.ejecucion.listaProblemas
        };
        this.servicioPrestacionPaciente.patch(this.prestacion, cambiosProblemas ).subscribe(prestacionAct => {});
    }


    verPrestacion(id) {
        // this.showEjecucion = true;
         this.router.navigate(['/rup/ejecucion', id]);
    }

    verResumen(id) {
        // this.showValidacion = true;
        this.router.navigate(['rup/validacion', id]);
    }

    volver(ruta) {
        this.router.navigate([ruta]);
    }

    onReturn(prestacion) {
        this.loadProblemas();
        this.loadPrestacionesPendientes();
        this.cargarIndicadores();
    }

} // export class ResumenComponent