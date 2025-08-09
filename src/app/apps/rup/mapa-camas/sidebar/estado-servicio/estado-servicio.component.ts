import moment from 'moment';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subscription, from } from 'rxjs';
import { map, tap, startWith, switchMap, filter, distinct, toArray } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { Plex } from '@andes/plex';

@Component({
    selector: 'app-estado-servicio',
    templateUrl: './estado-servicio.component.html',
    styleUrls: ['./estado-servicio.component.scss'],
})

export class EstadoServicioComponent implements OnInit, OnDestroy {
    fechaActual$: Observable<Date>;
    fecha$: Observable<Date>;
    total: number;
    camasXEstado: any = {};

    private sub: Subscription;
    public editaFecha = false;
    public fecha: Date;
    public puedeGuardar;

    salas$: Observable<ISnapshot[]>;
    salasPaciente$: Observable<ISnapshot[]>;

    constructor(
        public mapaCamasService: MapaCamasService,
        private plex: Plex
    ) { }

    ngOnInit() {
        this.fecha$ = this.mapaCamasService.fecha2;

        this.fechaActual$ = this.mapaCamasService.fechaActual$.pipe(
            startWith(moment().toDate())
        );

        this.sub = this.mapaCamasService.snapshotFiltrado$.pipe(
            map(camas => camas.filter(c => !c.sala && c.estado !== 'inactiva')),
            tap((snapshot) => {
                this.total = snapshot.length;
                this.camasXEstado = this.groupBy(snapshot, 'estado');
            })
        ).subscribe();

        this.salas$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            switchMap((camas) => {
                return from(camas).pipe(
                    filter(c => c.sala),
                    distinct(c => c.id),
                    toArray()
                );
            })
        );

        this.salasPaciente$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            switchMap((camas) => {
                return from(camas).pipe(
                    filter(c => c.sala && !!c.paciente),
                    toArray()
                );
            })
        );
    }

    ngOnDestroy() {
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }


    groupBy(xs: ISnapshot[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    setFecha(fechaActual) {
        this.mapaCamasService.setFecha(fechaActual);
    }

    editarFecha() {
        this.fecha = moment().toDate();
        this.editaFecha = !this.editaFecha;
        this.puedeGuardar = true;
    }

    guardar() {
        this.mapaCamasService.setFecha(this.fecha);
        this.editaFecha = !this.editaFecha;
        this.puedeGuardar = false;
        this.plex.toast('success', 'Fecha editada exitosamente');
    }

    cancelar() {
        this.fecha = moment().toDate();
        this.editaFecha = !this.editaFecha;
    }

    onChange(fecha) {
        this.fecha = fecha;
    }
}
