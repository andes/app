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

    private subs: Subscription[] = [];
    public editaFecha = false;
    public fecha: Date;
    public puedeGuardar;
    public esEstadistica = false;

    salas$: Observable<ISnapshot[]>;
    salasPaciente$: Observable<ISnapshot[]>;
    mostrarTodasCamas = false;

    constructor(
        public mapaCamasService: MapaCamasService,
        private plex: Plex
    ) { }
    filtro: any = {};
    ngOnInit() {
        this.subs.push(
            this.mapaCamasService.censableSelected.subscribe(censable => {
                this.filtro.censable = censable;
            }),
            this.mapaCamasService.capa2.subscribe(capa => {
                this.esEstadistica = ['estadistica', 'estadistica-v2'].includes(capa);
            }),
            this.mapaCamasService.mostrarTodasCamas.subscribe(valor => {
                this.mostrarTodasCamas = valor;
            }),
            this.mapaCamasService.snapshotFiltrado$.pipe(
                map(camas => camas.filter(c => !c.sala && c.estado !== 'inactiva')),
                tap((snapshot) => {
                    this.total = snapshot.length;
                    this.camasXEstado = this.groupBy(snapshot, 'estado');
                })
            ).subscribe()
        );

        this.fecha$ = this.mapaCamasService.fecha2;

        this.fechaActual$ = this.mapaCamasService.fechaActual$.pipe(
            startWith(moment().toDate())
        );

        this.salas$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            switchMap((camas) =>
                from(camas).pipe(
                    filter(c => c.sala),
                    distinct(c => c.id),
                    toArray()
                )
            )
        );

        this.salasPaciente$ = this.mapaCamasService.snapshotFiltrado$.pipe(
            switchMap((camas) =>
                from(camas).pipe(
                    filter(c => c.sala && !!c.paciente),
                    toArray()
                )
            )
        );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
        setTimeout(() => {
            this.mapaCamasService.mostrarTodasCamas.next(false);
        });
    }

    filtrar() {
        this.mapaCamasService.esCensable.next(
            this.filtro?.censable?.id ?? (this.mostrarTodasCamas ? null : 1)
        );
    }

    toggleMostrarTodasCamas() {
        if (this.mostrarTodasCamas) {
            this.filtro.censable = null;
            this.mapaCamasService.censableSelected.next(null);
        }
        this.mapaCamasService.mostrarTodasCamas.next(this.mostrarTodasCamas);
        this.filtrar();
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
