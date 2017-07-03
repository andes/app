import { OrganizacionService } from './../../../../services/organizacion.service';
import { Component, EventEmitter, Output, OnInit, Input, HostBinding } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import * as operaciones from './../../../../utils/operacionesJSON';
import { IAgenda } from './../../../../interfaces/turnos/IAgenda';
import { TipoPrestacionService } from './../../../../services/tipoPrestacion.service';
import { AgendaService } from './../../../../services/turnos/agenda.service';
import { EspacioFisicoService } from './../../../../services/turnos/espacio-fisico.service';
import { ProfesionalService } from './../../../../services/profesional.service';

@Component({
    selector: 'planificar-agenda',
    templateUrl: 'planificar-agenda.html',
})
export class PlanificarAgendaComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente

    private _editarAgenda: any;
    @Input('editaAgenda')
    set editaAgenda(value: any) {
        this._editarAgenda = value;
    }
    get editaAgenda(): any {
        return this._editarAgenda;
    }

    @Output() volverAlGestor = new EventEmitter<boolean>();

    public modelo: any = {};
    public bloqueActivo: Number = 0;
    public elementoActivo: any = { descripcion: null };
    public alertas = [];
    public fecha: Date;
    public autorizado = false;
    public today = new Date();
    showClonar = false;
    showAgenda = true;

    constructor(public plex: Plex, public servicioProfesional: ProfesionalService, public servicioEspacioFisico: EspacioFisicoService, public OrganizacionService: OrganizacionService,
        public ServicioAgenda: AgendaService, public servicioTipoPrestacion: TipoPrestacionService, public auth: Auth) { }

    ngOnInit() {
        this.autorizado = this.auth.getPermissions('turnos:planificarAgenda:?').length > 0;
        this.today.setHours(0, 0, 0, 0);
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

    loadTipoPrestaciones(event) {
        this.servicioTipoPrestacion.get({ turneable: 1 }).subscribe((data) => {
            let dataF = data.filter((x) => { return this.auth.check('turnos:planificarAgenda:prestacion:' + x.id); });
            event.callback(dataF);
        });
    }

    loadProfesionales(event) {
        let listaProfesionales = [];
        if (event.query) {
            let query = {
                nombreCompleto: event.query
            };
            this.servicioProfesional.get(query).subscribe(resultado => {
                if (this.modelo.profesionales) {
                    listaProfesionales = (resultado) ? this.modelo.profesionales.concat(resultado) : this.modelo.profesionales;
                } else {
                    listaProfesionales = resultado;
                }
                event.callback(listaProfesionales);
            });
        } else {
            event.callback(this.modelo.profesionales || []);
        }
    }

    loadEdificios(event) {
        this.OrganizacionService.getById(this.auth.organizacion._id).subscribe(respuesta => {
            event.callback(respuesta.edificio);
        });
    }

    loadEspacios(event) {
        this.servicioEspacioFisico.get({ organizacion: this.auth.organizacion._id }).subscribe(event.callback);
    }

    loadServicios(event) {
        this.servicioEspacioFisico.get({}).subscribe(respuesta => {
            let servicios = respuesta.map((ef) => {
                return (typeof ef.servicio !== 'undefined' ? { nombre: ef.servicio.nombre, id: ef.servicio.id } : []);
            });
            event.callback(servicios);
        });
    }

    horaInicioPlus() {
        return moment(this.modelo.horaInicio).add(30, 'minutes');
    }

    inicializarPrestacionesBloques(bloque) {
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
        this.elementoActivo = this.modelo.bloques[indice];
    }

    addBloque() {
        const longitud = this.modelo.bloques.length;
        this.modelo.bloques.push({
            indice: longitud,
            // 'descripcion': `Bloque {longitud + 1}°`,
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
        this.plex.confirm('¿Confirma que desea eliminar el bloque?').then((confirma) => {
            if (confirma) {
                this.modelo.bloques.splice(indice, 1);
                this.bloqueActivo = -1;
                this.validarTodo();
            }
        }
        ).catch(() => {
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
            this.addBloque();
            this.bloqueActivo = 0;
            this.elementoActivo.horaInicio = this.modelo.horaInicio;
            this.elementoActivo.horaFin = this.modelo.horaFin;
        } else {
            this.modelo.bloques.forEach((bloque) => {
                // Si se elimino una prestación, la saco de los bloques
                if (bloque.tipoPrestaciones) {
                    bloque.tipoPrestaciones.forEach((bloquePrestacion, index) => {
                        if (this.modelo.tipoPrestaciones) {
                            const tipo = this.modelo.tipoPrestaciones.find(x => x.nombre === bloquePrestacion.nombre);
                            const i = this.modelo.tipoPrestaciones.indexOf(tipo);
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
                        const tipo = bloque.tipoPrestaciones.find(x => x.nombre === copiaPrestacion.nombre);
                        const i = bloque.tipoPrestaciones.indexOf(tipo);
                        if (i < 0) {
                            bloque.tipoPrestaciones.push(copiaPrestacion);
                        }
                    });
                }
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
        // if ($event.key === '-')
        if (this.elementoActivo.cantidadTurnos) {
            switch (cual) {
                case 'accesoDirectoDelDia':
                    this.elementoActivo.accesoDirectoDelDiaPorc = Math.ceil
                        ((this.elementoActivo.accesoDirectoDelDia * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'accesoDirectoProgramado':
                    this.elementoActivo.accesoDirectoProgramadoPorc = Math.ceil
                        ((this.elementoActivo.accesoDirectoProgramado * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'reservadoGestion':
                    this.elementoActivo.reservadoGestionPorc = Math.ceil
                        ((this.elementoActivo.reservadoGestion * 100) / this.elementoActivo.cantidadTurnos);
                    break;
                case 'reservadoProfesional':
                    this.elementoActivo.reservadoProfesionalPorc = Math.ceil
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
        this.validarTodo();
    }

    intercalar() {
        if (!this.modelo.intercalar) {
            this.modelo.bloques.forEach((bloque, index) => {
                bloque.horaInicio = null;
                bloque.horaFin = null;
            });
        }
    }

    xor(seleccion) {
        if (seleccion === 'simultaneos') {
            if (this.elementoActivo.citarPorBloque) {
                this.plex.info('warning', 'No puede haber pacientes simultáneos y citación por segmento al mismo tiempo');
                this.elementoActivo.pacienteSimultaneos = false;
            }
        }
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
        this.alertas = [];
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
        let totalBloques = 0;
        // Verifica que ningún profesional de la agenda esté asignado a otra agenda en ese horario
        if (iniAgenda && finAgenda && this.modelo.profesionales) {
            this.modelo.profesionales.forEach((profesional, index) => {
                this.ServicioAgenda.get({ idProfesional: profesional.id, rango: true, desde: iniAgenda, hasta: finAgenda }).
                    subscribe(agendas => {
                        let agds = agendas.filter(agenda => {
                            return agenda.id !== this.modelo.id || !this.modelo.id;
                        });
                        if (agds.length > 0) {
                            alerta = 'El profesional ' + profesional.nombre + ' ' + profesional.apellido + ' está asignado a otra agenda en ese horario';
                            if (this.alertas.indexOf(alerta) < 0) {
                                this.alertas = [... this.alertas, alerta];

                            }
                        }
                    });
            });
        }
        // Verifica que el espacio fisico no esté ocupado en ese rango horario
        if (iniAgenda && finAgenda && this.modelo.espacioFisico) {
            this.ServicioAgenda.get({ espacioFisico: this.modelo.espacioFisico.id, rango: true, desde: iniAgenda, hasta: finAgenda }).
                subscribe(agendas => {
                    let agds = agendas.filter(agenda => {
                        return agenda.id !== this.modelo.id || !this.modelo.id;
                    });
                    if (agds.length > 0) {
                        alerta = 'El ' + this.modelo.espacioFisico.nombre + ' está asignado a otra agenda en ese rango horario';
                        if (this.alertas.indexOf(alerta) < 0) {
                            this.alertas = [... this.alertas, alerta];
                        }
                    }
                });
        }
        // Verifica que la hora inicio y hora fin de la agenda sean correctas
        if (iniAgenda && finAgenda) {
            if (iniAgenda > finAgenda) {
                this.alertas.push('La hora de inicio no puede ser mayor a la de fin');
            }
            if (iniAgenda === finAgenda) {
                this.alertas.push('La hora de inicio no puede igual a la de fin');
            }
        }
        // Verificaciones en cada bloque
        if (bloques) {
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

                // let add = bloque.accesoDirectoDelDia > 0 ? bloque.accesoDirectoDelDia : 0;
                // let adp = bloque.accesoDirectoProgramado > 0 ? bloque.accesoDirectoProgramado : 0;
                // let rg = bloque.reservadoGestion > 0 ? bloque.reservadoGestion : 0;
                // let rp = bloque.reservadoProfesional > 0 ? bloque.reservadoProfesional : 0;

                // if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional) < bloque.cantidadTurnos) {
                if ((bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional) < bloque.cantidadTurnos) {
                    const cant = bloque.cantidadTurnos - (bloque.accesoDirectoDelDia + bloque.accesoDirectoProgramado + bloque.reservadoGestion + bloque.reservadoProfesional);
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': Falta clasificar ' + cant + (cant === 1 ? ' turno' : ' turnos');
                    this.alertas = [... this.alertas, alerta];
                }

                if (this.compararFechas(inicio, fin) > 0) {
                    alerta = 'Bloque ' + (bloque.indice + 1) + ': La hora de inicio es mayor a la hora de fin';
                    this.alertas.push(alerta);
                }

                // Verifica que no se solape con ningún otro
                let mapeo = bloques.map(function (obj) {
                    if (obj.indice !== bloque.indice) {
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
                        console.log('inicio ', inicio);
                        console.log('bloqueMapFin ', bloqueMapFin);
                        // if (this.compararFechas(inicio, bloqueMapFin) < 0 && this.compararFechas(bloqueMapIni, inicio) < 0) {
                        if (this.compararFechas(bloqueMapIni, fin) < 0 && this.compararFechas(inicio, bloqueMapFin) < 0) {
                            alerta = 'El bloque ' + (bloque.indice + 1) + ' se solapa con el ' + (index1 + 1);
                            let alertaOpuesta = 'El bloque ' + (index1 + 1) + ' se solapa con el ' + (bloque.indice + 1);
                            if (this.alertas.indexOf(alertaOpuesta) < 0) {
                                this.alertas.push(alerta);
                            }
                        }
                    }
                });
            });
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
        let validaBloques = true;
        for (let i = 0; i < this.modelo.bloques.length; i++) {
            let bloque = this.modelo.bloques[i];
            // Verifico que cada bloque tenga al menos una prestacion activa
            let prestacionActiva = false;
            for (let j = 0; j < bloque.tipoPrestaciones.length; j++) {
                if (bloque.tipoPrestaciones[j].activo) {
                    prestacionActiva = true;
                    break;
                }
            }
            if (!(bloque.horaInicio && bloque.horaFin && bloque.cantidadTurnos && bloque.duracionTurno && prestacionActiva)) {
                validaBloques = false;
                break;
            }
        }
        if ($event.formValid && validaBloques) {
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
            if (this.modelo.edificio) {
                delete this.modelo.edificio.$order;
            }
            if (this.modelo.espacioFisico) {
                delete this.modelo.espacioFisico.$order;
            }
            if (this.modelo.servicio) {
                delete this.modelo.servicio.$order;
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
            espOperation = this.ServicioAgenda.save(this.modelo);
            espOperation.subscribe(resultado => {
                this.plex.toast('success', 'La agenda se guardó correctamente');
                this.modelo.id = resultado.id;
                if (clonar) {
                    this.showClonar = true;
                    this.showAgenda = false;
                } else {
                    this.modelo = {};
                    this.showAgenda = false;
                    this.volverAlGestor.emit(true);
                }
            });
        } else {
            this.plex.alert('Debe completar los datos requeridos');
        }
    }

    cancelar() {
        this.volverAlGestor.emit(true);
        this.showAgenda = false;
    }

    onReturn(agenda: IAgenda): void {
        this.showAgenda = true;
        this.cargarAgenda(agenda);
    }
}
