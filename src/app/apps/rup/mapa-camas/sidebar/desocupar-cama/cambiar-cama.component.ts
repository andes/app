import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObjectID } from 'bson';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { map, retry, switchMap, take } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';

@Component({
    selector: 'app-cambiar-cama',
    templateUrl: './cambiar-cama.component.html',
})

export class CambiarCamaComponent implements OnInit {
    camasDisponibles$: Observable<{ camasMismaUO; camasDistintaUO }>;
    selectedCama$: Observable<ISnapshot>;

    // EVENTOS
    @Input() cambiarUO = null;
    @Output() onSave = new EventEmitter<any>();

    // VARIABLES
    public nuevaCama: ISnapshot;
    public disableButton = false;

    public camaSelectedSegunView$: Observable<ISnapshot> = this.mapaCamasService.camaSelectedSegunView$;
    public salaPases$: Observable<any>;
    public camasParaPases$: Observable<ISnapshot[]>;
    public paseConfig = false;
    public allowCama = false;
    public selectCama = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        combineLatest([
            this.mapaCamasService.maquinaDeEstado$,
            this.camaSelectedSegunView$
        ]).pipe(take(1)).subscribe(([maquinaEstados, camaActual]) => {
            this.camasDisponibles$ = this.camaSelectedSegunView$.pipe(
                switchMap(cama => this.mapaCamasService.getCamasDisponibles(cama))
            );

            this.salaPases$ = of({});

            if (maquinaEstados.configPases && maquinaEstados.configPases.allowCama) {
                this.allowCama = true;
            }

            if (maquinaEstados.configPases && maquinaEstados.configPases.sala) {
                if (maquinaEstados.configPases.sala !== camaActual.id) {
                    this.paseConfig = true;
                    this.salaPases$ = this.camasDisponibles$.pipe(
                        map(cama => {
                            const sala = cama.camasDistintaUO.filter((c: ISnapshot) => c.sala && c.id === maquinaEstados.configPases.sala)[0];
                            return sala;
                        })
                    );

                    this.camasParaPases$ = combineLatest([
                        this.camasDisponibles$,
                        this.salaPases$,
                    ]).pipe(
                        map(([camasDisp, sala]) => {
                            return camasDisp.camasDistintaUO.filter((c: ISnapshot) => c.id !== sala.id);
                        })
                    );
                }
            }
        });
    }

    guardar(valid) {
        if (valid.formValid) {
            this.disableButton = true;
            combineLatest(
                this.mapaCamasService.fecha2,
                this.camaSelectedSegunView$,
                this.salaPases$,
            ).pipe(
                take(1),
                switchMap(([fechaCambio, camaActual, salaPases]) => {
                    const proximaCama = this.nuevaCama || salaPases;
                    return this.cambiarCama(camaActual, proximaCama, fechaCambio);
                })
            ).subscribe(
                camas => {
                    const mensaje = (this.cambiarUO) ? 'Pase de unidad organizativa exitoso!' : 'Cambio de cama exitoso!';
                    this.plex.info('success', mensaje);
                    this.mapaCamasService.setFecha(moment().toDate()); // para que actualice el snapshot al momento luego del cambio
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
        const idMov = new ObjectID().toString();
        let camaDesocupada: any = {
            _id: camaActual.id,
            estado: 'disponible',
            idInternacion: null,
            paciente: null,
            fechaIngreso: null,
            sala: camaActual.sala,
            extras: {
                idMovimiento: idMov,
                cambioDeCama: true
            }
        };

        let camaOcupada: any = {
            _id: camaNueva.id,
            estado: camaActual.estado,
            idInternacion: camaActual.idInternacion,
            paciente: camaActual.paciente,
            fechaIngreso: camaActual.fechaIngreso,
            nota: (!camaActual.sala) ? camaActual.nota : null,
            sala: camaNueva.sala,
            extras: {
                idMovimiento: idMov,
                cambioDeCama: true
            }
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
                unidadOrganizativaOrigen: camaActual.unidadOrganizativa,
                idMovimiento: idMov,
                cambioDeCama: true
            };
        }
        return forkJoin(
            this.mapaCamasService.save(camaOcupada, fecha).pipe(retry(3)),
            this.mapaCamasService.save(camaDesocupada, fecha).pipe(retry(3))
        );
    }
}
