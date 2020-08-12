import { Input, Component, OnInit } from '@angular/core';

@Component({
    selector: 'historial-solicitud',
    templateUrl: './historialSolicitud.html'
})
export class HistorialSolicitudComponent {
    turno;
    prestacion;
    itemsHistorial = [];

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
            .map( (e) => ({
                descripcion: e.tipo ? e.tipo : e.accion,
                observaciones: e.observaciones,
                createdAt: e.createdAt,
                createdBy: e.createdBy
            }))
            // filtramos registros con 'asignacionProfesional' ya este estado viene en los estados y el historial, y se duplica
            .filter(e => e.descripcion !== 'asignacionProfesional');


        let salidaEstados = {
            auditoria: 'Creada',
            asignada: 'Asignada',
            pendiente: 'Aceptada',
            ejecucion: 'Ejecutada',
            validada: 'Validada',
            asignacionTurno: 'Turno Asignado',
            liberacionTurno: 'Turno Liberado',
            rechazada: 'Contrarreferida',
            anulada: 'Anulada',
            referencia: 'Referida',
            devolver: 'Devuelta'
        };

        this.itemsHistorial.forEach(e => e.descripcion = salidaEstados[e.descripcion]);
    }
}
