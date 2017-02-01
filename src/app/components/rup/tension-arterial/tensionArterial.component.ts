import { TensionSistolicaComponent } from './../tensionSistolica.component';
import { TensionDiastolicaComponent } from './../tensionDiastolica.component';
import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'tensionArterial',
    templateUrl: 'tensionArterial.html'
})
export class TensionArterialComponent implements OnInit {

    @Input('paciente') paciente: any;

    @Input('tipoPrestacion') tipoPrestacion: any;

    @Output() evtData: EventEmitter<any> = new EventEmitter<any>();

    // resultados a devolver
    data: Object = {};

    // tipos de prestaciones a utilizar
    prestacionDiastolica: any;
    prestacionSistolica: any;

    ngOnInit() {
        // debugger;
        this.paciente = {
            "id": "588257bce70a44138c44a002",
            "documento": "93155329",
            "estado": "validado",
            "nombre": "SERGIO ECIO JUAN",
            "apellido": "GIORGIS",
            "sexo": "masculino",
            "genero": "masculino",
            "fechaNacimiento": "02/11/1993",
            "estadoCivil": "",
            "activo": true
        }

        this.prestacionDiastolica = {
            "_id": "5890730a0c4eccd05d2a7a43",
            "key": "tensionDiastolica",
            "nombre": "Tension diastólica",
            "autonoma": false,
            "activo": true,
            "componente": "rup/tensionDiastolica.component.ts"
        };

        this.prestacionSistolica = {
            "_id": "589072ee0c4eccd05d2a7a42",
            "key": "tensionSistolica",
            "nombre": "Tension sistólica",
            "autonoma": false,
            "activo": true,
            "componente": "rup/tensionSistolica.component.ts"
        };
    }

    onReturn(valor: Number, tipoPrestacion: any) {
        this.data[tipoPrestacion] = valor;
        this.evtData.emit(this.data);
    }

}