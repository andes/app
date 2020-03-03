import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-cambiar-cama',
    templateUrl: './cambiar-cama.component.html',
})

export class CambiarCamaComponent implements OnInit, OnDestroy {
    camasDisponibles$: Observable<{ camasMismaUO, camasDistintaUO }>;
    selectedCama$: Observable<ISnapshot>;

    // EVENTOS
    @Input() cambiarUO = null;
    @Output() onSave = new EventEmitter<any>();

    // VARIABLES
    public fecha: Date;
    public cama: ISnapshot;
    public nuevaCama: ISnapshot;
    private subscription: Subscription;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.selectedCama,
        ).subscribe(([cama]) => {
            this.cama = cama;
            this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(cama);
            this.fecha = this.mapaCamasService.fecha;

        });
    }

    guardar(valid) {
        if (valid.formValid) {
            this.nuevaCama.estado = this.cama.estado;
            this.nuevaCama.idInternacion = this.cama.idInternacion;
            this.nuevaCama.paciente = this.cama.paciente;

            this.mapaCamasService.save(this.nuevaCama, this.fecha).subscribe(camaActualizada => {
                this.cama.estado = 'disponible';
                this.cama.idInternacion = null;
                this.cama.paciente = null;

                this.mapaCamasService.save(this.cama, this.fecha).subscribe(camaSeleccionada => {
                    this.plex.info('success', 'Cambio de cama exitoso!');
                    this.mapaCamasService.setFecha(this.fecha);
                    this.onSave.emit();
                });
            });
        }
    }
}
