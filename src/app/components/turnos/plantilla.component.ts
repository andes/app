import { PlantillaService } from './../../services/turnos/plantilla.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { PrestacionService } from './../../services/turnos/prestacion.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { IPlantilla } from './../../interfaces/turnos/IPlantilla';
import { IPrestacion } from './../../interfaces/turnos/IPrestacion';
import { Component, EventEmitter, Output, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import * as moment from 'moment';

@Component({
    templateUrl: 'plantilla.html',
})
export class PlantillaComponent {
    @Output() data: EventEmitter<IPlantilla> = new EventEmitter<IPlantilla>();
    public plantilla: any = {};
    public modelo: any = {};
    public prestaciones: any = [];
    public espaciosFisicos: any = [];
    public bloques: any = [];
    public bloqueActivo: Number = 0;
    public elementoActivo: any = { descripcion: null };
    public agendaActiva: Boolean = false;
    public alertas: String[] = [];
    public fecha: Date;

    showBuscarAgendas: boolean = false;
    showPlantilla: boolean = true;
    selectedAgenda: string;
    // @Input('selectedAgenda') selectedAgenda: string;

    constructor(private formBuilder: FormBuilder, public plex: PlexService,
        public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public ServicioPlantilla: PlantillaService) { }

    ngOnInit() {
        // this.modelo = { nombre: "" };
         this.modelo.bloques = [];      

        this.bloqueActivo = -1;
    }

    compararBloques(fecha1, fecha2): number {
        if (fecha1 && fecha2) {
            return fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime();
        }
        else
            return 0;
    }

    compararFechas(fecha1: Date, fecha2: Date): number {
        if (fecha1 && fecha2)
            return fecha1.getTime() - fecha2.getTime();
        else
            return 0;
    }

    cargarPlantilla(id: String) {
        debugger;
        this.ServicioPlantilla.getById(id).subscribe(resultado => {
            { debugger; this.modelo = resultado };
            this.calculosInicio();
            this.agendaActiva = true;
            this.modelo.bloques.sort(this.compararBloques);
        });
    }

    cargar() {
        this.showBuscarAgendas = true;
        this.showPlantilla = false;

        // this.cargarPlantilla("5820c78739ad24c49548edef");
    }


    // loadPlantillas(event) {
    //     this.ServicioPlantilla.get().subscribe(event.callback);       
    // }

    loadPrestaciones(event) {
        this.servicioPrestacion.get().subscribe(event.callback);
    }

    loadProfesionales(event) {
        this.servicioProfesional.get().subscribe(event.callback);
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get().subscribe(event.callback);
    }

    calculosInicio() {
        this.modelo.fecha = new Date(this.modelo.horaInicio);
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            bloque.horaInicio = new Date(bloque.horaInicio);
            bloque.horaFin = new Date(bloque.horaFin);
            var inicio = bloque.horaInicio;
            var fin = bloque.horaFin;
            bloque.accesoDirectoDelDiaPorc = Math.floor((bloque.accesoDirectoDelDia * 100) / bloque.cantidadTurnos);
            bloque.accesoDirectoProgramadoPorc = Math.floor((bloque.accesoDirectoProgramado * 100) / bloque.cantidadTurnos);
            bloque.reservadoProgramadoPorc = Math.floor((bloque.reservadoProgramado * 100) / bloque.cantidadTurnos);
            bloque.reservadoProfesionalPorc = Math.floor((bloque.reservadoProfesional * 100) / bloque.cantidadTurnos);
            let duracion = this.calcularDuracion(bloque.horaInicio, bloque.horaFin, bloque.cantidadTurnos);
            bloque.duracionTurno = Math.floor(duracion);
            bloque.titulo = inicio.getHours() + ":" + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + "-" +
                fin.getHours() + ":" + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();
        });
    }

    activarBloque(indice: number) {
        this.bloqueActivo = indice;
        this.elementoActivo = this.modelo.bloques[indice];
    }

    addBloque() {
        this.modelo.bloques.push({
            "descripcion": "Nuevo Bloque",
            "titulo": "",
            "cantidadTurnos": null,
            "horaInicio": null,
            "horaFin": null,
            "duracionTurno": null,
            "accesoDirectoDelDia": 0, "accesoDirectoDelDiaPorc": 0,
            "accesoDirectoProgramado": 0, "accesoDirectoProgramadoPorc": 0,
            "reservadoProgramado": 0, "reservadoProgramadoPorc": 0,
            "reservadoProfesional": 0, "reservadoProfesionalPorc": 0
        });
        this.activarBloque(this.modelo.bloques.length - 1);
    }

    deleteBloque(indice: number) {
        if (confirm('Confirme que desea eliminar el bloque')) {
            this.modelo.bloques.splice(indice, 1);
            this.bloqueActivo = -1;
            this.validarBloques();
        }
    }

    cambioFecha() {
        this.fecha = new Date(this.modelo.fecha);
        this.modelo.horaInicio = this.combinarFechas(this.fecha, this.modelo.horaInicio);
        this.modelo.horaFin = this.combinarFechas(this.fecha, this.modelo.horaFin);
    }

    cmbHoraIniGral() {
        this.fecha = new Date(this.modelo.fecha);
        this.modelo.horaInicio = this.combinarFechas(this.fecha, this.modelo.horaInicio);
        this.validarBloques();
    }

    cmbHoraFinGral() {
        this.fecha = new Date(this.modelo.fecha);
        this.modelo.horaFin = this.combinarFechas(this.fecha, this.modelo.horaFin);
    }

    cambioHoraInicio() {
        this.fecha = new Date(this.modelo.fecha);
        var inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        var fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);

        if (inicio && fin) {
            this.elementoActivo.titulo = inicio.getHours() + ":" + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + "-" +
                fin.getHours() + ":" + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();
            this.modelo.bloques.sort(this.compararBloques);
            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion) {
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
            this.validarBloques();
        }
    }

    cambioHoraFin() {
        this.fecha = new Date(this.modelo.fecha);
        var inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        var fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);

        if (inicio && fin) {
            this.elementoActivo.titulo = inicio.getHours() + ":" + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + "-" +
                fin.getHours() + ":" + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();
            this.modelo.bloques.sort(this.compararBloques);
            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion) {
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
            this.validarBloques();
        }
    }

    cambiaCantidadTurnos() {
        this.fecha = new Date(this.modelo.fecha);
        var inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        var fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);
        if (inicio && fin && this.elementoActivo.cantidadTurnos) {
            this.elementoActivo.duracionTurno = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            this.verificarCantidades();
        }
    }

    cambiaduracionTurnos() {
        this.fecha = new Date(this.modelo.fecha);
        var inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        var fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);
        if (inicio && fin && this.elementoActivo.duracionTurno) {
            this.elementoActivo.cantidadTurnos = this.calcularCantidad(inicio, fin, this.elementoActivo.duracionTurno);
            this.verificarCantidades();
        }
    }

    cambiaAccesoDirectoDelDia() {
        this.elementoActivo.accesoDirectoDelDiaPorc = Math.floor((this.elementoActivo.accesoDirectoDelDia * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaAccesoDirectoDelDiaPorc() {
        this.elementoActivo.accesoDirectoDelDia = Math.floor((this.elementoActivo.accesoDirectoDelDiaPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaAccesoDirectoProgramado() {
        this.elementoActivo.accesoDirectoProgramadoPorc = Math.floor((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaAccesoDirectoProgramadoPorc() {
        this.elementoActivo.accesoDirectoProgramado = Math.floor((this.elementoActivo.accesoDirectoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaReservadoProgramado() {
        this.elementoActivo.reservadoProgramadoPorc = Math.floor((this.elementoActivo.reservadoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaReservadoProgramadoPorc() {
        this.elementoActivo.reservadoProgramado = Math.floor((this.elementoActivo.reservadoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaReservadoProfesional() {
        this.elementoActivo.reservadoProfesionalPorc = Math.floor((this.elementoActivo.reservadoProfesional * 100) / this.elementoActivo.cantidadTurnos);
        this.validarPorcentajes(this.elementoActivo);
    }

    cambiaReservadoProfesionalPorc() {
        this.elementoActivo.reservadoProfesional = Math.floor((this.elementoActivo.reservadoProfesionalPorc * this.elementoActivo.cantidadTurnos) / 100);
        this.validarPorcentajes(this.elementoActivo);
    }

    calcularDuracion(inicio, fin, cantidad) {
        if (cantidad && inicio && fin) {
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio, "minutes");
            //console.log("total "+total+" cantidad "+cantidad+"resultado "+total/cantidad);
            return Math.floor(total / cantidad);
        }
        else {
            if (this.elementoActivo.duracionTurno)
                return this.elementoActivo.duracionTurno;
            else
                return null;
        }
    }

    calcularCantidad(inicio, fin, duracion) {
        if (duracion && duracion && inicio && fin) {
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio, "minutes");
            return Math.floor(total / duracion);
        }
        else {
            if (this.elementoActivo.cantidadTurnos)
                return this.elementoActivo.cantidadTurnos;
            else
                return null;
        }
    }

    verificarCantidades() {
        this.cambiaAccesoDirectoDelDiaPorc();
        this.cambiaAccesoDirectoProgramadoPorc();
        this.cambiaReservadoProgramadoPorc();
        this.cambiaReservadoProfesionalPorc();
    }

    validarPorcentajes(EA) {
        var alerta: String = "La cantidad de turnos asignados es mayor a la cantidad disponible";
        var indice = this.alertas.indexOf(alerta);
        if ((EA.accesoDirectoDelDiaPorc + EA.accesoDirectoProgramadoPorc + EA.reservadoProgramadoPorc + EA.reservadoProfesionalPorc) <= 100
            || (EA.accesoDirectoDelDia + EA.accesoDirectoProgramado + EA.reservadoProgramado + EA.reservadoProfesional) <= EA.cantidadTurnos) {
            if (indice > -1)
                this.alertas.splice(indice, 1);
            return true;
        }
        else {
            if (indice == -1)
                this.alertas.push(alerta);
            return false;
        }
    }

    validarBloques() {
        var desde = this.modelo.horaInicio;
        var hasta = this.modelo.horaFin;
        var alerta: string;
        var indice: number;
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            if (this.compararFechas(desde, bloque.horaInicio) > 0 || this.compararFechas(hasta, bloque.horaFin) < 0) {
                alerta = "Hay bloques que quedan fuera de los límites de la agenda";
                indice = this.alertas.indexOf(alerta);
                if (indice == -1)
                    this.alertas.push(alerta);
            }
            this.validarPorcentajes(bloque);
        });


        // var alerta: String = "Hay bloques que se solapan";
        // var indice = this.alertas.indexOf(alerta);
        // let EA = this.elementoActivo;
        // if (){
        //     if (indice > -1)
        //         this.alertas.splice(indice, 1);
        //     return true;
        // }
        // else{
        //     if (indice == -1)
        //         this.alertas.push(alerta);
        //     return false;
        // }
    }


    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            return new Date(fecha1.setHours(horas, minutes));
        }
        else
            return null;
    }

    onSave(isvalid: boolean) {
        if (isvalid) {
            let espOperation: Observable<IPlantilla>;

            this.fecha = new Date(this.modelo.fecha);
            this.modelo.horaInicio = this.combinarFechas(this.fecha, this.modelo.horaInicio);
            this.modelo.horaFin = this.combinarFechas(this.fecha, this.modelo.horaFin);
            this.modelo.estado = "Planificada";
            let bloques = this.modelo.bloques;
            bloques.forEach((bloque, index) => {
                bloque.horaInicio = this.combinarFechas(this.fecha, bloque.horaInicio);
                bloque.horaFin = this.combinarFechas(this.fecha, bloque.horaFin);
            });

            espOperation = this.ServicioPlantilla.save(this.modelo);
            espOperation.subscribe(resultado => this.data.emit(resultado));
        }
        else
            alert("Complete datos obligatorios");
    }

    onCancel() {
        this.data.emit(null);
        //return false;
    }

    onReturn(idAgenda: string): void {        
        this.showPlantilla = true;

        // this.selectedAgenda = idAgenda;

        window.setTimeout(() => this.showBuscarAgendas = false, 100);

        // debugger;
        this.cargarPlantilla(idAgenda);
    }
}