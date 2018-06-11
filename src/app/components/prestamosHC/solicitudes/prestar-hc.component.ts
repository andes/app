import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PrestamosService } from '../../../services/prestamosHC/prestamos-hc.service';
import { Plex } from '@andes/plex';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-prestar-hc',
    templateUrl: './prestar-hc.component.html'
})

export class PrestarHcComponent implements OnInit {
    private _carpeta: any;
    prestamo: any;

    @Output() cancelPrestarEmit: EventEmitter<Boolean> = new EventEmitter<Boolean>();
    @Output() carpetaPrestadaEmit: EventEmitter<any> = new EventEmitter<any>();

    @Input('prestar')
    set prestar(value: any) {
        this.prestamo = value;
        let _prestarHC: any = {
            destino: '',
            responsable: '',
            observaciones: ''
        };
        if (value && value.datosPrestamo && value.datosPrestamo.turno.profesionales) {

            if (value.datosPrestamo.turno.espacioFisico) {
                _prestarHC.destino = value.datosPrestamo.turno.espacioFisico.nombre;
            }

            _prestarHC.responsable = '';
            value.datosPrestamo.turno.profesionales.forEach(profesional => {
                _prestarHC.responsable += profesional.apellido + ', ' + profesional.nombre + ' - ';
            });
            _prestarHC.responsable = _prestarHC.responsable.substring(0, _prestarHC.responsable.length - 3);

            if (value.datosPrestamo.observaciones) {
                _prestarHC.observaciones = value.datosPrestamo.observaciones;
            }
        } else if (value && value.datosSolicitudManual && value.datosSolicitudManual) {
            if (value.datosSolicitudManual.espacioFisico) {
                _prestarHC.destino = value.datosSolicitudManual.espacioFisico.nombre;
            }
            if (value.datosSolicitudManual.profesional) {
                _prestarHC.responsable = value.datosSolicitudManual.profesional.apellido + ', ' + value.datosSolicitudManual.profesional.nombre;
            }
            if (value.datosSolicitudManual.observaciones) {
                _prestarHC.observaciones = value.datosSolicitudManual.observaciones;
            }
        }
        this.prestarHC = _prestarHC;
    }

    get prestar(): any {
        return this._carpeta;
    }

    prestarHC: any = {
        destino: '',
        responsable: '',
        observaciones: ''
    };

    constructor(
        public plex: Plex,
        public prestamosService: PrestamosService,
        public auth: Auth) {
    }

    ngOnInit() {

    }

    save(event) {
        this.prestamo.organizacion = this.auth.organizacion;
        this.prestamo.datosSolicitudManual.observaciones = this.prestarHC.observaciones;
        this.prestamo.datosPrestamo = { observaciones: this.prestarHC.observaciones };
        this.prestamosService.prestarCarpeta(this.prestamo).subscribe(carpeta => {
            this._carpeta = carpeta;
            this.plex.toast('success', 'La Carpeta se prestó correctamente', 'Información', 1000);
            this.cancelPrestarEmit.emit(true);
            this.carpetaPrestadaEmit.emit(this._carpeta);
        });
    }

    cancel() {
        this.cancelPrestarEmit.emit(false);
    }
}

