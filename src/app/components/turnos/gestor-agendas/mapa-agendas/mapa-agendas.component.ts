import moment from 'moment';
import { Auth } from '@andes/auth';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';
import { ITurno } from 'src/app/interfaces/turnos/ITurno';
import { AmbitoOrigen } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { iconoAmbitoOrigen as iconoAmbitoOrigenUtil } from './ambito-origen-icon.util';
import { SlotSeleccionado } from './dar-turno-slot/dar-turno-slot.interface';
import { MapaAgendasService } from './mapa-agendas.service';
import { NotaAgendaService } from './nota-agenda.service';

@Component({
    selector: 'mapa-agenda',
    templateUrl: 'mapa-agendas.component.html',
    styleUrls: ['mapa-agendas.scss']
})
export class MapaAgendasComponent implements OnInit {

    public accion: 'verDetalle' | 'nota' | 'turno' | null;
    public slot: SlotSeleccionado = null;
    public puedeDarTurno = false;
    public prestacionesTurnos: string[] = [];
    public modulo: string;
    public agendas_dia;
    public dia;
    public notaForm: any = {
        fecha: null,
        horaInicio: null,
        horaFin: null,
        servicio: null,
        texto: ''
    };
    public notaErrores: string[] = [];
    public prestacionesPermisos;
    public verMes = true;
    public diaInicio = new Date();
    public verSemana = false;
    public mostrarFiltroServicio = false;
    public serviciosIntermedio = [];
    public servicioIntermedio = null;
    constructor(
        private auth: Auth,
        private router: Router,
        private activeRoute: ActivatedRoute,
        private mapaAgendasService: MapaAgendasService,
        private servicioIntermedioService: ServicioIntermedioService,
        private notaAgendaService: NotaAgendaService

    ) { }

    ngOnInit() {
        this.modulo = this.activeRoute.snapshot.data.modulo;
        this.prestacionesTurnos = this.auth.getPermissions('turnos:darTurnos:prestacion:?');
        this.puedeDarTurno = this.auth.getPermissions('turnos:darTurnos:?').length > 0;
        let serviciosPermisos = [];
        if (this.modulo === 'rup') {
            this.mapaAgendasService.setPermisos('rup:tipoPrestacion:?');
            this.prestacionesPermisos = this.auth.getPermissions('rup:tipoPrestacion:?');
            serviciosPermisos = this.auth.getPermissions('rup:servicio-intermedio:?') || [];
            this.mostrarFiltroServicio = serviciosPermisos.length > 0;
            if (this.mostrarFiltroServicio) {
                this.mapaAgendasService.setRequiereServicioIntermedio(true);
                this.servicioIntermedioService.getAll().subscribe(servicios => {
                    this.serviciosIntermedio = (servicios || []).filter(servicio =>
                        serviciosPermisos[0] === '*' || serviciosPermisos.indexOf(servicio.id) >= 0
                    );
                    if (this.serviciosIntermedio.length) {
                        const primero = this.serviciosIntermedio[0];
                        this.accion = null;
                        this.servicioIntermedio = primero;
                        this.mapaAgendasService.setServicioIntermedio(primero);
                        this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
                    }
                });
            }
        } else {
            this.mapaAgendasService.setPermisos('turnos:planificarAgenda:prestacion:?');
            this.prestacionesPermisos = this.auth.getPermissions('turnos:planificarAgenda:prestacion:?');
        }
        if (!(this.prestacionesPermisos && this.prestacionesPermisos.length) && !serviciosPermisos.length) {
            this.router.navigate(['inicio']);
        }
    }

    filtrarServicioIntermedio(servicio) {
        if (this.mostrarFiltroServicio && !servicio?.id) {
            return;
        }
        const id = servicio?.id || null;
        const idActual = this.mapaAgendasService.servicioIntermedio?.id || null;
        if (id === idActual) {
            return;
        }
        this.accion = null;
        this.slot = null;
        this.servicioIntermedio = servicio || null;
        this.mapaAgendasService.setServicioIntermedio(this.servicioIntermedio);
        this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
    }


    visualizarSemana(semana) {

        this.accion = null;
        this.slot = null;
        const diaSema = semana.find(dia => !dia.estado);
        this.verSemana = true;
        this.verMes = false;
        this.diaInicio = moment(diaSema.fecha).toDate();
    }

    visualizarMes() {
        this.accion = null;
        this.verSemana = false;
        this.diaInicio = moment(this.diaInicio).toDate();
        this.verMes = true;
    }

    verAgendas(dia) {
        this.dia = dia;
        // agrupo por agendas
        const agenda_Prestaciones = [];
        const agendas = {};
        dia.prestaciones.forEach(p => {

            if (!agendas[p.agenda.id]) {
                agendas[p.agenda.id] = {
                    Prestaciones: [],
                    agenda: p.agenda,
                    fecha: dia.fecha

                };
            }

            agendas[p.agenda.id].Prestaciones.push(p);

        });

        for (const property in agendas) {

            agenda_Prestaciones.push(agendas[property]);
        }
        this.accion = 'verDetalle';
        this.agendas_dia = agenda_Prestaciones;
    }

    turnos(dia) {
        this.accion = 'verDetalle';
        this.dia = dia;
    }

    close() {
        this.accion = null;
        this.slot = null;
        this.notaErrores = [];
    }

    etiquetaPrestacionTurno(turno: ITurno) {
        return this.mapaAgendasService.etiquetaPrestacionTurno(turno);
    }

    iconoAmbitoOrigen(ambito?: AmbitoOrigen | null): string | null {
        return iconoAmbitoOrigenUtil(ambito);
    }

    onSlotSeleccionado(slot: SlotSeleccionado) {
        this.slot = slot;
        this.accion = 'turno';
    }

    turnoGuardado() {
        this.close();
        this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
    }

    nuevaNota(horario?: { fecha?: Date; horaInicio?: Date; horaFin?: Date }) {
        if (!this.notasHabilitadas()) {
            return;
        }
        this.notaErrores = [];
        this.notaForm = {
            id: null,
            fecha: moment(horario?.fecha || this.diaInicio).startOf('day').toDate(),
            horaInicio: horario?.horaInicio ?? null,
            horaFin: horario?.horaFin ?? null,
            servicio: this.servicioIntermedio?.id ? this.servicioIntermedio : null,
            texto: ''
        };
        this.accion = 'nota';
    }

    verNota(nota) {
        if (!this.notasHabilitadas() || !nota) {
            return;
        }
        const fechaNota = nota.fecha || nota.horaInicio || this.diaInicio;
        this.notaErrores = [];
        this.notaForm = {
            id: nota.id || nota._id || null,
            _id: nota._id || null,
            fecha: moment(fechaNota).startOf('day').toDate(),
            horaInicio: nota.horaInicio ? moment(nota.horaInicio).toDate() : null,
            horaFin: nota.horaFin ? moment(nota.horaFin).toDate() : null,
            servicio: this.servicioDeLaNota(nota),
            texto: nota.texto || ''
        };
        this.accion = 'nota';
    }

    guardarNota() {
        if (!this.notasHabilitadas()) {
            return;
        }
        const data = this.armarNota();
        if (!data.id && this.notaForm?._id) {
            data.id = this.notaForm._id;
        }
        this.notaErrores = this.validarNota(data);
        if (this.notaErrores.length) {
            return;
        }
        this.notaAgendaService.save(data).subscribe(() => {
            this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
            this.close();
        }, () => undefined);
    }

    eliminarNota() {
        if (!this.notasHabilitadas()) {
            return;
        }
        const id = this.notaForm?.id || this.notaForm?._id;
        if (!id) {
            return;
        }
        this.notaAgendaService.delete(id).subscribe(() => {
            this.mapaAgendasService.cargarAgendasMes(this.diaInicio);
            this.close();
        }, () => undefined);
    }

    private notasHabilitadas() {
        return this.modulo === 'rup' && this.mostrarFiltroServicio;
    }

    private servicioDeLaNota(nota) {
        const servicioNota = nota?.servicioIntermedio;
        const servicioId = servicioNota?.id || servicioNota?._id;
        if (!servicioId) {
            return null;
        }
        const encontrado = (this.serviciosIntermedio || []).find(servicio =>
            String(servicio?.id) === String(servicioId)
        );
        return encontrado || {
            id: servicioId,
            nombre: servicioNota.nombre
        };
    }

    private armarNota() {
        const fechaDia = this.notaForm?.fecha ? moment(this.notaForm.fecha).startOf('day') : null;
        const horaInicio = this.combinarFechaHora(fechaDia, this.notaForm?.horaInicio);
        const horaFin = this.combinarFechaHora(fechaDia, this.notaForm?.horaFin);
        const servicio = this.notaForm?.servicio;
        const data: any = {
            texto: (this.notaForm?.texto || '').trim(),
            fecha: fechaDia?.isValid() ? fechaDia.toDate() : null,
            horaInicio: horaInicio?.isValid() ? horaInicio.toDate() : null,
            horaFin: horaFin?.isValid() ? horaFin.toDate() : null
        };
        if (servicio?.id) {
            data.servicioIntermedio = {
                _id: servicio.id,
                nombre: servicio.nombre
            };
        }
        const id = this.notaForm?.id || this.notaForm?._id;
        if (id) {
            data.id = id;
        }
        return data;
    }

    private validarNota(data) {
        const errores = [];
        if (!data?.texto) {
            errores.push('El texto es obligatorio.');
        } else if (data.texto.length > 500) {
            errores.push('El texto no puede superar los 500 caracteres.');
        }
        if (!data?.fecha) {
            errores.push('La fecha es obligatoria.');
        }
        if (!data?.horaInicio) {
            errores.push('La hora de inicio es obligatoria.');
        }
        if (!data?.horaFin) {
            errores.push('La hora de fin es obligatoria.');
        }
        if (!data?.servicioIntermedio?._id) {
            errores.push('El servicio es obligatorio.');
        }
        if (data?.fecha && data?.horaInicio && data?.horaFin) {
            const fecha = moment(data.fecha);
            const horaInicio = moment(data.horaInicio);
            const horaFin = moment(data.horaFin);
            if (!horaFin.isAfter(horaInicio)) {
                errores.push('La hora de fin tiene que ser posterior a la hora de inicio.');
            }
            if (!fecha.isSame(horaInicio, 'day') || !fecha.isSame(horaFin, 'day') || !horaInicio.isSame(horaFin, 'day')) {
                errores.push('La fecha, la hora de inicio y la hora de fin tienen que ser el mismo día.');
            }
        }
        return errores;
    }

    private combinarFechaHora(fecha, hora) {
        if (!fecha || !hora) {
            return null;
        }
        const base = moment(fecha);
        const momentoHora = moment(hora);
        if (!base.isValid() || !momentoHora.isValid()) {
            return null;
        }
        return base.clone().hour(momentoHora.hour()).minute(momentoHora.minute()).second(0).millisecond(0);
    }
}
