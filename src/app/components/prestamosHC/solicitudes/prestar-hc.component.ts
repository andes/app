import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    private _carpeta: any;
    prestamo: any;

    @Output() cancelPrestarEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();

    @Input('prestar')
    set prestar(value: any) {
        this.prestamo = value;
        debugger;
        if (value && value.datosPrestamo && value.datosPrestamo.turno.profesional[0][0]) {
            if (value.datosPrestamo.turno.espacioFisico[0]) {
                this.prestarHC.destino = value.datosPrestamo.turno.espacioFisico[0].nombre;
            }

            this.prestarHC.responsable = value.datosPrestamo.turno.profesional[0][0].apellido + ', ' + value.datosPrestamo.turno.profesional[0][0].nombre;
        }

    }
    get prestar(): any {
        return this._carpeta;
    }

    prestarHC: any = {
        destino: '',
        responsable: '',
        observaciones: ''
    }

    ngOnInit() {

    }

    save(event) {
        event.idAgenda = this.prestamo.datosPrestamo.agendaId.id;
        event.idTurno = this.prestamo.datosPrestamo.turno.id;
        event.tipoPrestacion = this.prestamo.datosPrestamo.turno.conceptoTurneable[0];
        event.profesional = this.prestamo.datosPrestamo.turno.profesional[0][0];
        event.espacioFisico = this.prestamo.datosPrestamo.turno.espacioFisico;
        // this.prestarCarpeta(event);
        debugger;
        this.prestamosService.prestarCarpeta(event).subscribe(carpeta => {
            this._carpeta = carpeta;

            this.plex.alert('La Carpeta se prestó correctamente');

            this.cancelPrestarEmit.emit(false);
            // this.listaCarpetaEmit.emit(this._carpeta);
        });
    }

    cancel() {
        this.cancelPrestarEmit.emit(false);
    }

    constructor(public plex: Plex, public prestamosService: PrestamosService) {

    }
}
