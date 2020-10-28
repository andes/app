import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { Observable, Subscription, combineLatest } from 'rxjs';
import * as moment from 'moment';

@Component({
    selector: 'app-cama-destino-generico',
    templateUrl: 'cama-destino-generico.component.html',
})

export class CamaDestinoGenericoComponent implements OnInit, OnDestroy {
    camas$: Observable<ISnapshot[]>;
    selectedCama$: Observable<ISnapshot>;

    @Input() relacion: any;
    @Input() listaMotivosBloqueo: any[];

    @Output() onSave = new EventEmitter<any>();

    public fecha;
    public fechaMax = moment().toDate();
    public selectedCama;
    public capa;
    public destino;
    public titulo: string;

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        public mapaCamasService: MapaCamasService
    ) {

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.destino = this.relacion.destino;
        this.fecha = this.mapaCamasService.fecha;

        this.subscription = combineLatest(
            this.mapaCamasService.capa,
            this.mapaCamasService.selectedCama,
        ).subscribe(([capa, cama]) => {
            this.capa = capa;
            this.selectedCama = cama;
        });

        this.titulo = 'CAMBIAR A ' + this.destino.toUpperCase();
    }

    guardar(form) {
        if (form.formValid) {
            if (this.selectedCama) {
                if (this.selectedCama.estado === 'bloqueada') {
                    this.selectedCama.observaciones = '';
                }
                // Se modifica el estado de la cama
                this.selectedCama.estado = this.destino;
                this.selectedCama.observaciones = ((typeof this.selectedCama.observaciones === 'string')) ? this.selectedCama.observaciones : (Object(this.selectedCama.observaciones).nombre);

                this.mapaCamasService.save(this.selectedCama, this.fecha).subscribe(camaActualizada => {
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
    }

    selectCama(cama: ISnapshot) {
        this.mapaCamasService.select(cama);
    }
}
