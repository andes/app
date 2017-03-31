import { IProblemaPaciente } from './../../../../interfaces/rup/IProblemaPaciente';
import { ProblemaPacienteService } from './../../../../services/rup/problemaPaciente.service';
import { TipoProblemaService } from './../../../../services/rup/tipoProblema.service';
import { Component, Output, Input, EventEmitter, OnInit } from '@angular/core';

import * as moment from 'moment';

@Component({
    selector: 'rup-factores-de-riesgo-nino-sano',
    templateUrl: 'factoresDeRiesgoNinoSano.html'
})
export class FactoresDeRiesgoNinoSanoComponent implements OnInit {

    @Input('datosIngreso') datosIngreso: any;
    @Input('tipoPrestacion') tipoPrestacion: any;
    @Input('paciente') paciente: any; // IPaciente;
    @Input('soloValores') soloValores: Boolean;
    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    data: any = {};
    mensaje: any = {};
    algo = [];

    tipoProblemas = [];
    public problemasPaciente: IProblemaPaciente[] = [];

    constructor(private servicioTipoProblema: TipoProblemaService, private servicioProblemas: ProblemaPacienteService) {
    }

    ngOnInit() {
        this.data[this.tipoPrestacion.key] = (this.datosIngreso) ? this.datosIngreso : null;

        // si tengo valores cargados entonces devuelvo los resultados y mensajes
        if (this.datosIngreso) {
            this.devolverValores();
        }

        // inicializamos el array a devolver
        this.data[this.tipoPrestacion.key] = [];

        // buscamos lista de problemas del factor de riesgo
        if (this.tipoPrestacion.granularidad === 'atomos' && this.tipoPrestacion.tipoProblemas) {
            // obtenemos los ids de los problemas asignados al tipo de prestacion
            let idTiposProblemas = this.tipoPrestacion.tipoProblemas.map(elem => { return elem.id; });

            // consultamos la API por los tipos de problemas
            this.servicioTipoProblema.get({ tiposProblemas: idTiposProblemas }).subscribe(tiposProblemas => {
                this.tipoProblemas = tiposProblemas;

                tiposProblemas.forEach(_tp => {
                    let indice = _tp.id.toString();
                    // this.data[this.tipoPrestacion.key][indice].push({idTipoProblema: _tp.id, activo: false});

                    // agregamos a data
                    this.data[this.tipoPrestacion.key].push({ idTipoProblema: _tp.id, activo: false });

                });

                console.log(this.data);
            });
        }

        // buscamos todos los problema que tenga el Paciente
        this.servicioProblemas.get({ idPaciente: this.paciente.id }).subscribe(problemasPaciente => {
            this.problemasPaciente = problemasPaciente;
        });
    }

    devolverValores() {
        this.mensaje = this.getMensajes();
        console.log(this.data);
        this.evtData.emit(this.data);
    }

    getMensajes() {
        // let mensaje: any = {
        //     texto: '',
        //     class: 'outline-danger'
        // };

        // return mensaje;
    }

    updateValores(key, idTipoProblema, event) {
        console.log(key);
        console.log(idTipoProblema);
        console.log(event);
        console.log(this.data[key]);
        // this.data[key] = event.target.checked;
        // this.data[key].forEach(_opcion => {
        //     if (_opcion.id === idTipoProblema) {
        //         console.log(_opcion);
        //         _opcion.activo = event.target.checked;
        //     }
        // });
    }

    existeProblema(idTipoProblema) {
        let find = this.problemasPaciente.find(problema => {
            return problema.tipoProblema.id === idTipoProblema;
        });

        if (find) {
            return true;
        }

        return false;
    }

}
