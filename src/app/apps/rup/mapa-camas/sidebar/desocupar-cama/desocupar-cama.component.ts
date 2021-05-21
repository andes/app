import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, map, tap } from 'rxjs/operators';
import { cache } from '@andes/shared';
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
    public hayMovimientosAt$: Observable<Boolean>;
    public camaOcupada$: Observable<Boolean>;
    public view$ = this.mapaCamasService.view;

    public camaSelectedSegunView$: Observable<ISnapshot> = this.mapaCamasService.camaSelectedSegunView$;


    ngOnInit() {
        const HOY = moment().toDate();

        this.historial$ = this.mapaCamasService.fecha2.pipe(
            switchMap((fecha) => {
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
                    return of(fechaMasUnMinuto);
                } else {
                    return this.camaSelectedSegunView$.pipe(
                        map(cama => moment(cama?.fecha).add(1, 'm'))
                    );
                }
            }),
        );

        this.hayMovimientosAt$ = combineLatest(
            this.mapaCamasService.fecha2,
            this.fechaMin$
        ).pipe(
            map(([fechaElegida, fechaMinima]) => {
                return moment(fechaElegida).isBefore(moment(fechaMinima));
            })
        );

        this.camaOcupada$ = combineLatest(
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.snapshot$,
        ).pipe(
            tap(() => this.inProgress = false),
            map(([selectedCama, snapshots]) => {
                const cama = snapshots.find(snap => snap.idCama === selectedCama.idCama);
                return cama.estado !== 'ocupada' && !cama.sala;
            })
        );

        this.camasDisponibles$ = this.camaSelectedSegunView$.pipe(
            switchMap(cama => this.mapaCamasService.getCamasDisponibles(cama))
        );


    }

    onType() {
        this.inProgress = true;
    }

    verificarFecha() {
        this.mapaCamasService.setFecha(this.fecha);
    }

    cambiarCama(cambiarUO: boolean) {
        this.accionDesocupar.emit({ cambiarUO });
    }

    egresarPaciente() {
        this.accionDesocupar.emit({ camasDisponibles: null, cama: this.cama, cambiarUO: null, egresar: 'egresarPaciente' });
    }
}
