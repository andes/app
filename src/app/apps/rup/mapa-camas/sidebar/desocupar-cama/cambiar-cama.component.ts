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
    public fechaMin: Date;
    public cama: ISnapshot;
    public nuevaCama: ISnapshot;

    private subscription: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;

    constructor(
        public auth: Auth,
        private plex: Plex,
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
    }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$,
        ).subscribe(([cama, prestacion]) => {
            if (!cama.idCama) {
                const fechaIngreso = prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
                if (prestacion.ejecucion.registros[1]) {
                    const fechaLimite = (prestacion.ejecucion.registros[1].valor) ? prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso : moment().toDate();
                    this.subscription2 = this.mapaCamasService.historial('internacion', fechaIngreso, fechaLimite, prestacion).subscribe(movimientos => {
                        this.fechaMin = movimientos[movimientos.length - 1].fecha;
                        this.mapaCamasService.setFecha(this.fechaMin);
                        this.subscription3 = this.mapaCamasService.snapshot(this.fechaMin, prestacion.id).subscribe((snap) => {
                            this.cama = snap[0];
                            this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(this.cama);
                        });
                    });
                }
            } else {
                this.cama = cama;
                this.camasDisponibles$ = this.mapaCamasService.getCamasDisponibles(cama);
            }
            this.fecha = this.mapaCamasService.fecha;
        });
    }

    guardar(valid) {
        if (valid.formValid) {
            const camaDesocupada = {
                _id: this.cama.idCama,
                estado: 'disponible',
                idInternacion: null,
                paciente: null
            };
            const camaOcupada = {
                _id: this.nuevaCama.idCama,
                estado: this.cama.estado,
                idInternacion: this.cama.idInternacion,
                paciente: this.cama.paciente
            };
            this.mapaCamasService.save(camaOcupada, this.fecha).subscribe(camaActualizada => {
                this.mapaCamasService.save(camaDesocupada, this.fecha).subscribe(camaSeleccionada => {
                    this.plex.info('success', 'Cambio de cama exitoso!');
                    this.mapaCamasService.setFecha(this.fecha);
                    this.onSave.emit();
                });
            });
        }
    }
}
