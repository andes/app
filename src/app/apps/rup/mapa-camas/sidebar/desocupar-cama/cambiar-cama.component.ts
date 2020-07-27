import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { Observable, combineLatest, Subscription, forkJoin } from 'rxjs';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { switchMap, take } from 'rxjs/operators';

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

    public camaSelectedSegunView$: Observable<ISnapshot> = this.mapaCamasService.camaSelectedSegunView$;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnDestroy() {

    }

    ngOnInit() {
        this.camasDisponibles$ = this.camaSelectedSegunView$.pipe(
            switchMap(cama => this.mapaCamasService.getCamasDisponibles(cama))
        );
    }

    guardar(valid) {
        if (valid.formValid) {
            combineLatest(
                this.mapaCamasService.fecha2,
                this.camaSelectedSegunView$
            ).pipe(
                take(1),
                switchMap(([fechaCambio, camaActual]) => {
                    this.fecha = fechaCambio;
                    return this.cambiarCama(camaActual, this.nuevaCama, fechaCambio);
                })
            ).subscribe(() => {
                const mensaje = (this.cambiarUO) ? 'Pase de unidad organizativa exitoso!' : 'Cambio de cama exitoso!';
                this.plex.info('success', mensaje);
                this.mapaCamasService.setFecha(this.fecha);
                this.onSave.emit();
            });
        }
    }

    cambiarCama(camaActual, camaNueva, fecha) {
        const camaDesocupada = {
            _id: camaActual.idCama,
            estado: 'disponible',
            idInternacion: null,
            paciente: null
        };
        const camaOcupada = {
            _id: camaNueva.idCama,
            estado: camaActual.estado,
            idInternacion: camaActual.idInternacion,
            paciente: camaActual.paciente,
            nota: camaActual.nota
        };

        if (this.cambiarUO) {
            camaOcupada['extras'] = {
                unidadOrganizativaOrigen: camaActual.unidadOrganizativa
            };
        }

        return forkJoin(
            this.mapaCamasService.save(camaOcupada, fecha),
            this.mapaCamasService.save(camaDesocupada, fecha)
        );
    }
}
