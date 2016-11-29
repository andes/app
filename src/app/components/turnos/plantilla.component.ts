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

    cargarPlantilla(agenda: IPlantilla[]) {
        this.modelo = agenda;
        this.calculosInicio();
        this.modelo.bloques.sort(this.compararBloques);
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
            bloque.indice = index;
            bloque.horaInicio = new Date(bloque.horaInicio);
            bloque.horaFin = new Date(bloque.horaFin);
            var inicio = bloque.horaInicio;
            var fin = bloque.horaFin;
            if (bloque.cantidadTurnos){
                bloque.accesoDirectoDelDia? bloque.accesoDirectoDelDiaPorc = Math.floor((bloque.accesoDirectoDelDia * 100) / bloque.cantidadTurnos):bloque.accesoDirectoDelDiaPorc=0;
                bloque.accesoDirectoProgramado? bloque.accesoDirectoProgramadoPorc = Math.floor((bloque.accesoDirectoProgramado * 100) / bloque.cantidadTurnos):bloque.accesoDirectoProgramadoPorc = 0;
                bloque.reservadoProgramado? bloque.reservadoProgramadoPorc = Math.floor((bloque.reservadoProgramado * 100) / bloque.cantidadTurnos):bloque.reservadoProgramadoPorc = 0;
                bloque.reservadoProfesional? bloque.reservadoProfesionalPorc = Math.floor((bloque.reservadoProfesional * 100) / bloque.cantidadTurnos):bloque.reservadoProfesionalPorc = 0;
                let duracion = this.calcularDuracion(bloque.horaInicio, bloque.horaFin, bloque.cantidadTurnos);
                bloque.duracionTurno = Math.floor(duracion);
            }
            else{
                bloque.accesoDirectoDelDiaPorc = 0;
                bloque.accesoDirectoProgramadoPorc = 0;
                bloque.reservadoProgramadoPorc = 0;
                bloque.reservadoProfesionalPorc = 0;
                bloque.duracionTurno = 0
            }

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
        let longitud = this.modelo.bloques.length;
        this.modelo.bloques.push({
            indice: longitud,
            "descripcion": "Nuevo Bloque",
            "titulo": "",
            "cantidadTurnos": null,
            "horaInicio": null,
            "horaFin": null,
            "duracionTurno": null,
            "cantidadSimultaneos": null,
            "accesoDirectoDelDia": 0, "accesoDirectoDelDiaPorc": 0,
            "accesoDirectoProgramado": 0, "accesoDirectoProgramadoPorc": 0,
            "reservadoProgramado": 0, "reservadoProgramadoPorc": 0,
            "reservadoProfesional": 0, "reservadoProfesionalPorc": 0
        });
        this.activarBloque(longitud);
    }

    deleteBloque(indice: number) {
        if (this.plex.confirm('Confirma que desea eliminar el bloque?')) {
            this.modelo.bloques.splice(indice, 1);
            this.bloqueActivo = -1;
            this.validarTodo();
        }
    }

    compararBloques(fecha1, fecha2): number {
        let indiceAux: Number;
        if (fecha1 && fecha2) {
            console.log("fecha1.horaInicio  "+fecha1.horaInicio+"fecha2.horaInicio  "+fecha2.horaInicio+ " resu "+(fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime()));
            if(fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime() > 0){
                indiceAux = fecha1.indice;
                fecha1.indice = fecha2.indice;
                fecha2.indice = indiceAux;
            }
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

    cambioHoraBloques(texto:String) {
        this.fecha = this.modelo.fecha ? new Date(this.modelo.fecha) : new Date();
        var inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        var fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);
        this.elementoActivo.horaInicio =inicio;
        if (inicio && fin) {
            this.elementoActivo.titulo = inicio.getHours() + ":" + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + "-" +
                fin.getHours() + ":" + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();
                
            
            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion) {
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
            this.validarTodo();
        }
        if (texto == "inicio")
            this.modelo.bloques.sort(this.compararBloques);
        
        this.bloqueActivo = this.elementoActivo.indice;
        this.activarBloque(this.elementoActivo.indice);
        
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

    cambiaCantTipo(cual:String){
        switch(cual) {
            case "accesoDirectoDelDia":
                this.elementoActivo.accesoDirectoDelDiaPorc = Math.floor((this.elementoActivo.accesoDirectoDelDia * 100) / this.elementoActivo.cantidadTurnos);
                break;
            case "accesoDirectoProgramado":
                this.elementoActivo.accesoDirectoProgramadoPorc = Math.floor((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
                break;
            case "reservadoProgramado":
                this.elementoActivo.reservadoProgramadoPorc = Math.floor((this.elementoActivo.reservadoProgramado * 100) / this.elementoActivo.cantidadTurnos);
                break;
            case "reservadoProfesional":
                this.elementoActivo.reservadoProfesionalPorc = Math.floor((this.elementoActivo.reservadoProfesional * 100) / this.elementoActivo.cantidadTurnos);
                break;
        }
        this.validarTodo();
    }

    cambiaPorcentajeTipo(cual:String){
        switch(cual) {
            case "accesoDirectoDelDia":
                this.elementoActivo.accesoDirectoDelDia = Math.floor((this.elementoActivo.accesoDirectoDelDiaPorc * this.elementoActivo.cantidadTurnos) / 100);
                break;
            case "accesoDirectoProgramado":
                this.elementoActivo.accesoDirectoProgramado = Math.floor((this.elementoActivo.accesoDirectoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
                break;
            case "reservadoProgramado":
                this.elementoActivo.reservadoProgramado = Math.floor((this.elementoActivo.reservadoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
                break;
            case "reservadoProfesional":
                this.elementoActivo.reservadoProfesional = Math.floor((this.elementoActivo.reservadoProfesionalPorc * this.elementoActivo.cantidadTurnos) / 100);
                break;
        }
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
        this.cambiaPorcentajeTipo('accesoDirectoDelDia');
        this.cambiaPorcentajeTipo('accesoDirectoProgramado');
        this.cambiaPorcentajeTipo('reservadoProgramado');
        this.cambiaPorcentajeTipo('reservadoProfesional');
    }

    validarTodo() {
        var alerta: string;
        var indice: number;
        var fechaaux = this.modelo.fecha;
        let bloques = this.modelo.bloques;
        this.alertas = [];
        bloques.forEach((bloque, index) => {
            
            var inicio = this.combinarFechas(fechaaux, bloque.horaInicio);
            var fin = this.combinarFechas(fechaaux, bloque.horaFin);
            
            if (this.compararFechas(this.modelo.horaInicio, inicio) > 0 || this.compararFechas(this.modelo.horaFin, fin) < 0) {
                alerta = "Bloque " + (bloque.indice+1) + ": Está fuera de los límites de la agenda";
                indice = this.alertas.indexOf(alerta);
                this.alertas.push(alerta);
            }

            if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoProgramado + bloque.reservadoProfesional) > bloque.cantidadTurnos) {
                alerta = "Bloque " + (bloque.indice+1) + ": La cantidad de turnos asignados es mayor a la cantidad disponible";
                this.alertas.push(alerta);
            }

            if (this.compararFechas(inicio, fin) > 0) {
                alerta = "Bloque " + (bloque.indice+1) + ": La hora de inicio es mayor a la hora de fin";
                this.alertas.push(alerta);
            }
        });

    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            auxiliar.setHours(horas, minutes);
            return auxiliar;
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

        window.setTimeout(() => this.showBuscarAgendas = false, 100);

        this.cargarPlantilla(agenda);
    }
}