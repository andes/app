import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'historial-solicitud',
    templateUrl: './historialSolicitud.html'
})
export class HistorialSolicitudComponent {
    turno;
    prestacion;
    itemsHistorial = [];

    salidaEstados = {
        auditoria: 'Creada',
        asignacionProfesional: 'Asignada',
        pendiente: 'Aceptada',
        ejecucion: 'Ejecutada',
        validada: 'Validada',
        asignacionTurno: 'Turno Asignado',
        liberacionTurno: 'Turno Liberado',
        rechazada: 'Contrarreferida',
        anulada: 'Anulada',
        referencia: 'Referida'
    };

    @Input('prestacion')
    set _prestacion(value) {
        this.prestacion = value;
        this.cargarItemsHistorial();

    }
    @Input('turno')
    set _turno(value) {
        this.turno = value;
        this.cargarItemsHistorial();

    }

    cargarItemsHistorial() {
        let historial = this.prestacion.solicitud.historial;
        if (!historial) {
            historial = [];
        }

        let dacionTurno = [];
        if (this.turno && this.turno.fechaHoraDacion && this.turno.usuarioDacion) {
            dacionTurno.push({
                accion: 'asignacionTurno',
                observaciones: this.turno.nota,
                createdAt: this.turno.fechaHoraDacion,
                createdBy: this.turno.usuarioDacion
            });
        }
        this.itemsHistorial = [...this.prestacion.estados, ...historial, ...dacionTurno]
            .sort( (a, b) => moment(b.createdAt).diff(moment(a.createdAt)))
            .map( (e) => {
                let reg: any = {
                    descripcion: e.tipo ? e.tipo : e.accion,
                    observaciones: e.observaciones,
                    createdAt: e.createdAt,
                    createdBy: e.createdBy
                };

                if (e.tipoPrestacion) {
                    reg.tipoPrestacion = e.tipoPrestacion;
                }
                if (e.profesional) {
                    reg.profesional = e.profesional;
                }
                if (e.organizacion) {
                    reg.organizacion = e.organizacion;
                }
                return reg;
            })
            // filtramos registros con 'asignacionProfesional' ya este estado viene en los estados y el historial, y se duplica
            .filter((e: any) => e.descripcion !== 'asignada');

        this.itemsHistorial.forEach(e => e.descripcion = this.salidaEstados[e.descripcion]);
    }
}
