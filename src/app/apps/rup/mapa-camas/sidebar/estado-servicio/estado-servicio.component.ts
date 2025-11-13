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
    public esEstadistica = false;

    collapse = false;

    salas$: Observable<ISnapshot[]>;
    salasPaciente$: Observable<ISnapshot[]>;
    mostrarTodasCamas: any;

    constructor(
        public mapaCamasService: MapaCamasService,
        private plex: Plex
    ) { }
    filtro: any = {};
    ngOnInit() {
        this.mapaCamasService.censableSelected.subscribe(censable => {
            this.filtro.censable = censable;
        });
        // para controlar los filtros
        this.mapaCamasService.capa2.subscribe(capa => {
            this.esEstadistica = capa === 'estadistica';
        });
        this.mapaCamasService.mostrarTodasCamas.subscribe(valor => {
            this.mostrarTodasCamas = valor;
            this.filtrar();
        });
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
        if (this.sub) {
            this.sub.unsubscribe();
        }
    }

    filtrar() {
        const censableId = this.filtro?.censable?.id ?? null;
        this.mapaCamasService.esCensable.next(
            censableId ?? (this.mostrarTodasCamas ? null : 1)
        );
    }

    onCensableChange() {
        if (this.filtro.censable?.id === 0) {
            this.mostrarTodasCamas = true;
        } else {
            this.mostrarTodasCamas = false;
        }
        this.filtrar();
    }

    colapsar() {
        this.collapse = !this.collapse;
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
