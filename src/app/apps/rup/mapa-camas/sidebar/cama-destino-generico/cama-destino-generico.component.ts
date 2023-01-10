import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { Observable, Subscription, combineLatest, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-cama-destino-generico',
    templateUrl: 'cama-destino-generico.component.html',
})

export class CamaDestinoGenericoComponent implements OnInit, OnDestroy {
    @Input() relacion: any;
    @Output() onSave = new EventEmitter<any>();

    public fecha;
    public fechaMax = moment().toDate();
    public fechaMin;
    public selectedCama;
    public destino;
    public titulo: string;
    public disableGuardar$: Observable<Boolean> = of(true);
    public inProgress = true;
    public mensaje = '';

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.destino = this.relacion.destino;
        this.fecha = this.mapaCamasService.fecha;

        this.subscription = combineLatest([
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.snapshotFiltrado$,
        ]).subscribe(([cama, snap]) => {
            this.selectedCama = cama;
            this.fechaMin = this.fecha;
            const camaSnap = snap.find(c => c.id === cama.id); // la cama seleccionada durante la fecha seleccionada

            // Se verifican los estados actual y destino (Al cambiar la fecha puede haber cambiado el estado de la cama)
            const permiteAccion = camaSnap.estado === this.relacion.origen;
            if (!permiteAccion) {
                this.inProgress = false;
                this.disableGuardar$ = of(true);
                this.mensaje = `No se puede realizar esta acción ya que la cama se encuentra ${camaSnap.estado} en esta fecha.`;
                return;
            }

            if (camaSnap.estado === 'bloqueada') {
                this.fechaMin = moment(camaSnap.fecha).add(1, 'minutes');
                this.disableGuardar$ = this.mapaCamasService.historial('cama', this.fecha, null, camaSnap).pipe(
                    map(historial => {
                        this.inProgress = false;
                        // se permite el desbloqueo siempre que no se haya desbloqueado mas adelante
                        const permiteAccion = historial.length && !historial[0].extras?.desbloqueo;
                        if (!permiteAccion) {
                            this.mensaje = `No se puede realizar esta acción ya que la cama estará desbloqueada el ${moment(historial[0].fecha).format('DD/MM/YYYY [a las] hh:mm')}.`;
                        }
                        return !permiteAccion;
                    })
                );
            } else {
                if (this.destino === 'bloqueada') {
                    this.fechaMin = null; // se puede bloquear en el pasado
                }
                this.inProgress = false;
                this.disableGuardar$ = of(false);
            }
        });

        this.titulo = 'CAMBIAR A ' + this.destino.toUpperCase();
    }

    guardar(form) {
        if (form.formValid) {
            if (this.selectedCama) {
                this.selectedCama.extras = null;
                if (this.selectedCama.estado === 'bloqueada') {
                    this.selectedCama.observaciones = '';
                    this.selectedCama.extras = { desbloqueo: true };
                }
                // Se modifica el estado de la cama
                this.selectedCama.estado = this.destino;
                this.selectedCama.observaciones = ((typeof this.selectedCama.observaciones === 'string')) ? this.selectedCama.observaciones : (Object(this.selectedCama.observaciones).nombre);

                this.mapaCamasService.save(this.selectedCama, this.fecha).subscribe(() => {
                    this.plex.info('success', 'Cama ' + this.destino);
                    this.mapaCamasService.setFecha(this.fecha);
                    this.onSave.emit({ cama: this.selectedCama });
                }, (err1) => {
                    this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
                });
            }
        }
    }

    setFecha() {
        this.mapaCamasService.setFecha(this.fecha);
        this.inProgress = true;
        this.mensaje = '';
    }

    selectCama(cama: ISnapshot) {
        this.mapaCamasService.select(cama);
    }
}
