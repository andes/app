import { PlantillaService } from './../../services/turnos/plantilla.service';
import { EspacioFisicoService } from './../../services/turnos/espacioFisico.service';
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
    public espaciosFisicos : any = [];
    public bloques : any = [];
    public bloqueActivo : Number = 0;
    public elementoActivo : any = { descripcion: null };
    public moment = window["moment"] = require('moment/moment.js');
    public agendaActiva : Boolean = false;
    constructor(private formBuilder: FormBuilder, public plex: PlexService, 
    public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
    public servicioEspacio: EspacioFisicoService, public ServicioPlantilla: PlantillaService) { }
    
    ngOnInit() {
        this.modelo = {nombre:""};
        this.cargarPlantilla("5820c78739ad24c49548edef");
        this.bloqueActivo = -1;

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

    loadEspacios(event) {
        this.servicioEspacio.get().subscribe(event.callback);       
    }

    addBloque() {
        this.modelo.bloques.push({
            "descripcion" : "Nuevo Bloque",
            "cantidadTurnos" : null,
            "duracionTurno" : null,
            "deldiaAccesoDirecto" : null,
            "deldiaAccesoDirectoPorc" : null,
            "progAccesoDirecto" : null,
            "progAccesoDirectoPorc" : null,
            "deldiaReservado" : null,
            "deldiaReservadoPorc" : null,
            "progReservado" : null,
            "progReservadoPorc" : null,
            "progAutocitado" : null,
            "progAutocitadoPorc" : null,
        })
        this.activarBloque(this.modelo.bloques.length-1);
    } 
    
    activarBloque(indice: number){
        this.bloqueActivo = indice; 
        this.elementoActivo = this.modelo.bloques[indice];
    }

    cambiacantidadTurnos(event:any){
        let EA = this.elementoActivo;
        EA.duracionTurno = this.calcularDuracion(EA.horaInicio, EA.horaFin, EA.cantidadTurnos);
    }

    cambiaduracionTurnos(event:any){
        let EA = this.elementoActivo;
        EA.cantidadTurnos = this.calcularCantidad(EA.horaInicio, EA.horaFin, EA.duracionTurno);
    }
    
    cambiadeldiaAccesoDirecto(event:any){
        this.elementoActivo.deldiaAccesoDirectoPorc = Math.round((this.elementoActivo.deldiaAccesoDirecto * 100) / this.elementoActivo.cantidadTurnos);
    }

    cambiadeldiaAccesoDirectoPorc(event:any){
        this.elementoActivo.deldiaAccesoDirecto = (this.elementoActivo.deldiaAccesoDirectoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogAccesoDirecto(event:any){
        this.elementoActivo.progAccesoDirectoPorc = Math.round((this.elementoActivo.progAccesoDirecto * 100) / this.elementoActivo.cantidadTurnos);
    }

    cambiaprogAccesoDirectoPorc(event:any){
        this.elementoActivo.progAccesoDirecto = (this.elementoActivo.progAccesoDirectoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }
    
    cambiadeldiaReservado(event:any){
        this.elementoActivo.deldiaReservadoPorc = Math.round((this.elementoActivo.deldiaReservado * 100) / this.elementoActivo.cantidadTurnos);
    }

    cambiadeldiaReservadoPorc(event:any){
        this.elementoActivo.deldiaReservado = (this.elementoActivo.deldiaReservadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogReservado(event:any){
        this.elementoActivo.progReservadoPorc = Math.round((this.elementoActivo.progReservado * 100) / this.elementoActivo.cantidadTurnos);
    }

    cambiaprogReservadoPorc(event:any){
        this.elementoActivo.progReservado = (this.elementoActivo.progReservadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    cambiaprogAutocitado(event:any){
        this.elementoActivo.progAutocitadoPorc = Math.round((this.elementoActivo.progAutocitado * 100) / this.elementoActivo.cantidadTurnos);
    }

    cambiaprogAutocitadoPorc(event:any){
        this.elementoActivo.progAutocitado = (this.elementoActivo.progAutocitadoPorc * this.elementoActivo.cantidadTurnos) / 100;
    }

    verificarLimites(indice: number){
        //Aca tendría que recorrer los bloques y ver si no se solapan
        alert('click'+indice);
    }

    calculosInicio(){
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            bloque.deldiaAccesoDirectoPorc = Math.round((bloque.deldiaAccesoDirecto * 100) / bloque.cantidadTurnos);
            bloque.progAccesoDirectoPorc = Math.round((bloque.progAccesoDirecto * 100) / bloque.cantidadTurnos);
            bloque.deldiaReservadoPorc = Math.round((bloque.deldiaReservado * 100) / bloque.cantidadTurnos);
            bloque.progReservadoPorc = Math.round((bloque.progReservado * 100) / bloque.cantidadTurnos);
            bloque.progAutocitadoPorc = Math.round((bloque.progAutocitado * 100) / bloque.cantidadTurnos);
            let duracion = this.calcularDuracion(bloque.horaInicio,bloque.horaFin, bloque.cantidadTurnos);
            bloque.duracionTurno = (duracion);
        });
    }

    calcularDuracion(inicio, fin, cantidad){
        if (cantidad != null && cantidad!=0){
            var inicio = this.moment(inicio);
            var fin = this.moment(fin);
            let total = fin.diff(inicio,"minutes");
            return total/cantidad;
        }
        else
            return null;
    }

    calcularCantidad(inicio, fin, duracion){
        if (duracion != null && duracion!=0){
            var inicio = this.moment(inicio);
            var fin = this.moment(fin);
            let total = fin.diff(inicio,"minutes");
            return total/duracion;
        }
        else
            return null;
    }

    cargarPlantilla(id: String){
        this.ServicioPlantilla.getById(id).subscribe(resultado => {this.modelo = resultado; this.calculosInicio(); this.agendaActiva=true});
    }

    seleccionaPlantilla(plantilla: any){
        this.cargarPlantilla(plantilla.id);
    }
}