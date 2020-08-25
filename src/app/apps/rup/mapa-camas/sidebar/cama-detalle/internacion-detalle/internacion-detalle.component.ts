import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy, ContentChild, AfterContentInit, AfterViewInit } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy {
    puedeDesocupar$: Observable<any>;
    prestacion: IPrestacion;
    view$ = this.mapaCamasService.view;

    @Output() cambiarCama = new EventEmitter<any>();
    @Output() accion = new EventEmitter<any>();

    @ContentChild(PlexOptionsComponent, { static: true }) plexOptions: PlexOptionsComponent;

    public editar = false;
    public existeEgreso = false;
    public prestacionValidada = false;
    public mostrar;
    public permisoIngreso = false;
    public permisoMovimiento = false;
    public permisoEgreso = false;
    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];

    private subscription: Subscription;

    constructor(
        private auth: Auth,
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


    ngOnInit() {
        this.mostrar = 'ingreso';
        this.permisoIngreso = this.auth.check('internacion:ingreso');
        this.permisoMovimiento = this.auth.check('internacion:movimientos');
        this.permisoEgreso = this.auth.check('internacion:egreso');
        this.subscription = combineLatest(
            this.mapaCamasService.capa2,
            this.mapaCamasService.prestacion$,
        ).subscribe(([capa, prestacion]) => {
            if (capa !== 'estadistica') {
                this.items = [
                    { key: 'movimientos', label: 'MOVIMIENTOS' },
                    { key: 'registros', label: 'REGISTROS' }
                ];
                this.mostrar = 'movimientos';
                return;
            }
            if (!prestacion) { return; }
            this.items = [
                { key: 'ingreso', label: 'INGRESO' },
                { key: 'movimientos', label: 'MOVIMIENTOS' },
                { key: 'registros', label: 'REGISTROS' },
                { key: 'egreso', label: 'EGRESO' }
            ];


            this.prestacion = prestacion;
            if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                this.editar = false;
                this.prestacionValidada = true;
            } else {
                this.prestacionValidada = false;
            }
        });
    }

    onActiveOption(opcion) {
        this.mapaCamasService.resetView();
        this.mostrar = opcion;
    }

    activatedOption(opcion) {
        this.mostrar = opcion;
        this.plexOptions.activate(opcion);
    }

    changeCama() {
        this.cambiarCama.emit();
    }

    onAccion($event) {
        if ($event) {
            this.accion.emit($event);
        } else {
            this.mostrar = this.items[0].key;
        }
    }

    toggleEdit() {
        this.editar = !this.editar;
    }
}
