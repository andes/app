import { element } from 'protractor';
import { ElementosRupService } from './../../../services/rup/elementosRUP.service';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
// Rutas
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
    selector: 'rup-prestacionValidacion',
    templateUrl: 'prestacionValidacion.html'
})
export class PrestacionValidacionComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();
    // prestacion actual en ejecucion
    public prestacion: any;
    // array de elementos RUP que se pueden ejecutar
    public elementosRUP: any[];
    // elementoRUP de la prestacion actual
    public elementoRUPprestacion: any;

    public registros: any[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        public plex: Plex, public auth: Auth, private router: Router, private route: ActivatedRoute) {
    }

    ngOnInit() {
        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;
                this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                    this.elementosRUP = elementosRup;
                    // this.elementoRUPprestacion = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion, prestacion.ejecucion.registros[0].tipo);
                    this.cargaRegistros();
                });
            });
        });
    }

    cargaRegistros() {
        let data: any;
        this.prestacion.ejecucion.registros.forEach(element => {
            let elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, element.concepto, element.tipo);
            data = {
                elementoRUP: elementoRUP,
                concepto: element.concepto,
                valor: element.valor
            };
            console.log(data);
            this.registros.push(data);
        });
        console.log(this.registros);
    }

}

