import { PlantillaService } from './../../services/turnos/plantilla.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Component, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

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
    public agendaActiva : Boolean = false;
    public alertas: String[] = [];
    constructor(private formBuilder: FormBuilder, public plex: PlexService, 
                public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
                public servicioEspacioFisico: EspacioFisicoService, public ServicioPlantilla: PlantillaService) { }
    
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
        this.servicioEspacioFisico.get().subscribe(event.callback);       
    }

    calculosInicio(){
        this.modelo.fecha = new Date(this.modelo.horaInicio);
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            console.log(bloque);
            var inicio = bloque.horaInicio;
            var fin = bloque.horaFin;
            bloque.accesoDirectoDelDiaPorc = Math.floor((bloque.accesoDirectoDelDia * 100) / bloque.cantidadTurnos);
            bloque.accesoDirectoProgramadoPorc = Math.floor((bloque.accesoDirectoProgramado * 100) / bloque.cantidadTurnos);
            bloque.reservadoProgramadoPorc = Math.floor((bloque.reservadoProgramado * 100) / bloque.cantidadTurnos);
            bloque.reservadoProfesionalPorc = Math.floor((bloque.reservadoProfesional * 100) / bloque.cantidadTurnos);
            let duracion = this.calcularDuracion(bloque.horaInicio,bloque.horaFin, bloque.cantidadTurnos);
            bloque.duracionTurno = Math.floor(duracion);
            bloque.titulo = inicio.getHours()+":"+(inicio.getMinutes()<10?'0':'') + inicio.getMinutes()+"-"+
            fin.getHours()+":"+(fin.getMinutes()<10?'0':'') + fin.getMinutes();
        });
    }

    activarBloque(indice: number){
        this.bloqueActivo = indice; 
        this.elementoActivo = this.modelo.bloques[indice];
    }

    addBloque() {
        this.modelo.bloques.push({
            "descripcion" : "Nuevo Bloque",
            "titulo" : "",
            "cantidadTurnos" : null,
            "horaInicio" : null,
            "horaFin" : null,
            "duracionTurno" : null,
            "accesoDirectoDelDia" : 0, "accesoDirectoDelDiaPorc" : 0,
            "accesoDirectoProgramado" : 0, "accesoDirectoProgramadoPorc" : 0,
            "reservadoProgramado" : 0, "reservadoProgramadoPorc" : 0,
            "reservadoProfesional" : 0, "reservadoProfesionalPorc" : 0
        })
        this.activarBloque(this.modelo.bloques.length-1);
    } 

    deleteBloque(indice: number){
        if (confirm('Confirme que desea eliminar el bloque')) {
            this.modelo.bloques.splice(indice,1);
            this.bloqueActivo = -1;
            // Save it!
        } else {
            // Do nothing!
        }
        
    }
    
    cambioHoraInicio(){
        var inicio = this.elementoActivo.horaInicio;
        var fin = this.elementoActivo.horaFin;
        if (inicio!=null && fin!=null){
            this.elementoActivo.titulo = inicio.getHours()+":"+(inicio.getMinutes()<10?'0':'') + inicio.getMinutes()+"-"+
            fin.getHours()+":"+(fin.getMinutes()<10?'0':'') + fin.getMinutes();
            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion!=null){
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
        }
    }

    cambioHoraFin(){
        var inicio = this.elementoActivo.horaInicio;
        var fin = this.elementoActivo.horaFin;
        if (inicio && fin){
            this.elementoActivo.titulo = inicio.getHours()+":"+(inicio.getMinutes()<10?'0':'') + inicio.getMinutes()+"-"+
            fin.getHours()+":"+(fin.getMinutes()<10?'0':'') + fin.getMinutes();
            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion!=null){
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
        }
    }

    cambiaCantidadTurnos(){
        let EA = this.elementoActivo;
        if (EA.horaInicio && EA.horaFin && EA.cantidadTurnos){
            EA.duracionTurno = this.calcularDuracion(EA.horaInicio, EA.horaFin, EA.cantidadTurnos);
            this.verificarCantidades();
        }
    }

    cambiaduracionTurnos(){
        let EA = this.elementoActivo;
        if (EA.horaInicio && EA.horaFin && EA.duracionTurno){
            EA.cantidadTurnos = this.calcularCantidad(EA.horaInicio, EA.horaFin, EA.duracionTurno);
            this.verificarCantidades();
        }
    }
    
    cambiaAccesoDirectoDelDia(){
        this.elementoActivo.accesoDirectoDelDiaPorc = Math.floor((this.elementoActivo.accesoDirectoDelDia * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes();
    }

    cambiaAccesoDirectoDelDiaPorc(){
        this.elementoActivo.accesoDirectoDelDia = Math.floor((this.elementoActivo.accesoDirectoDelDiaPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes();
    }

    cambiaAccesoDirectoProgramado(){
        this.elementoActivo.accesoDirectoProgramadoPorc = Math.floor((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes();
    }

    cambiaAccesoDirectoProgramadoPorc(){
        this.elementoActivo.accesoDirectoProgramado = Math.floor((this.elementoActivo.accesoDirectoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes();
    }
    
    cambiaReservadoProgramado(){
        this.elementoActivo.reservadoProgramadoPorc = Math.floor((this.elementoActivo.reservadoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes();
    }

    cambiaReservadoProgramadoPorc(){
        this.elementoActivo.reservadoProgramado = Math.floor((this.elementoActivo.reservadoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes();
    }

    cambiaReservadoProfesional(){
        this.elementoActivo.reservadoProfesionalPorc = Math.floor((this.elementoActivo.reservadoProfesional * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes();
    }

    cambiaReservadoProfesionalPorc(){
        this.elementoActivo.reservadoProfesional = Math.floor((this.elementoActivo.reservadoProfesionalPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes();
    }

    calcularDuracion(inicio, fin, cantidad){
        if (cantidad && inicio && fin){
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio,"minutes");
            console.log("total "+total+" cantidad "+cantidad+"resultado "+total/cantidad);
            return Math.floor(total/cantidad);
        }
        else{
            if (this.elementoActivo.duracionTurno)
                return this.elementoActivo.duracionTurno;
            else
                return null;
        }
    }

    calcularCantidad(inicio, fin, duracion){
        if (duracion && duracion && inicio && fin){
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio,"minutes");
            return Math.floor(total/duracion);
        }
        else
            this.elementoActivo.cantidadTurnos?this.elementoActivo.cantidadTurnos:null;
    }

    verificarCantidades(){
        this.cambiaAccesoDirectoDelDiaPorc();
        this.cambiaAccesoDirectoProgramadoPorc();
        this.cambiaReservadoProgramadoPorc();
        this.cambiaReservadoProfesionalPorc();
    }

    validarPorcentajes(){
        var alerta: String = "La cantidad de turnos asignados es mayor a la cantidad disponible";
        var indice = this.alertas.indexOf(alerta);
        let EA = this.elementoActivo;
        if ((EA.accesoDirectoDelDiaPorc+EA.accesoDirectoProgramadoPorc+EA.reservadoProgramadoPorc+EA.reservadoProfesionalPorc)<=100
        || (EA.accesoDirectoDelDia+EA.accesoDirectoProgramado+EA.reservadoProgramado+EA.reservadoProfesional)<=EA.cantidadTurnos){
            if (indice > -1)
                this.alertas.splice(indice, 1);
            return true;
        }
        else{
            if (indice == -1)
                this.alertas.push(alerta);
            return false;
        }
    }

    cargarPlantilla(id: String){
        this.ServicioPlantilla.getById(id).subscribe(resultado => {this.modelo = resultado; this.calculosInicio(); this.agendaActiva=true});
    }

    seleccionaPlantilla(plantilla: any){
        this.cargarPlantilla(plantilla.id);
    }

    onSave(isvalid: boolean){
        if (isvalid) {
            let espOperation: Observable<IPlantilla>;
            let horas : number;
            let minutes : number;
            var fecha = new Date(this.modelo.fecha);
            horas = this.modelo.horaInicio.getHours();
            minutes = this.modelo.horaInicio.getMinutes();
            this.modelo.horaInicio = new Date(fecha.setHours(horas,minutes));
            horas = this.modelo.horaFin.getHours();
            minutes = this.modelo.horaFin.getMinutes();
            this.modelo.horaFin = new Date(fecha.setHours(horas,minutes));

            let bloques = this.modelo.bloques;
            bloques.forEach((bloque, index) => {
                horas = bloque.horaInicio.getHours();
                minutes = bloque.horaInicio.getMinutes();
                bloque.horaInicio = new Date(fecha.setHours(horas,minutes));
                horas = bloque.horaFin.getHours();
                minutes = bloque.horaFin.getMinutes();
                bloque.horaFin = new Date(fecha.setHours(horas,minutes));
            });

            espOperation = this.ServicioPlantilla.put(this.modelo);
            espOperation.subscribe(resultado => this.data.emit(resultado));
        } else {
            alert("Complete datos obligatorios");
        }
        alert("hola");
    }
   
}