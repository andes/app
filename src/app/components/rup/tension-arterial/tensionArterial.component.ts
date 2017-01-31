import { TensionSistolicaComponent } from './../tensionSistolica.compponent';
import { TensionDiastolicaComponent } from './../tensionDiastolica.component';
import { IPaciente } from './../../../interfaces/IPaciente';
import { Component, OnInit, Output, Input, EventEmitter, AfterViewInit, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';

@Component({
    selector: 'tensionArterial',
    templateUrl: 'tensionArterial.html'
})
export class TensionArterialComponent implements OnInit {
    //@Input('paciente') paciente: IPaciente;

    @ViewChild(TensionDiastolicaComponent)
    tensionDiastolicaChild: TensionDiastolicaComponent;

    @ViewChild(TensionSistolicaComponent)
    tensionSistolicaChild: TensionSistolicaComponent;

    paciente: any;
    tensionArterial: any;

    ngOnInit() {
        debugger;
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
    }

    ngAfterViewInit() {
        debugger;
        var diastolica: Number = this.tensionDiastolicaChild.tensionDiastolica;
        var sistolica: Number = this.tensionSistolicaChild.tensionSistolica;
        this.tensionArterial = {
            tensionSistolica: this.tensionSistolicaChild.tensionSistolica,
            tensionDiastolica: this.tensionDiastolicaChild.tensionDiastolica
        }

        // this.tensionArterial = {
        //     tensionSistolica: 212,
        //     tensionDiastolica: 21
        // }
    }



}