import moment from 'moment';
import { cache } from '@andes/shared';
import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

@Component({
    selector: 'app-desocupar-cama',
    templateUrl: 'desocupar-cama.component.html'
})
export class CamaDesocuparComponent implements OnInit, OnDestroy {
    camasDisponibles$: Observable<any>;

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();
    @Output() accionDesocupar: EventEmitter<any> = new EventEmitter<any>();

    public fecha: Date;
    public fechaFlag = true;
    public view: string;
    public cama: ISnapshot;
    public fechaMin;
    public fechaMax = moment().toDate();
    public mostrar;

    public inProgress = true;

    // Constructor
    constructor(
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
    ) { }

    ngOnDestroy() {

    }

    public historial$: Observable<any[]>;
    public movimientoEgreso$: Observable<ISnapshot>;
    public fechaMin$: Observable<Date>;
    public hayMovimientosAt$: Observable<boolean>;
    public camaDesocupada$: Observable<boolean>;
    public view$ = this.mapaCamasService.view;

    public camaSelectedSegunView$: Observable<ISnapshot> = this.mapaCamasService.camaSelectedSegunView$;

    public loading = false;

    ngOnInit() {
        const HOY = moment().toDate();
        this.inProgress = true;
        this.fecha = this.mapaCamasService.fecha;
        this.historial$ = this.mapaCamasService.fecha2.pipe(
            tap(() => this.inProgress = true),
            switchMap(fecha => {
                this.fecha = moment(fecha).toDate();
                return this.mapaCamasService.historial('internacion', fecha, HOY);
            }),
            map((movimientos) => {
                return movimientos.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            }),
            cache()
        );

        this.movimientoEgreso$ = this.historial$.pipe(
            map(movimientos => movimientos.find(m => m.estado !== 'ocupada'))
        );

        this.fechaMin$ = this.historial$.pipe(
            switchMap(movimientos => {
                if (movimientos.length) {
                    const fechaUltimoMovimiento = movimientos[movimientos.length - 1].fecha;
                    const fechaMasUnMinuto = moment(fechaUltimoMovimiento).add(1, 'm');
                    return of(fechaMasUnMinuto.toDate());
                } else {
                    return this.camaSelectedSegunView$.pipe(
                        map(cama => moment(cama?.fecha).add(1, 'm').toDate())
                    );
                }
            }),
            tap(() => this.inProgress = false),
        );

        this.hayMovimientosAt$ = combineLatest([
            this.mapaCamasService.fecha2,
            this.fechaMin$
        ]).pipe(
            map(([fechaElegida, fechaMinima]) => {
                return moment(fechaElegida).isBefore(moment(fechaMinima));
            })
        );

        // Se verifica que la cama que vamos a desocupar no se encuentre disponible.
        this.camaDesocupada$ = combineLatest([
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.snapshot$,
            this.historial$,
        ]).pipe(
            map(([selectedCama, snapshots, historial]) => {
                const historialPaciente = historial[historial.length - 1];
                const camaPaciente = (selectedCama.idCama) ? selectedCama : (historialPaciente) ? historialPaciente : null;
                if (camaPaciente) {
                    const cama = snapshots.find(snap => snap.idCama === camaPaciente.idCama);
                    return (cama.estado !== 'ocupada' || cama.idInternacion !== camaPaciente.idInternacion) && !cama.sala;
                }
            })
        );

        this.camasDisponibles$ = this.camaSelectedSegunView$.pipe(
            switchMap(cama => this.mapaCamasService.getCamasDisponibles(cama))
        );

        this.verificarFecha();

    }

    onType() {
        this.inProgress = true;
    }

    verificarFecha() {
        if (this.fecha) {
            this.mapaCamasService.setFecha(this.fecha);
        }
    }

    cambiarCama(cambiarUO: boolean) {
        this.accionDesocupar.emit({ cambiarUO });
    }

    egresarPaciente() {
        this.accionDesocupar.emit({ camasDisponibles: null, cama: this.cama, cambiarUO: null, egresar: 'egresarPaciente' });
    }

    disableCambiarCama(formReparada, camasDisponibles) {
        return formReparada.invalid || !this.permisosMapaCamasService.movimientos || !(camasDisponibles.camasMismaUO.length > 0) || this.inProgress;
    }

    disableCambiarUO(formReparada, camasDisponibles) {
        return formReparada.invalid || !this.permisosMapaCamasService.movimientos || !(camasDisponibles.camasDistintaUO.length > 0) || this.inProgress;
    }

    disableEgresarPaciente(formReparada) {
        return formReparada.invalid || !this.permisosMapaCamasService.egreso || this.inProgress;
    }
}
