import { PlantillaService } from './../../services/turnos/plantilla.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';
import { Plex } from 'andes-plex/src/lib/core/service';
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
    public alertas: String[] = [];
    public fecha: Date;

    showBuscarAgendas: boolean = false;
    showPlantilla: boolean = true;
    selectedAgenda: IPlantilla[];

    constructor(private formBuilder: FormBuilder, public plex: Plex,
        public servicioPrestacion: PrestacionService, public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService, public ServicioPlantilla: PlantillaService) { }

    ngOnInit() {
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

    cargarPlantilla(agenda: IPlantilla[]) {
        this.modelo = agenda;
        this.calculosInicio();
        this.modelo.bloques.sort(this.compararBloques);
        // this.ServicioPlantilla.getById(id).subscribe(resultado => {
        //     { debugger; this.modelo = resultado };
        //     this.calculosInicio();
        //     this.modelo.bloques.sort(this.compararBloques);
        // });
    }

    cargar() {
        this.showBuscarAgendas = true;
        this.showPlantilla = false;
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

    calculosInicio() {
        this.modelo.fecha = this.modelo.horaInicio;
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
        this.validarTodo();
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
            this.validarTodo();
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
        this.validarTodo();
    }

    cmbHoraFinGral() {
        this.fecha = new Date(this.modelo.fecha);
        this.modelo.horaFin = this.combinarFechas(this.fecha, this.modelo.horaFin);
        this.validarTodo();
    }

    cambioHoraBloques(){
        this.fecha = this.modelo.fecha? new Date(this.modelo.fecha): new Date();
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
            this.validarTodo();
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
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaAccesoDirectoDelDiaPorc() {
        this.elementoActivo.accesoDirectoDelDia = Math.floor((this.elementoActivo.accesoDirectoDelDiaPorc * this.elementoActivo.cantidadTurnos) / 100);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaAccesoDirectoProgramado() {
        this.elementoActivo.accesoDirectoProgramadoPorc = Math.floor((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaAccesoDirectoProgramadoPorc() {
        this.elementoActivo.accesoDirectoProgramado = Math.floor((this.elementoActivo.accesoDirectoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaReservadoProgramado() {
        this.elementoActivo.reservadoProgramadoPorc = Math.floor((this.elementoActivo.reservadoProgramado * 100) / this.elementoActivo.cantidadTurnos);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaReservadoProgramadoPorc() {
        this.elementoActivo.reservadoProgramado = Math.floor((this.elementoActivo.reservadoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaReservadoProfesional() {
        this.elementoActivo.reservadoProfesionalPorc = Math.floor((this.elementoActivo.reservadoProfesional * 100) / this.elementoActivo.cantidadTurnos);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
    }

    cambiaReservadoProfesionalPorc() {
        this.elementoActivo.reservadoProfesional = Math.floor((this.elementoActivo.reservadoProfesionalPorc * this.elementoActivo.cantidadTurnos) / 100);
        //this.validarPorcentajes(this.elementoActivo);
        this.validarTodo();
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

    validarTodo() {
        // var desde = this.modelo.horaInicio;
        // var hasta = this.modelo.horaFin;
        var alerta: string;
        var indice: number;
        let bloques = this.modelo.bloques;
        this.alertas = [];
        bloques.forEach((bloque, index) => {
            var inicio = this.combinarFechas(this.modelo.fecha, bloque.horaInicio);
            var fin = this.combinarFechas(this.modelo.fecha, bloque.horaFin);
            if (this.compararFechas(this.modelo.horaInicio, inicio) > 0 || this.compararFechas(this.modelo.horaFin, fin) < 0) {
                alerta = "Bloque " + (index + 1) + ": Está fuera de los límites de la agenda";
                indice = this.alertas.indexOf(alerta);
                this.alertas.push(alerta);
            }

            if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoProgramado + bloque.reservadoProfesional) > bloque.cantidadTurnos) {
                alerta = "Bloque " + (index + 1) + ": La cantidad de turnos asignados es mayor a la cantidad disponible";
                this.alertas.push(alerta);
            }
           
            if (this.compararFechas(inicio, fin) > 0) {
                alerta = "Bloque " + (index + 1) + ": La hora de inicio es mayor a la hora de fin";
                this.alertas.push(alerta);
            }
        });
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
            espOperation.subscribe(resultado => {
                this.plex.alert("La agenda se guardo correctamente");

            });
        }
        else
            alert("Complete datos obligatorios");
    }

    onCancel() {
        this.data.emit(null);
        //return false;
    }

    onReturn(agenda: IPlantilla[]): void {
        this.showPlantilla = true;

        // this.selectedAgenda = idAgenda;

        window.setTimeout(() => this.showBuscarAgendas = false, 100);

        // debugger;
        this.cargarPlantilla(agenda);
    }
}