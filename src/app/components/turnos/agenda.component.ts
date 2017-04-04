import { Component, EventEmitter, Output, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';

import * as moment from 'moment';
import * as operaciones from './../../utils/operacionesJSON';

import { IAgenda } from './../../interfaces/turnos/IAgenda';

import { TipoPrestacionService } from './../../services/tipoPrestacion.service';
import { AgendaService } from './../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../services/profesional.service';

@Component({
    selector: 'agenda',
    templateUrl: 'agenda.html',
})
export class AgendaComponent implements OnInit {
    private _editarAgenda: any;
    @Input('editaAgenda')
    set editaAgenda(value: any) {
        this._editarAgenda = value;
    }
    get editaAgenda(): any {
        return this._editarAgenda;
    }

    @Output() cancelaEditar = new EventEmitter<boolean>();

    public modelo: any = {};
    public bloqueActivo: Number = 0;
    public elementoActivo: any = { descripcion: null };
    public alertas: String[] = [];
    public fecha: Date;
    public permisos = [];
    public autorizado = false;
    showBuscarAgendas = false;
    showClonar = false;
    showAgenda = true;
    showGestorAgendas = false;
    public hoy = moment().startOf('day');

    constructor(
        public plex: Plex,
        private router: Router,
        public servicioProfesional: ProfesionalService,
        public servicioEspacioFisico: EspacioFisicoService,
        public ServicioAgenda: AgendaService,
        public servicioTipoPrestacion: TipoPrestacionService,
        public auth: Auth) { }

    ngOnInit() {

        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;

        if (this.editaAgenda) {
            this.cargarAgenda(this._editarAgenda);
            this.bloqueActivo = 0;
        } else {
            this.modelo.bloques = [];
            this.bloqueActivo = -1;
        }
    }

    cargarAgenda(agenda: IAgenda) {
        this.modelo = agenda;
        if (!this.modelo.intercalar) {
            this.modelo.bloques.sort(this.compararBloques);
        }
        this.calculosInicio();
    }

    cargar() {
        this.showBuscarAgendas = true;
        this.showAgenda = false;
    }

    loadTipoPrestaciones(event) {
        this.permisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF = data.filter((x) => { return this.permisos.indexOf(x.id) >= 0; });
            console.log(dataF);
            event.callback(dataF);
        });
    }

    loadProfesionales(event) {
        this.servicioProfesional.get({}).subscribe(event.callback);
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
    }

    inicializarPrestacionesBloques(bloque) {
        console.log(this.modelo);
        if (this.modelo.tipoPrestaciones) {
            this.modelo.tipoPrestaciones.forEach((prestacion, index) => {
                const copiaPrestacion = operaciones.clonarObjeto(prestacion);
                if (bloque.tipoPrestaciones) {
                    let i = bloque.tipoPrestaciones.map(function (e) { return e.nombre; }).
                        indexOf(copiaPrestacion.nombre);
                    if (i >= 0) {
                        bloque.tipoPrestaciones[i].activo = true;
                    } else {
                        bloque.tipoPrestaciones.push(copiaPrestacion);
                        bloque.tipoPrestaciones[bloque.tipoPrestaciones.length - 1].activo = false;
                    }
                } else {
                    bloque.tipoPrestaciones.push(copiaPrestacion);
                    bloque.tipoPrestaciones[bloque.tipoPrestaciones.length - 1].activo = false;
                }
            });
            if (this.modelo.tipoPrestaciones.length === 1) {
                bloque.tipoPrestaciones[0].activo = true;
            }
        }
    }

    public calculosInicio() {
        this.modelo.fecha = this.modelo.horaInicio;
        let bloques = this.modelo.bloques;
        bloques.forEach((bloque, index) => {
            bloque.indice = index;
            if (!this.modelo.intercalar) {
                bloque.horaInicio = new Date(bloque.horaInicio);
                bloque.horaFin = new Date(bloque.horaFin);
                let inicio = bloque.horaInicio;
                let fin = bloque.horaFin;
                bloque.titulo = inicio.getHours() + ':' + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + '-' +
                    fin.getHours() + ':' + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();
            }
            if (bloque.cantidadTurnos) {
                bloque.accesoDirectoDelDia ? bloque.accesoDirectoDelDiaPorc = Math.floor
                    ((bloque.accesoDirectoDelDia * 100) / bloque.cantidadTurnos) : bloque.accesoDirectoDelDiaPorc = 0;
                bloque.accesoDirectoProgramado ? bloque.accesoDirectoProgramadoPorc = Math.floor
                    ((bloque.accesoDirectoProgramado * 100) / bloque.cantidadTurnos) : bloque.accesoDirectoProgramadoPorc = 0;
                bloque.reservadoGestion ? bloque.reservadoGestionPorc = Math.floor
                    ((bloque.reservadoGestion * 100) / bloque.cantidadTurnos) : bloque.reservadoGestionPorc = 0;
                bloque.reservadoProfesional ? bloque.reservadoProfesionalPorc = Math.floor
                    ((bloque.reservadoProfesional * 100) / bloque.cantidadTurnos) : bloque.reservadoProfesionalPorc = 0;
                if (!this.modelo.intercalar) {
                    const duracion = this.calcularDuracion(bloque.horaInicio, bloque.horaFin, bloque.cantidadTurnos);
                    bloque.duracionTurno = Math.floor(duracion);
                }
            } else {
                bloque.accesoDirectoDelDiaPorc = 0;
                bloque.accesoDirectoProgramadoPorc = 0;
                bloque.reservadoGestionPorc = 0;
                bloque.reservadoProfesionalPorc = 0;
            }
            this.inicializarPrestacionesBloques(bloque);
        });
        this.validarTodo();
        this.activarBloque(0);
    }

    activarBloque(indice: number) {
        this.bloqueActivo = indice;
        console.log('this.modelo.bloques[indice]: ', this.modelo.bloques[indice] ); // MAL
        this.elementoActivo = this.modelo.bloques[indice];
    }

    addBloque() {

        console.log('this.modelo.bloques: ', this.modelo.bloques); // MAL

        const longitud = this.modelo.bloques.length;
        this.modelo.bloques.push({
            indice: longitud,
            'descripcion': 'Nombre Bloque',
            'titulo': '',
            'cantidadTurnos': null,
            'horaInicio': null,
            'horaFin': null,
            'duracionTurno': null,
            'cantidadSimultaneos': null,
            'cantidadBloque': null,
            'accesoDirectoDelDia': 0, 'accesoDirectoDelDiaPorc': 0,
            'accesoDirectoProgramado': 0, 'accesoDirectoProgramadoPorc': 0,
            'reservadoGestion': 0, 'reservadoGestionPorc': 0,
            'reservadoProfesional': 0, 'reservadoProfesionalPorc': 0,
            'tipoPrestaciones': []
        });
        this.activarBloque(longitud);
        this.inicializarPrestacionesBloques(this.elementoActivo);
    }

    deleteBloque(indice: number) {
        // let confirma = confirm('Confirma que desea eliminar el bloque?');
        // if (confirma) {
        //     this.modelo.bloques.splice(indice, 1);
        //     this.bloqueActivo = -1;
        //     this.validarTodo();
        // } else {
        //     alert('no borra');
        // }
        this.plex.confirm('¿Confirma que desea eliminar el bloque?').then((confirma) => {
            if (confirma) {
                this.modelo.bloques.splice(indice, 1);
                this.bloqueActivo = -1;
                this.validarTodo();
            }
        }
        ).catch(() => {
            alert('no borra');
        });
    }

    compararBloques(fecha1, fecha2): number {
        let indiceAux: Number;
        if (fecha1.horaInicio && fecha2.horaInicio) {
            if (fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime() > 0) {
                indiceAux = fecha1.indice;
                fecha1.indice = fecha2.indice;
                fecha2.indice = indiceAux;
            }
            return fecha1.horaInicio.getTime() - fecha2.horaInicio.getTime();
        } else {
            return 0;
        }
    }

    compararFechas(fecha1: Date, fecha2: Date): number {
        if (fecha1 && fecha2) {
            return fecha1.getTime() - fecha2.getTime();
        } else {
            return 0;
        }
    }

    cambioPrestaciones() {
        if (this.modelo.bloques.length === 0) {

            console.log('this.modelo.bloques @ cambioPrestaciones', this.modelo.bloques);
            this.addBloque();
            this.bloqueActivo = 0;
            this.elementoActivo.horaInicio = this.modelo.horaInicio;
            this.elementoActivo.horaFin = this.modelo.horaFin;

            this.elementoActivo.titulo = this.modelo.horaInicio.getHours() + ':' + (this.modelo.horaInicio.getMinutes() < 10 ? '0' : '') + this.modelo.horaInicio.getMinutes() + '-' +
                this.modelo.horaFin.getHours() + ':' + (this.modelo.horaFin.getMinutes() < 10 ? '0' : '') + this.modelo.horaFin.getMinutes();

        } else {
            this.modelo.bloques.forEach((bloque) => {
                // Si se elimino una prestación, la saco de los bloques
                if (bloque.tipoPrestaciones) {
                    bloque.tipoPrestaciones.forEach((bloquePrestacion, index) => {
                        if (this.modelo.tipoPrestaciones) {
                            const i = this.modelo.tipoPrestaciones.map(function (e) { return e.nombre; }).indexOf(bloquePrestacion.nombre);
                            if (i < 0) {
                                bloque.tipoPrestaciones.splice(index, 1);
                                if (bloque.tipoPrestaciones.length === 1) {
                                    bloque.tipoPrestaciones[0].activo = true;
                                }
                            }
                        } else {
                            bloque.tipoPrestaciones = [];
                        }
                    });
                }
                // Si se agrego una prestacion, la agrego a los bloques
                if (this.modelo.tipoPrestaciones) {
                    this.modelo.tipoPrestaciones.forEach((prestacion) => {
                        let copiaPrestacion = operaciones.clonarObjeto(prestacion);
                        copiaPrestacion.activo = false;
                        let i = bloque.tipoPrestaciones.map(function (e) { return e.nombre; }).indexOf(copiaPrestacion.nombre);
                        if (i < 0) {
                            bloque.tipoPrestaciones.push(copiaPrestacion);
                            // if (bloque.tipoPrestaciones.length === 1) {
                            //     bloque.tipoPrestaciones[0].activo = true;
                            // }
                            // bloque.tipoPrestaciones[bloque.tipoPrestaciones.length - 1].activo = false;
                        }
                    });
                }
                // debugger
                if (bloque.tipoPrestaciones.length === 1) {
                    bloque.tipoPrestaciones[0].activo = true;
                }
            });
        }
    }

    cambioHoraBloques(texto: String) {
        this.fecha = new Date(this.modelo.fecha);
        let inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        let fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);

        if (inicio && fin) {
            this.elementoActivo.titulo = inicio.getHours() + ':' + (inicio.getMinutes() < 10 ? '0' : '') + inicio.getMinutes() + '-' +
                fin.getHours() + ':' + (fin.getMinutes() < 10 ? '0' : '') + fin.getMinutes();

            let duracion = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            if (duracion) {
                this.elementoActivo.duracionTurno = Math.floor(duracion);
                let cantidad = this.calcularCantidad(inicio, fin, duracion);
                this.elementoActivo.cantidadTurnos = Math.floor(cantidad);
            }
            this.validarTodo();
        }
        if (texto === 'inicio' && !this.modelo.intercalar) {
            this.modelo.bloques.sort(this.compararBloques);
        }

        this.bloqueActivo = this.elementoActivo.indice;
        this.activarBloque(this.elementoActivo.indice);
    }

    cambiaTurnos(cual: String) {
        this.fecha = new Date(this.modelo.fecha);
        let inicio = this.combinarFechas(this.fecha, this.elementoActivo.horaInicio);
        let fin = this.combinarFechas(this.fecha, this.elementoActivo.horaFin);
        if (inicio && fin) {
            if (cual === 'cantidad' && this.elementoActivo.cantidadTurnos) {
                this.elementoActivo.duracionTurno = this.calcularDuracion(inicio, fin, this.elementoActivo.cantidadTurnos);
            }
            if (cual === 'duracion' && this.elementoActivo.duracionTurno) {
                this.elementoActivo.cantidadTurnos = this.calcularCantidad(inicio, fin, this.elementoActivo.duracionTurno);
            }
            this.verificarCantidades();
        }
        this.validarTodo();
    }

    cambiaCantTipo(cual: String) {
        if (this.elementoActivo.cantidadTurnos) {
            switch (cual) {
                case 'accesoDirectoDelDia':
                    this.elementoActivo.accesoDirectoDelDiaPorc = Math.floor
                        ((this.elementoActivo.accesoDirectoDelDia * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'accesoDirectoProgramado':
                    this.elementoActivo.accesoDirectoProgramadoPorc = Math.floor
                        ((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'reservadoGestion':
                    this.elementoActivo.reservadoGestionPorc = Math.floor
                        ((this.elementoActivo.reservadoGestion * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'reservadoProfesional':
                    this.elementoActivo.reservadoProfesionalPorc = Math.floor
                        ((this.elementoActivo.reservadoProfesional * 100) / this.elementoActivo.cantidadTurnos);
                    break;
            }
            this.validarTodo();
        }
    }

    cambiaPorcentajeTipo(cual: String) {
        if (this.elementoActivo.cantidadTurnos) {
            switch (cual) {
                case 'accesoDirectoDelDia':
                    this.elementoActivo.accesoDirectoDelDia = Math.floor
                        ((this.elementoActivo.accesoDirectoDelDiaPorc * this.elementoActivo.cantidadTurnos) / 100);
                    break;
                case 'accesoDirectoProgramado':
                    this.elementoActivo.accesoDirectoProgramado = Math.floor
                        ((this.elementoActivo.accesoDirectoProgramadoPorc * this.elementoActivo.cantidadTurnos) / 100);
                    break;
                case 'reservadoGestion':
                    this.elementoActivo.reservadoGestion = Math.floor
                        ((this.elementoActivo.reservadoGestionPorc * this.elementoActivo.cantidadTurnos) / 100);
                    break;
                case 'reservadoProfesional':
                    this.elementoActivo.reservadoProfesional = Math.floor
                        ((this.elementoActivo.reservadoProfesionalPorc * this.elementoActivo.cantidadTurnos) / 100);
                    break;
            }
        }
        // this.validarTodo();
    }

    intercalar() {
        if (!this.modelo.intercalar) {
            this.modelo.bloques.forEach((bloque, index) => {
                bloque.horaInicio = null;
                bloque.horaFin = null;
                bloque.titulo = '';
            });
        }
    }

    xor(seleccion) {
        if (seleccion === 'simultaneos') {
            if (this.elementoActivo.citarPorBloque) {
                console.log('acaa');
                this.plex.alert('No puede haber pacientes simultáneos y citación por segmento al mismo tiempo');
                this.elementoActivo.pacienteSimultaneos = false;
            }
        }
        // alert('y ahora??' + seleccion);
    }

    calcularDuracion(inicio, fin, cantidad) {
        if (cantidad && inicio && fin) {
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio, 'minutes');
            return Math.floor(total / cantidad);
        } else {
            if (this.elementoActivo.duracionTurno) {
                return this.elementoActivo.duracionTurno;
            } else {
                return null;
            }
        }
    }

    calcularCantidad(inicio, fin, duracion) {
        if (duracion && duracion && inicio && fin) {
            inicio = moment(inicio);
            fin = moment(fin);
            let total = fin.diff(inicio, 'minutes');
            return Math.floor(total / duracion);
        } else {
            if (this.elementoActivo.cantidadTurnos) {
                return this.elementoActivo.cantidadTurnos;
            } else {
                return null;
            }
        }
    }

    verificarCantidades() {
        this.cambiaPorcentajeTipo('accesoDirectoDelDia');
        this.cambiaPorcentajeTipo('accesoDirectoProgramado');
        this.cambiaPorcentajeTipo('reservadoGestion');
        this.cambiaPorcentajeTipo('reservadoProfesional');
    }

    validarTodo() {

        let alerta: string;
        let indice: number;
        let cantidad: number;
        let iniAgenda = null;
        let finAgenda = null;
        this.fecha = new Date(this.modelo.fecha);
        if (this.modelo.horaInicio && this.modelo.horaFin) {
            iniAgenda = this.combinarFechas(this.fecha, this.modelo.horaInicio);
            finAgenda = this.combinarFechas(this.fecha, this.modelo.horaFin);
        }
        let bloques = this.modelo.bloques;
        this.alertas = [];
        let totalBloques = 0;
        // Verifico que ningún profesional esté asignado a otra agenda en ese horario
        if (iniAgenda && finAgenda && this.modelo.profesionales) {
            this.modelo.profesionales.forEach((profesional, index) => {
                // this.alertas = [];
                let alts = [];
                this.ServicioAgenda.get({ 'idProfesional': profesional.id, 'rango': true, 'desde': iniAgenda, 'hasta': finAgenda }).
                    subscribe(agendas => {
                        let agds = agendas.filter(agenda => {
                            return agenda.id !== this.modelo.id || !this.modelo.id;
                        });
                        cantidad = agds.length;
                        if (cantidad > 0) {
                            alts = [];
                            alts.push('El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario');
                            this.alertas = this.alertas.concat(alts);
                        }
                    });
            });
        }
        if (iniAgenda && finAgenda && this.modelo.espacioFisico) {
            // this.alertas = [];
            let alts = [];
            this.ServicioAgenda.get({ 'espacioFisico': this.modelo.espacioFisico.id, 'rango': true, 'desde': iniAgenda, 'hasta': finAgenda }).
                subscribe(agendas => {
                    let agds = agendas.filter(agenda => {
                        return agenda.id !== this.modelo.id || !this.modelo.id;
                    });
                    cantidad = agds.length;
                    if (cantidad > 0) {
                        alts = [];
                        alts.push('El ' + this.modelo.espacioFisico.nombre + ' está asignado a otra agenda en ese rango horario');
                        this.alertas = this.alertas.concat(alts);
                    }
                });
        }
        if (iniAgenda && finAgenda) {
            if (iniAgenda > finAgenda) {
                this.alertas.push('La hora de inicio no puede ser mayor a la de fin');
            }
            if (iniAgenda === finAgenda) {
                this.alertas.push('La hora de inicio no puede igual a la de fin');
            }
        }
        // Verifico que los bloques no estén fuera de los límites de la agenda
        if ( bloques ) {
            bloques.forEach((bloque, index) => {
                let inicio = this.combinarFechas(this.fecha, bloque.horaInicio);
                let fin = this.combinarFechas(this.fecha, bloque.horaFin);

                if (bloque.cantidadTurnos && bloque.duracionTurno) {
                    totalBloques = totalBloques + (bloque.cantidadTurnos * bloque.duracionTurno);
                }
                if (this.compararFechas(iniAgenda, inicio) > 0 || this.compararFechas(finAgenda, fin) < 0) {
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': Está fuera de los límites de la agenda';
                    indice = this.alertas.indexOf(alerta);
                    this.alertas.push(alerta);
                }

                if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional) > bloque.cantidadTurnos) {
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': La cantidad de turnos asignados es mayor a la cantidad disponible';
                    this.alertas.push(alerta);
                }

                if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional) < bloque.cantidadTurnos) {
                    const cant = bloque.cantidadTurnos - (bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional);
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': Falta clasificar ' + cant + ' turnos';
                    this.alertas.push(alerta);
                }

                if (this.compararFechas(inicio, fin) > 0) {
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': La hora de inicio es mayor a la hora de fin';
                    this.alertas.push(alerta);
                }

                // por cada bloque verificar que no se solape con ningún otro
                let mapeo = bloques.map(function (obj) {
                    if (obj.id !== bloque.id) {
                        let robj = {};
                        robj['horaInicio'] = obj.horaInicio;
                        robj['horaFin'] = obj.horaFin;
                        return robj;
                    } else {
                        return null;
                    }
                });

                mapeo.forEach((bloqueMap, index1) => {
                    if (bloqueMap) {
                        let bloqueMapIni = this.combinarFechas(this.fecha, bloqueMap.horaInicio);
                        let bloqueMapFin = this.combinarFechas(this.fecha, bloqueMap.horaFin);
                        if (this.compararFechas(inicio, bloqueMapFin) < 0 && this.compararFechas(bloqueMapIni, inicio) < 0) {
                            alerta = 'El bloque ' + (bloque.indice + 1) + ' se solapa con el ' + (index1 + 1);
                            this.alertas.push(alerta);
                        }
                    }
                });
            });
        }

        // Si son bloques intercalados (sin horainicio/horafin) verifico que no superen los minutos totales de la agenda
        totalBloques *= 60000;
        if (iniAgenda && finAgenda && iniAgenda <= finAgenda) {
            let totalAgenda = finAgenda.getTime() - iniAgenda.getTime();
            if (totalBloques > totalAgenda) {
                alerta = ' Los turnos de los bloques superan los minutos disponibles de la agenda';
                this.alertas.push(alerta);
            }
        }
    }

    combinarFechas(fecha1, fecha2) {
        if (fecha1 && fecha2) {
            let horas: number;
            let minutes: number;
            let auxiliar: Date;

            auxiliar = new Date(fecha1);
            horas = fecha2.getHours();
            minutes = fecha2.getMinutes();
            // Date.setHours(hour, min, sec, millisec)
            auxiliar.setHours(horas, minutes, 0, 0);
            return auxiliar;
        } else {
            return null;
        }
    }

    onSave($event, clonar) {

        if ($event.formValid) {
            let espOperation: Observable<IAgenda>;
            this.fecha = new Date(this.modelo.fecha);
            this.modelo.horaInicio = this.combinarFechas(this.fecha, this.modelo.horaInicio);
            this.modelo.horaFin = this.combinarFechas(this.fecha, this.modelo.horaFin);

            // Limpiar de bug selectize "$order", horrible todo esto :'(
            if (this.modelo.tipoPrestaciones) {
                this.modelo.tipoPrestaciones.forEach(function (prestacion, key) {
                    delete prestacion.$order;
                });
            }

            if (this.modelo.profesionales) {
                this.modelo.profesionales.forEach(function (prestacion, key) {
                    delete prestacion.$order;
                });
            }

            if (this.modelo.espacioFisico) {
                delete this.modelo.espacioFisico.$order;
            }

            this.modelo.organizacion = this.auth.organizacion;
            let bloques = this.modelo.bloques;

            bloques.forEach((bloque, index) => {

                let delDiaCount = bloque.accesoDirectoDelDia;
                let programadoCount = bloque.accesoDirectoProgramado;
                let profesionalCount = bloque.reservadoGestion;
                let gestionCount = bloque.reservadoProfesional;

                bloque.turnos = [];

                for (let i = 0; i < bloque.cantidadTurnos; i++) {

                    let turno = {
                        estado: 'disponible',
                        horaInicio: this.combinarFechas(this.fecha, new Date(bloque.horaInicio.getTime() + i * bloque.duracionTurno * 60000)),
                        tipoTurno: undefined
                    };

                    // if (delDiaCount > 0) {
                    //     turno.tipoTurno = 'delDia';
                    //     delDiaCount--;
                    // } else if (programadoCount > 0) {
                    //     turno.tipoTurno = 'programado';
                    //     programadoCount--;
                    // } else if (gestionCount > 0) {
                    //     turno.tipoTurno = 'gestion';
                    //     gestionCount--;
                    // } else if (profesionalCount > 0) {
                    //     turno.tipoTurno = 'profesional';
                    //     profesionalCount--;
                    // }

                    if (bloque.pacienteSimultaneos) {
                        // Simultaneos: Se crean los turnos según duración, se guardan n (cantSimultaneos) en c/ horario
                        for (let j = 0; j < bloque.cantidadSimultaneos; j++) {
                            bloque.turnos.push(turno);
                        }
                    } else {
                        if (bloque.citarPorBloque) {
                            // Citar x Bloque: Se generan los turnos según duración y cantidadPorBloque
                            for (let j = 0; j < bloque.cantidadBloque; j++) {
                                turno.horaInicio = new Date(bloque.horaInicio.getTime() + i * bloque.duracionTurno * bloque.cantidadBloque * 60000);
                                if (turno.horaInicio.getTime() < bloque.horaFin.getTime()) {
                                    bloque.turnos.push(turno);
                                }
                            }
                        } else {
                            // Bloque sin simultaneos ni Citación por bloque
                            bloque.turnos.push(turno);
                        }
                    }
                }

                bloque.horaInicio = this.combinarFechas(this.fecha, bloque.horaInicio);
                bloque.horaFin = this.combinarFechas(this.fecha, bloque.horaFin);
                bloque.tipoPrestaciones = bloque.tipoPrestaciones.filter(function (el) {
                    return el.activo === true && delete el.$order;
                });
            });

            console.log('this.modelo: ', this.modelo);
            espOperation = this.ServicioAgenda.save(this.modelo);

            espOperation.subscribe(resultado => {
                console.log(resultado);
                // alert('La agenda se guardo correctamente');
                this.plex.alert('La Agenda se guardó correctamente').then(guardo => {
                    if (clonar) {
                        this.showClonar = true;
                        this.showBuscarAgendas = false;
                        this.showAgenda = false;
                    } else {
                        this.modelo = {
                            fecha: null
                        };
                        this.bloqueActivo = -1;
                    }
                });
            });
        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar(agenda) {

        this.cancelaEditar.emit(true);

        this.showGestorAgendas = true;
        this.showAgenda = false;
        // this.router.navigate(['/inicio']);
        // return false;
    }

    onReturn(agenda: IAgenda): void {
        this.showAgenda = true;
        this.showBuscarAgendas = false;
        this.cargarAgenda(agenda);
    }
}
