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
    public disableButton = false;

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
            this.disableButton = true;
            combineLatest(
                this.mapaCamasService.fecha2,
                this.camaSelectedSegunView$
            ).pipe(
                take(1),
                switchMap(([fechaCambio, camaActual]) => {
                    this.fecha = fechaCambio;
                    return this.cambiarCama(camaActual, this.nuevaCama, fechaCambio);
                })
            ).subscribe(
                () => {
                    const mensaje = (this.cambiarUO) ? 'Pase de unidad organizativa exitoso!' : 'Cambio de cama exitoso!';
                    this.plex.info('success', mensaje);
                    this.mapaCamasService.setFecha(this.fecha);
                    this.onSave.emit();
                    this.disableButton = false;
                }, err => {
                    const mensaje = (this.cambiarUO) ? 'pase de unidad organizativa.' : 'cambio de cama.';
                    this.plex.info('warning', '', `Ocurrió un error durante el ${mensaje}`);
                    this.disableButton = false;
                });
        }
    }

    cambiarCama(camaActual, camaNueva, fecha) {
        let camaDesocupada = {
            _id: camaActual.id,
            estado: 'disponible',
            idInternacion: null,
            paciente: null,
            sala: camaActual.sala,
        };

        let camaOcupada = {
            _id: camaNueva.id,
            estado: camaActual.estado,
            idInternacion: camaActual.idInternacion,
            paciente: camaActual.paciente,
            nota: (!camaActual.sala) ? camaActual.nota : null,
            sala: camaNueva.sala,
        };

        if (camaActual.sala) {
            camaDesocupada = camaActual;
            camaDesocupada.estado = 'disponible';
        }

        if (camaNueva.sala) {
            camaOcupada = camaNueva;
            camaOcupada.estado = 'ocupada';
            camaOcupada.paciente = camaActual.paciente;
            camaOcupada.idInternacion = camaActual.idInternacion;
        }
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
