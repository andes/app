import { Plex } from '@andes/plex';
import { Router } from '@angular/router';
import { Component, Input, OnInit, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Server } from '@andes/shared';
import { Auth } from '@andes/auth';
import * as moment from 'moment';


@Component({
    selector: 'reporteC2',
    templateUrl: 'reporteC2.html',
})

export class ReporteC2Component implements OnInit {
    private _diagnosticos;
    private diagnostico;
    public seleccionada = [];
    public listaPacientes = false;
    public totalConsultas = 0;
    public totalMenor6m = 0;
    public total711m = 0;
    public total1 = 0;
    public total24 = 0;
    public total59 = 0;
    public total1014 = 0;
    public total1519 = 0;
    public total2024 = 0;
    public total2534 = 0;
    public total3544 = 0;
    public total4564 = 0;
    public total6574 = 0;
    public totalMayor75 = 0;
    public totalMasculino = 0;
    public totalFemenino = 0;
    public totalOtro = 0;


    add(a, b) {
        return a + b;
    }

    @Input('diagnosticos') // recibe un array de parametros
    set diagnosticos(value: any) {
        this._diagnosticos = value;
        this.totalConsultas = this.diagnosticos.map(elem => { return elem.total; }).reduce(this.add, 0);
        this.totalMenor6m = this.diagnosticos.map(elem => { return elem.sumaMenor6m; }).reduce(this.add, 0);
        this.total711m = this.diagnosticos.map(elem => { return elem.suma711m; }).reduce(this.add, 0);
        this.total1 = this.diagnosticos.map(elem => { return elem.suma1; }).reduce(this.add, 0);
        this.total24 = this.diagnosticos.map(elem => { return elem.suma24; }).reduce(this.add, 0);
        this.total59 = this.diagnosticos.map(elem => { return elem.suma59; }).reduce(this.add, 0);
        this.total1014 = this.diagnosticos.map(elem => { return elem.suma1014; }).reduce(this.add, 0);
        this.total1519 = this.diagnosticos.map(elem => { return elem.suma1519; }).reduce(this.add, 0);
        this.total2024 = this.diagnosticos.map(elem => { return elem.suma2024; }).reduce(this.add, 0);
        this.total2534 = this.diagnosticos.map(elem => { return elem.suma2534; }).reduce(this.add, 0);
        this.total3544 = this.diagnosticos.map(elem => { return elem.suma3544; }).reduce(this.add, 0);
        this.total2534 = this.diagnosticos.map(elem => { return elem.suma2534; }).reduce(this.add, 0);
        this.total4564 = this.diagnosticos.map(elem => { return elem.suma4564; }).reduce(this.add, 0);
        this.total6574 = this.diagnosticos.map(elem => { return elem.suma6574; }).reduce(this.add, 0);
        this.totalMayor75 = this.diagnosticos.map(elem => { return elem.sumaMayor65; }).reduce(this.add, 0);
        this.totalMasculino = this.diagnosticos.map(elem => { return elem.sumaMasculino; }).reduce(this.add, 0);
        this.totalFemenino = this.diagnosticos.map(elem => { return elem.sumaFemenino; }).reduce(this.add, 0);
        this.totalOtro = this.diagnosticos.map(elem => { return elem.sumaOtro; }).reduce(this.add, 0);
    }

    get diagnosticos(): any {
        return this._diagnosticos;
    }

    @HostBinding('class.plex-layout') layout = true; // Permite el uso de flex-box en el componente
    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    constructor(
        private plex: Plex,
        private router: Router,
        private server: Server,

        private auth: Auth,


    ) {

    }

    public ngOnInit() {

    }

    datosPacientes(indice) {
        this.diagnostico = this.diagnosticos[indice];
        for (let i = 0; i < this.seleccionada.length; i++) {
            this.seleccionada[i] = false;
        }
        if (this.diagnostico.ficha !== null) {
            this.seleccionada[indice] = true;
            this.listaPacientes = true;
        } else {
            this.listaPacientes = false;
        }
    }




}
