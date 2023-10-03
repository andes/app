import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ObjectID } from 'bson';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { map, retry, switchMap, take } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';

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
    @Output() onCancel = new EventEmitter<any>();

    // VARIABLES
    public nuevaCama: ISnapshot;
    public disableSaveButton = false;
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
        private camasHttp: MapaCamasHTTP
    ) { }

    ngOnInit() {
        /*  Setea los observables camasDisponibles, salaPases y camasParaPases que determinan si se puede realizar
            el movimiento segun cada caso
        */
        combineLatest([
            this.mapaCamasService.maquinaDeEstado$,
            this.camaSelectedSegunView$
        ]).pipe(
            take(1),
            map(([maquinaEstados, camaActual]) => {
                this.camasDisponibles$ = this.camaSelectedSegunView$.pipe(
                    switchMap(cama => this.mapaCamasService.getCamasDisponibles(cama))
                );

                this.salaPases$ = of({});

                if (maquinaEstados.configPases && maquinaEstados.configPases.allowCama) {
                    this.allowCama = true;
                }

                if (maquinaEstados.configPases && maquinaEstados.configPases.sala) { // hasta el 09/23 no hay efectores con esta configuracion
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
            })
        ).subscribe();
    }


    guardar(valid) {
        if (valid.formValid) {
            this.disableSaveButton = true;
            const fechaCambio = moment(this.mapaCamasService.fecha).toDate();
            const capa = this.mapaCamasService.capa;

            this.camaSelectedSegunView$.pipe(
                take(1),
                switchMap(camaActual => {
                    const refreshCamaActual$ = this.camasHttp.snapshot('internacion', capa, fechaCambio, null, null, camaActual.id);
                    const refreshNuevaCama$ = this.camasHttp.snapshot('internacion', capa, fechaCambio, null, null, this.nuevaCama.id);
                    const refreshHistorial$ = this.nuevaCama.sala ? of(null) : this.camasHttp.historial('internacion', capa, fechaCambio, moment(fechaCambio).add(1, 'day').toDate(), this.nuevaCama.id);

                    /*  Se vuelve a consultar para obtener los ultimos estados reales de las camas ya que podrían haber
                        nuevos movimientos intermedios producto de un mapa de camas desactualizado (Tiempo sin interaccion
                        por parte del usuario) habiendose ocupado la cama destino o movido el paciente que está seleccionado
                        actualmente (movimiento realizado por otro usuario en el ultimo periodo de tiempo).
                    */
                    return forkJoin([
                        refreshCamaActual$,
                        this.salaPases$,
                        refreshNuevaCama$,
                        refreshHistorial$
                    ]);
                }),
                switchMap(([snapCamaActual, salaPase, snapNuevaCama, historialNuevaCama]) => {
                    // si hay fechas en el futuro las filtramos
                    const camaActual = snapCamaActual.filter(cama => moment(cama.fecha).isBefore(fechaCambio))[0];
                    const nuevaCama = snapNuevaCama.filter(cama => moment(cama.fecha).isBefore(fechaCambio))[0];
                    historialNuevaCama = historialNuevaCama.filter(mov => mov.estado === 'ocupada');

                    if ((camaActual.sala || camaActual.estado === 'ocupada') && (nuevaCama.sala || nuevaCama.estado === 'disponible')) {
                        if (historialNuevaCama.length) { // cama destino tiene movimientos en las prox 24 hs?
                            const fechaConflicto = moment(historialNuevaCama[0].fecha);
                            /*  llegado a este punto se sabe que la cama destino puede ser ocupada pero solo temporalmente, ya que tiene
                                un movimiento poco tiempo mas adelante. Por tanto se advierte al usuario y se consulta si desea ocuparla
                                de todas formas. Para esto, la siguiente promesa (con el subscribe interno) es inevitable ya que el plex.confirm
                                funciona con promesas y es el único modo de que el pipe espere la respuesta del usuario para continuar.
                            */
                            return new Promise(resolve => {
                                this.plex.confirm(`La cama destino está disponible hasta el día ${fechaConflicto.format('DD/MM/YYYY')} a las ${fechaConflicto.format('HH:mm')}. ¿Desea continuar con el movimiento?`, 'Aviso').then(
                                    respuesta => {
                                        if (respuesta) {
                                            // se realiza cambio
                                            return this.cambiarCama(camaActual, nuevaCama, fechaCambio).subscribe(camas => resolve(camas));
                                        }
                                        this.onCancel.emit();
                                        return resolve(null);
                                    });
                            });
                        } else {
                            // se realiza cambio sin advertencias
                            return this.cambiarCama(camaActual, nuevaCama, fechaCambio);
                        }
                    } else {
                        const accion = (this.cambiarUO) ? 'pase de unidad organizativa' : 'cambio de cama';
                        if (camaActual.estado === 'disponible') {
                            this.plex.info('warning', `No es posible realizar el ${accion} ya que el paciente fué removido de la cama ${camaActual.nombre}.`, 'Atención');
                        } else if (nuevaCama.estado === 'ocupada') {
                            this.plex.info('warning', `No es posible realizar el ${accion} ya que la cama ${nuevaCama.nombre} se encuentra ocupada.`, 'Atención');
                        }
                        this.onCancel.emit();
                        return of(null);
                    }
                })
            ).subscribe((camas: any[]) => {
                if (camas) { // return de cambiarCama
                    const mensaje = (this.cambiarUO) ? 'Pase de unidad organizativa exitoso!' : 'Cambio de cama exitoso!';
                    this.plex.info('success', mensaje);
                    this.mapaCamasService.setFecha(this.mapaCamasService.fecha); // para que actualice el snapshot al momento luego del cambio
                    this.onSave.emit();
                } else {
                    this.mapaCamasService.setFecha(this.mapaCamasService.fecha);
                    this.disableSaveButton = false;
                }
            }, () => { // error
                const mensaje = (this.cambiarUO) ? 'pase de unidad organizativa.' : 'cambio de cama.';
                this.plex.info('warning', '', `Ocurrió un error durante el ${mensaje}`);
                this.disableSaveButton = false;
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
        return forkJoin([
            this.mapaCamasService.save(camaOcupada, fecha).pipe(retry(3)),
            this.mapaCamasService.save(camaDesocupada, fecha).pipe(retry(3))
        ]);
    }
}
