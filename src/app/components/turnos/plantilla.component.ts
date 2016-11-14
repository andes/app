import { PlantillaService } from './../../services/turnos/plantilla.service';
import { ConsultorioService } from './../../services/turnos/consultorio.service';
import { ProfesionalService } from './../../services/profesional.service';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Component({
    templateUrl: 'plantilla.html',
})
export class PlantillaComponent {
    @Output() data: EventEmitter<IPlantilla> = new EventEmitter<IPlantilla>();
    public plantilla: any = {};
    public modelo : any = {};
    public prestaciones : any = [];
    public consultorios : any = [];
    public bloques : any = [];
    public bloqueActivo : Number = 0;
    public elementoActivo : any = { descripcion: null };
    constructor(private formBuilder: FormBuilder, public plex: PlexService, 
    public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
    public servicioConsultorio: ConsultorioService, public ServicioPlantilla: PlantillaService) { }
    
    ngOnInit() {
        this.modelo = {nombre:""};
        this.bloqueActivo = -1;
        // let moment = window["moment"] = require('moment/moment.js');
        // let hoy = moment();
        // console.log("hoy "+hoy);
        // var fechaExamen = moment("2016 10 30", "YYYY MM DD");
        // let diferencia = fechaExamen.diff(hoy,"days");
        // console.log("diferencia "+diferencia);
    }

    loadPlantillas(event) {
        this.ServicioPlantilla.get().subscribe(event.callback);       
    }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);       
    }

    loadProfesionales(event) {
        this.servicioProfesional.get().subscribe(event.callback);       
    }

    loadConsultorios(event) {
        this.servicioConsultorio.get().subscribe(event.callback);       
    }

    addBloque() {
    } 
    
    activarBloque(indice: number){
        this.bloqueActivo = indice; 
        this.elementoActivo = this.modelo.bloques[indice];
    }

    cambiadeldiaAccesoDirecto(event:any){
        console.log(event);
        this.elementoActivo.deldiaAccesoDirectoPorc = (this.elementoActivo.deldiaAccesoDirecto * 100) / this.elementoActivo.cantidadTurnos;
    }

    cambiadeldiaAccesoDirectoPorc(event:any){
        this.elementoActivo.deldiaAccesoDirecto = (this.elementoActivo.deldiaAccesoDirectoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogAccesoDirecto(event:any){
        this.elementoActivo.progAccesoDirectoPorc = (this.elementoActivo.progAccesoDirecto * 100) / this.elementoActivo.cantidadTurnos;
    }

    cambiaprogAccesoDirectoPorc(event:any){
        this.elementoActivo.progAccesoDirecto = (this.elementoActivo.progAccesoDirectoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }
    
    cambiadeldiaReservado(event:any){
        this.elementoActivo.deldiaReservadoPorc = (this.elementoActivo.deldiaReservado * 100) / this.elementoActivo.cantidadTurnos;
    }

    cambiadeldiaReservadoPorc(event:any){
        this.elementoActivo.deldiaReservado = (this.elementoActivo.deldiaReservadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogReservado(event:any){
        this.elementoActivo.progReservadoPorc = (this.elementoActivo.progReservado * 100) / this.elementoActivo.cantidadTurnos;
    }

    cambiaprogReservadoPorc(event:any){
        this.elementoActivo.progReservado = (this.elementoActivo.progReservadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogAutocitado(event:any){
        this.elementoActivo.progAutocitadoPorc = (this.elementoActivo.progAutocitado * 100) / this.elementoActivo.cantidadTurnos;
    }

    cambiaprogAutocitadoPorc(event:any){
        this.elementoActivo.progAutocitado = (this.elementoActivo.progAutocitadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    metodo(event){
        alert('click');
    }

    calculosInicio(){
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            bloque.deldiaAccesoDirectoPorc = (bloque.deldiaAccesoDirecto * 100) / bloque.cantidadTurnos;
            bloque.progAccesoDirectoPorc = (bloque.progAccesoDirecto * 100) / bloque.cantidadTurnos;
            bloque.deldiaReservadoPorc = (bloque.deldiaReservado * 100) / bloque.cantidadTurnos;
            bloque.progReservadoPorc = (bloque.progReservado * 100) / bloque.cantidadTurnos;
            bloque.progAutocitadoPorc = (bloque.progAutocitado * 100) / bloque.cantidadTurnos;
        });
    }

    cargarPlantilla(id: String){
        this.ServicioPlantilla.getById(id).subscribe(resultado => {this.modelo = resultado;debugger;this.calculosInicio()});
    }

    seleccionaPlantilla(plantilla: any){
        this.cargarPlantilla(plantilla.id);
    }
}