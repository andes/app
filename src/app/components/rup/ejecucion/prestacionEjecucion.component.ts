import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, HostBinding } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { DropdownItem } from '@andes/plex';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

// servicios
import { PrestacionPacienteService } from './../../../services/rup/prestacionPaciente.service';

// interfaces
import { IProfesional } from './../../../interfaces/IProfesional';
import { ElementosRupService } from '../../../services/rup/elementosRUP.service';

@Component({
    selector: 'rup-prestacionEjecucion',
    templateUrl: 'prestacionEjecucion.html',
    // styleUrls: ['prestacionEjecucion.css']

})

export class PrestacionEjecucionComponent implements OnInit {
    //Le pasamos la prestacion que se esta ejecutando.
    //  @Input() prestacionEjecucion: object;

    public prestacion: any;
    public elementosRUP: any[];
    public elementoRUP: any;

    // concepto snomed seleccionado del buscador a ejecutar
    public conceptoSnomedSeleccionado: any;
    // elemento a ejecutar dinámicamente luego de buscar y clickear en snomed
    public ejecutarRUP: any;
    public data: any[] = [];

    //Variable a pasar al buscador de Snomed.. Indica el tipo de busqueda
    public tipoBusqueda: string = 'problemas'; //Por defecto trae los problemas

    public ejecucion: any[] = [];

    constructor(private servicioPrestacion: PrestacionPacienteService,
        private servicioElementosRUP: ElementosRupService,
        public plex: Plex, public auth: Auth,
        private router: Router, private route: ActivatedRoute) {
    }

    /**
     * Inicializamos prestacion a traves del id que viene como parametro de la url
     * Cargamos tipos de prestaciones posibles
     * Inicializamos los datos de la prestacion en caso que se hayan registardo
     * Cargamos los problemas del paciente
     *
     * @memberof PrestacionEjecucionComponent
     */
    ngOnInit() {

        this.route.params.subscribe(params => {
            let id = params['id'];
            // Mediante el id de la prestación que viene en los parámetros recuperamos el objeto prestación
            this.servicioPrestacion.getById(id).subscribe(prestacion => {
                this.prestacion = prestacion;

                this.servicioElementosRUP.get({}).subscribe(elementosRup => {
                    this.elementosRUP = elementosRup;

                    this.elementoRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, prestacion.solicitud.tipoPrestacion);
                    console.log(this.elementoRUP);
                });

            }, (err) => {
                if (err) {
                    this.plex.info('danger', err, 'Error');
                    this.router.navigate(['/rup']);
                }
            });

        });
    }

    ejecutarConcepto(concepto) {
        this.conceptoSnomedSeleccionado = concepto;
        this.ejecutarRUP = this.servicioElementosRUP.buscarElementoRup(this.elementosRUP, concepto);
        this.ejecucion.push(this.ejecutarRUP);
    }

    /*
      * Event emmiter ejecutado cuando se devuelven valores
      * desde un átomo / molecula / fórmula desde RUP
      */
    getValoresRup(datos, elementoRUP) {
        console.log(datos);
        console.log(elementoRUP);
        debugger;
        // si esta seteado el valor en data, pero no tiene ninguna key con valores dentro
        // ej: data[signosVitales]: {}
        if (this.data[elementoRUP.key] !== 'undefined' && !Object.keys(datos).length) {
            // eliminamos la prestacion de data
            delete this.data[elementoRUP.key];
        } else {
            // si no está seteada la prestacion en data
            // entonces inicializamos el objeto vacío
            if (!this.data[elementoRUP.key]) {
                this.data[elementoRUP.key] = {};
            }

            // asignamos los valores que devuelve RUP en la variable datos
            // a nuestro array de valores data
            this.data[elementoRUP.key] = datos[elementoRUP.key];
        }

    }

    volver(ruta) {
        /*
        //valida si quedaron datos sin guardar..
        if (this.prestacionesEjecucion.length > 0 || this.tiposPrestaciones.length > 0) {
            this.plex.confirm('Se van a descartar los cambios sin guardar', 'Atención').then((confirmar) => {
                if (confirmar === true) {
                    this.router.navigate(['rup/resumen', this.prestacion.id]);
                }
            });
        } else {
            this.router.navigate(['rup/resumen', this.prestacion.id]);
        }
        */
        this.router.navigate(['rup/resumen', this.prestacion.id]);
    }
    //Recibe el parametro y lo setea para realizar la busqueda en Snomed
    filtroBuscadorSnomed(tipoBusqueda) {
        console.log(tipoBusqueda);
        this.tipoBusqueda = tipoBusqueda;
    }

}
