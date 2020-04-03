import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../services/mapa-camas.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy {
    puedeDesocupar$: Observable<any>;
    prestacion: IPrestacion;
    view: string;

    @Output() cambiarCama = new EventEmitter<any>();
    @ViewChild(PlexOptionsComponent, { static: false }) plexOptions: PlexOptionsComponent;

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
    ]

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
            this.mapaCamasService.view,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$,
        ).subscribe(([view, cama, prestacion]) => {
            this.view = view;
            this.items = [
                { key: 'ingreso', label: 'INGRESO' },
                { key: 'movimientos', label: 'MOVIMIENTOS' },
                { key: 'egreso', label: 'EGRESO' }
            ];

            if (prestacion) {
                this.prestacion = prestacion;
                if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                    this.editar = false;
                    this.prestacionValidada = true;
                } else {
                    this.prestacionValidada = false;
                }

                if (prestacion.ejecucion.registros[1] && prestacion.ejecucion.registros[1].valor && prestacion.ejecucion.registros[1].valor.InformeEgreso) {
                    this.existeEgreso = true;
                } else {
                    this.existeEgreso = false;

                    if (!this.permisoIngreso) {
                        this.items.pop();
                    }
                }

                if (!this.mostrar) {
                    this.activatedOption('ingreso');
                }
            } else {
                this.editar = false;
                this.mostrar = null;
            }
        });
    }

    onActiveOption(opcion) {
        this.mostrar = opcion;
    }

    activatedOption(opcion) {
        this.mostrar = opcion;
        this.plexOptions.activate(opcion);
    }

    changeCama() {
        this.cambiarCama.emit();
    }

    toggleEdit() {
        this.editar = !this.editar;
    }
}
