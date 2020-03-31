import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { Subscription, combineLatest, Observable, of } from 'rxjs';


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
    public fechaMax;
    public mostrar;

    private subscription: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;
    private subscription4: Subscription;

    // Constructor
    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
        if (this.subscription3) {
            this.subscription3.unsubscribe();
        }
        if (this.subscription4) {
            this.subscription4.unsubscribe();
        }
    }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama,
        ).subscribe(([view, capa, cama]) => {
            this.fecha = this.mapaCamasService.fecha;
            this.view = view;
            this.cama = cama;
            this.fechaMax = moment().toDate();
            if (capa === 'estadistica') {
                this.subscription2 = combineLatest(
                    this.mapaCamasService.prestacion$
                ).subscribe(([prestacion]) => {
                    this.fechaMin = prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
                    if (prestacion.ejecucion.registros[1] && prestacion.ejecucion.registros[1].valor) {
                        this.fecha = prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso;
                        this.fechaMax = this.fecha;
                    }

                    if (view === 'listado-internacion') {
                        const fechaIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
                        const fechaLimite = (prestacion.ejecucion.registros[1].valor) ? prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso : moment().toDate();
                        this.subscription3 = this.mapaCamasService.historial('internacion', fechaIngreso, fechaLimite, prestacion).subscribe(movimientos => {
                            this.fechaMin = movimientos[movimientos.length - 1].fecha;
                            this.fecha = this.fechaMin;
                            this.mapaCamasService.setFecha(this.fechaMin);
                            this.subscription4 = this.mapaCamasService.snapshot(this.fechaMin, prestacion.id).subscribe((snap) => {
                                this.cama = snap[0];
                                this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
                            });
                        });
                    } else {
                        this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
                    }
                });
            } else {
                this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
            }
        });
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
