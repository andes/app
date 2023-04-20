import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { forkJoin } from 'rxjs';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { first, map, pluck } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-prestar-devolver-recurso',
    templateUrl: 'prestar-devolver-recurso.component.html'
})

export class PrestarDevolverRecursoComponent implements OnInit {
    @Input() accion;
    @Output() onSave = new EventEmitter<any>();
    @ViewChild('formPrestarDevolver', { static: false }) formulario: NgForm;

    public unidadesOrganizativas$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
        pluck('unidadesOrganizativas'),
        map(unidadesOrganizativas => unidadesOrganizativas.filter(uo => uo.id !== (this.cama.unidadOrganizativa as any)._id))
    );

    public fechaDesde;
    public fechaHasta;
    public maxFechaDesde; // para prestamos en el pasado que afecten movimientos, se asigna un maximo de dias (rangoMaxPrestamo)
    public prestamoConDevolucion = false; // prestamo en el pasado, que puede afectar movimientos existentes
    public rangoMaxPrestamo = 15; // sssi es prestamoConDevolucion: máximo (dias) permitidos entre fechaDesde y fechaHasta
    public movimientosIntermedios = 0; // sssi es prestamoConDevolucion: cantidad de movimientos afectados entre fecha desde y hasta
    public maxMovimientosIntermediosPermitidos = 10;
    public selectedUnidadOrganizativa;
    public ambito: string;
    public cama: ISnapshot;
    public inProgress = false;
    public accionPermitida = false;
    private esOrganizacionV2: boolean; // true si usa capas unificadas
    public mensajeError = '';

    constructor(
        public auth: Auth,
        private plex: Plex,
        public mapaCamasService: MapaCamasService,
        public organizacionService: OrganizacionService,
        private camasHTTP: MapaCamasHTTP
    ) { }

    get disabledGuardar() {
        return this.formulario?.invalid || (this.accion === 'prestar' && !this.selectedUnidadOrganizativa) ||
            this.inProgress || !this.accionPermitida;
    }

    ngOnInit() {
        this.fechaDesde = this.mapaCamasService.fecha2.getValue();
        this.ambito = this.mapaCamasService.ambito2.getValue();
        this.mapaCamasService.camaSelectedSegunView$.pipe(first()).subscribe((cama) => {
            this.cama = cama;
            this.onDesdeChange();
        });
    }

    onType() {
        this.inProgress = true;
    }

    onDesdeChange() {
        if (!this.fechaDesde) {
            return;
        }
        this.inProgress = true;
        this.accionPermitida = false;
        this.maxFechaDesde = moment(this.fechaDesde).add(this.rangoMaxPrestamo, 'days').endOf('day');

        forkJoin([
            this.camasHTTP.snapshot(this.ambito, 'estadistica', this.fechaDesde, null, null, this.cama.id).pipe(
                map(snapshots => snapshots[0])
            ),
            this.camasHTTP.snapshot(this.ambito, 'medica', this.fechaDesde, null, null, this.cama.id).pipe(
                map(snapshots => snapshots[0])
            ),
            this.organizacionService.usaCapasUnificadas(this.auth.organizacion.id),
            this.camasHTTP.historial('internacion', 'estadistica', this.fechaDesde, moment(), { idCama: this.cama.id }),
            this.camasHTTP.historial('internacion', 'medica', this.fechaDesde, moment(), { idCama: this.cama.id })
        ]).subscribe(([estadistica, medica, organizacionV2, historialEstadistica, historialMedica]) => {
            this.inProgress = false;
            this.esOrganizacionV2 = organizacionV2;
            /**
             *  Si no usa capas unificadas debe controlarse que la cama este disponible esa fecha en ambas capas
             *  ya que solo se puede prestar una cama ocupada en efectores que usen capas unificadas
             */
            const camasDisponibles = organizacionV2 ? true : estadistica.estado === 'disponible' && medica.estado === 'disponible';

            if (camasDisponibles) {
                // se verifica si existen movimientos a futuro en la cama en ambas capas, de ser asi se habilita el campo fechaHasta
                this.movimientosIntermedios = historialEstadistica.length + historialMedica.length;
                this.prestamoConDevolucion = this.movimientosIntermedios > 0;
                if (this.prestamoConDevolucion && this.fechaHasta) {
                    // deben refrescarse los controles de fechaHasta
                    this.onHastaChange();
                } else {
                    this.accionPermitida = true;
                }
            } else {
                this.accionPermitida = false;
                this.mensajeError = 'El recurso seleccionado no se encuentra disponible en la fecha de préstamo ingresada.';
            }
        });
    }

    onHastaChange() {
        if (!this.fechaHasta) {
            return;
        }
        this.inProgress = true;
        forkJoin([
            this.camasHTTP.historial('internacion', 'estadistica', this.fechaDesde, this.fechaHasta, { idCama: this.cama.id }),
            this.camasHTTP.historial('internacion', 'medica', this.fechaDesde, this.fechaHasta, { idCama: this.cama.id })
        ]).subscribe(([historialEstadistica, historialMedica]) => {
            this.inProgress = false;
            this.movimientosIntermedios = historialEstadistica.length + historialMedica.length;
            this.accionPermitida = false;
            const ultimoMovEstadistica = historialEstadistica[historialEstadistica.length - 1];
            const ultimoMovMedica = historialMedica[historialMedica.length - 1];
            const prestamoDevolucionExistente = historialEstadistica.concat(historialMedica).some(mov => mov.extras.prestamo || mov.extras.devolucion);

            if (this.movimientosIntermedios > this.maxMovimientosIntermediosPermitidos) {
                this.mensajeError = 'Hay demasiados movimientos entre las fechas seleccionadas. Intente ingresando un rango de fechas menor.';
            } else if (prestamoDevolucionExistente) {
                this.mensajeError = 'Existe al menos un préstamo/devolución del recurso entre las fechas ingresadas.';
            } else if (ultimoMovEstadistica && ultimoMovEstadistica.estado === 'ocupada'
                || ultimoMovMedica && ultimoMovMedica.estado === 'ocupada' && !this.esOrganizacionV2) {
                this.mensajeError = 'El recurso seleccionado no se encuentra disponible en la fecha de devolución ingresada.';
            } else {
                this.mensajeError = '';
                this.accionPermitida = true;
            }
        });
    }

    guardar(cama) {
        if (!this.accionPermitida) {
            return;
        }
        this.inProgress = true;
        let data;
        if (this.prestamoConDevolucion) {
            data = {
                _id: this.cama.id,
                op: 'prestamo-devolucion',
                desde: this.fechaDesde,
                hasta: this.fechaHasta,
                movimientosIntermedios: this.movimientosIntermedios > 0, // true si hay que actualizar UO de movimientos entre fechas
                prestamo: {
                    esMovimiento: true,
                    estado: cama.estado,
                    unidadOrganizativa: this.selectedUnidadOrganizativa,
                    extras: { prestamo: true }
                },
                devolucion: {
                    esMovimiento: true,
                    estado: cama.estado,
                    unidadOrganizativa: cama.unidadOrganizativaOriginal,
                    extras: { devolucion: true }
                }
            };
        } else {
            data = {
                _id: this.cama.id,
                esMovimiento: true,
                estado: cama.estado,
                unidadOrganizativa: (this.accion === 'devolver') ? cama.unidadOrganizativaOriginal : this.selectedUnidadOrganizativa,
                extras: (this.accion === 'devolver') ? { devolucion: true } : { prestamo: true }
            };
        }

        let saveRequest;
        if (this.esOrganizacionV2) { // Para organizaciones-v2 solo deberia modificar capa médica
            saveRequest = this.camasHTTP.updateEstados(this.ambito, 'medica', this.fechaDesde, data);
        } else {
            saveRequest = forkJoin([
                this.camasHTTP.updateEstados(this.ambito, 'estadistica', this.fechaDesde, data),
                this.camasHTTP.updateEstados(this.ambito, 'medica', this.fechaDesde, data)
            ]);
        }
        saveRequest.subscribe(() => {
            this.inProgress = false;
            const title = this.accion === 'prestar' ? 'Recurso prestado' : 'Recurso devuelto';
            const body = this.prestamoConDevolucion ? `El recurso fue préstado a  <b>${data.prestamo.unidadOrganizativa.term}</b> el 
                ${moment(this.fechaDesde).format('DD/MM/YYYY hh:mm')} y devuelto a  <b>${cama.unidadOrganizativaOriginal.term}</b> 
                el ${moment(this.fechaHasta).format('DD/MM/YYYY hh:mm')}` : `El recurso ahora se encuentra en <b>${data.unidadOrganizativa.term}</b>`;
            this.plex.info('success', body, title);
            this.onSave.emit();
            this.mapaCamasService.setFecha(this.fechaDesde);
        });
    }
}
