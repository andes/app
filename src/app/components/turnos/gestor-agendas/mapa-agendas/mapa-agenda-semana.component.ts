import moment from 'moment';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { MapaAgendasService } from './mapa-agendas.service';

@Component({
    selector: 'mapa-agenda-semana',
    templateUrl: 'mapa-agenda-semana.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasSemanaComponent implements OnInit, OnDestroy {

    public headers = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
    public semana = [];
    public filas = [];
    public horaInicio = 6;
    public horaFin = 20;
    public intervalo = 30;
    public _fecha;
    public semanaSeleccionada;
    @Output() diaDetalle = new EventEmitter<any>();
    @Output() notaDetalle = new EventEmitter<any>();
    @Output() notaNueva = new EventEmitter<{ fecha: Date; horaInicio: Date; horaFin: Date }>();
    @Input() crearNotaEnSlot = false;
    calendario: any;
    @Input()
    set fecha(value: any) {
        this._fecha = value;
        this.cambiarSemana();
    }
    private subscription: Subscription;


    constructor(
        private mapaAgendaService: MapaAgendasService
    ) { }

    ngOnInit() {
        this.subscription = this.mapaAgendaService.calendario$.subscribe(calendario => {
            this.calendario = calendario;
            this.cambiarSemana();
        });


    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private cargarSemana() {
        this._fecha = moment(this._fecha).startOf('week');
        this.semana = this.headers.map((nombre, index) => {
            return {
                nombre,
                fecha: this._fecha.weekday(index).toDate(),
                turnos: [],
                notas: []
            };
        });
        this.cargarTabla();
    }

    private cargarTabla() {
        const totalSlots = this.cantidadFilas();
        this.filas = [];
        for (let index = 0; index < totalSlots; index++) {
            const minutos = index * this.intervalo;
            this.filas.push({
                hora: this.horaInicio + Math.floor(minutos / 60)
            });
        }

        this.semana.forEach(dia => {
            const turnos = this.turnosDelDia(dia, totalSlots);
            this.asignarCarriles(turnos);
            this.asignarAnchos(turnos);
            dia.turnos = turnos;

            const notas = this.notasDelDia(dia, totalSlots);
            this.asignarCarriles(notas);
            this.asignarAnchos(notas);
            dia.notas = notas;
        });
    }

    private cantidadFilas() {
        return (this.horaFin - this.horaInicio) * (60 / this.intervalo);
    }

    private turnosDelDia(dia, totalSlots) {
        const vistos = new Set<string>();
        const turnos = [];
        const diaSemana = this.semanaSeleccionada?.find(item =>
            item.fecha && moment(dia.fecha).isSame(item.fecha, 'day')
        );

        diaSemana?.prestaciones?.forEach(prestacion => {
            if (!prestacion.color) {
                return;
            }
            prestacion.turnosPorPrestacion?.forEach(turno => {
                if (turno?.estado !== 'asignado' || !turno.paciente || !turno.horaInicio) {
                    return;
                }
                const id = turno.id || turno._id;
                const clave = id ? String(id) : null;
                if (clave && vistos.has(clave)) {
                    return;
                }
                if (clave) {
                    vistos.add(clave);
                }
                const ubicacion = this.ubicarTurno(turno, prestacion.agenda, dia, totalSlots);
                if (!ubicacion) {
                    return;
                }
                const nombre = this.nombrePaciente(turno.paciente);
                const hora = moment(turno.horaInicio).format('HH:mm');
                turnos.push({
                    slot: ubicacion.slot,
                    rowspan: ubicacion.rowspan,
                    turno,
                    agenda: prestacion.agenda,
                    color: prestacion.color,
                    iniciales: this.iniciales(turno.paciente),
                    titulo: nombre ? `${nombre} ${hora}` : hora
                });
            });
        });

        return turnos;
    }

    private ubicarTurno(turno, agenda, dia, totalSlots) {
        const inicioGrilla = moment(dia.fecha).hour(this.horaInicio).minute(0).second(0).millisecond(0);
        const minutos = moment(turno.horaInicio).diff(inicioGrilla, 'minutes');
        if (minutos < 0) {
            return null;
        }
        const slot = Math.floor(minutos / this.intervalo);
        if (slot >= totalSlots) {
            return null;
        }
        const duracion = this.duracionMinutos(turno, agenda);
        const rowspan = Math.min(
            Math.max(1, Math.ceil(duracion / this.intervalo)),
            totalSlots - slot
        );
        return { slot, rowspan };
    }

    private duracionMinutos(turno, agenda) {
        const bloque = this.bloqueDelTurno(turno, agenda);
        if (!bloque?.duracionTurno) {
            return this.intervalo;
        }
        // El próximo inicio del segmento queda a duracionTurno * cantidadBloque.
        if (bloque.citarPorBloque) {
            return bloque.duracionTurno * (bloque.cantidadBloque || 1);
        }
        return bloque.duracionTurno;
    }

    private bloqueDelTurno(turno, agenda) {
        const id = turno?.id || turno?._id;
        return agenda?.bloques?.find(bloque =>
            bloque.turnos?.some(item =>
                item === turno || this.mismoId(item?.id || item?._id, id)
            )
        );
    }

    private mismoId(a, b) {
        if (a === null || a === undefined || b === null || b === undefined) {
            return false;
        }
        return String(a) === String(b);
    }

    private iniciales(paciente) {
        if (!paciente) {
            return '?';
        }
        const apellido = (paciente.apellido || '').trim();
        const nombre = (paciente.alias || paciente.nombre || '').trim();
        return (apellido.charAt(0) + nombre.charAt(0)).toUpperCase() || '?';
    }

    private nombrePaciente(paciente) {
        if (!paciente) {
            return '';
        }
        if (paciente.alias) {
            return `${paciente.apellido || ''}, ${paciente.alias}`.replace(/^,\s*/, '');
        }
        if (paciente.apellido && paciente.nombre) {
            return `${paciente.apellido}, ${paciente.nombre}`;
        }
        return paciente.apellido || paciente.nombre || '';
    }

    private asignarCarriles(turnos) {
        turnos.sort((a, b) => a.slot - b.slot || b.rowspan - a.rowspan);
        const libres = [];
        turnos.forEach(turno => {
            let carril = libres.findIndex(libre => libre <= turno.slot);
            if (carril === -1) {
                carril = libres.length;
                libres.push(0);
            }
            libres[carril] = turno.slot + turno.rowspan;
            turno.carril = carril;
        });
    }

    private asignarAnchos(turnos) {
        turnos.forEach(turno => {
            let simultaneos = 1;
            for (let slot = turno.slot; slot < turno.slot + turno.rowspan; slot++) {
                const enSlot = turnos.filter(otro =>
                    otro.slot <= slot && slot < otro.slot + otro.rowspan
                ).length;
                if (enSlot > simultaneos) {
                    simultaneos = enSlot;
                }
            }
            turno.ancho = `${100 / simultaneos}%`;
            turno.offset = `${(turno.carril * 100) / simultaneos}%`;
        });
    }

    private notasDelDia(dia, totalSlots) {
        const diaSemana = this.semanaSeleccionada?.find(item =>
            item.fecha && moment(dia.fecha).isSame(item.fecha, 'day')
        );
        const fuente = Array.isArray(diaSemana?.notas) ? diaSemana.notas : [];
        const notas = [];
        fuente.forEach(nota => {
            const ubicacion = this.ubicarNota(nota, dia, totalSlots);
            if (!ubicacion) {
                return;
            }
            notas.push({
                slot: ubicacion.slot,
                rowspan: ubicacion.rowspan,
                nota,
                texto: nota?.texto || '',
                titulo: this.tituloNota(nota)
            });
        });
        return notas;
    }

    private ubicarNota(nota, dia, totalSlots) {
        if (!nota?.horaInicio || !nota?.horaFin) {
            return null;
        }
        const inicioGrilla = moment(dia.fecha).hour(this.horaInicio).minute(0).second(0).millisecond(0);
        const finGrilla = moment(dia.fecha).hour(this.horaFin).minute(0).second(0).millisecond(0);
        const inicio = moment(nota.horaInicio);
        const fin = moment(nota.horaFin);
        if (!inicio.isValid() || !fin.isValid()) {
            return null;
        }
        const visibleInicio = inicio.isAfter(inicioGrilla) ? inicio : inicioGrilla;
        const visibleFin = fin.isBefore(finGrilla) ? fin : finGrilla;
        if (!visibleInicio.isBefore(visibleFin)) {
            return null;
        }
        const msIntervalo = this.intervalo * 60 * 1000;
        const slot = Math.floor(visibleInicio.diff(inicioGrilla) / msIntervalo);
        const slotFin = Math.ceil(visibleFin.diff(inicioGrilla) / msIntervalo);
        const desde = Math.max(0, Math.min(slot, totalSlots));
        const hasta = Math.max(0, Math.min(slotFin, totalSlots));
        const rowspan = hasta - desde;
        if (rowspan <= 0) {
            return null;
        }
        return { slot: desde, rowspan };
    }

    private tituloNota(nota) {
        const servicio = nota?.servicioIntermedio?.nombre || '';
        const inicio = moment(nota.horaInicio).format('HH:mm');
        const fin = moment(nota.horaFin).format('HH:mm');
        const texto = nota?.texto || '';
        return [servicio, `${inicio}-${fin}`, texto].filter(parte => !!parte).join(' ');
    }

    private cambiarSemana() {
        if (this.calendario) {
            this.semanaSeleccionada = this.calendario.find(dias =>
                dias.find(
                    dia => dia.fecha && moment(dia.fecha).isSame(this._fecha, 'day')
                )
            );
            if (this.semanaSeleccionada) {

                this.cargarSemana();

            } else {
                this.mapaAgendaService.cargarAgendasMes(this._fecha);

            }

        }

    }

    detalleDia(celda) {
        if (!celda?.turno) {
            return;
        }
        this.diaDetalle.emit({
            turnos: [celda.turno],
            agenda: celda.agenda
        });
    }

    detalleNota(celda) {
        if (!celda?.nota) {
            return;
        }
        this.notaDetalle.emit(celda.nota);
    }

    slotClick(indiceDia: number, indiceFila: number) {
        if (!this.crearNotaEnSlot) {
            return;
        }
        const dia = this.semana[indiceDia];
        if (!dia?.fecha) {
            return;
        }
        const minutos = indiceFila * this.intervalo;
        const horaInicio = moment(dia.fecha)
            .hour(this.horaInicio)
            .minute(0)
            .second(0)
            .millisecond(0)
            .add(minutos, 'minutes')
            .toDate();
        const horaFin = moment(horaInicio).add(this.intervalo, 'minutes').toDate();
        this.notaNueva.emit({
            fecha: moment(dia.fecha).startOf('day').toDate(),
            horaInicio,
            horaFin
        });
    }


}
