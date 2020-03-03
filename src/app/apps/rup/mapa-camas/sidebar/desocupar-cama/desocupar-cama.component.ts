import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { Subscription, combineLatest, Observable } from 'rxjs';


@Component({
    selector: 'app-desocupar-cama',
    templateUrl: 'desocupar-cama.component.html'
})
export class CamaDesocuparComponent implements OnInit, OnDestroy {
    camasDisponibles$: Observable<{ camasMismaUO, camasDistintaUO }>;
    view$: Observable<string>;

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();
    @Output() accionDesocupar: EventEmitter<any> = new EventEmitter<any>();

    public fecha: Date;
    public fechaFlag = true;
    public cama: ISnapshot;
    public fechaMin;
    public fechaMax;
    public mostrar;

    private subscription: Subscription;
    private subscription2: Subscription;

    // Constructor
    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.subscription2) {
            this.subscription2.unsubscribe();
        }
    }

    ngOnInit() {
        this.view$ = this.mapaCamasService.view;
        this.subscription = combineLatest(
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$
        ).subscribe(([cama, prestacion]) => {
            this.cama = cama;
            this.fecha = moment().toDate();
            this.fechaMax = moment().toDate();
            if (prestacion) {
                this.fechaMin = prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
                this.fecha = this.fechaMin;
                if (prestacion.ejecucion.registros[1] && prestacion.ejecucion.registros[1].valor) {
                    this.fecha = prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso;
                    this.fechaMax = this.fecha;
                }
            }

            if (cama.idCama) {
                this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
            } else {
                this.mapaCamasService.setFecha(this.fechaMin);
                this.subscription2 = this.mapaCamasService.snapshot(this.fechaMin, prestacion.id).subscribe((snap) => {
                    this.cama = snap[0];
                    this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
                });
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
