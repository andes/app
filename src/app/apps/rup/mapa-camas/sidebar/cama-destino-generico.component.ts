import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { ISnapshot } from '../interfaces/ISnapshot';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-cama-destino-generico',
    templateUrl: 'cama-destino-generico.component.html',
})

export class CamaDestinoGenericoComponent implements OnInit, OnDestroy {
    camas$: Observable<ISnapshot[]>;
    selectedCama$: Observable<ISnapshot>;

    @Input() destino: any;
    @Output() onSave = new EventEmitter<any>();

    public fecha: Date = moment().toDate();
    public fechaMax: Date = moment().toDate();
    public selectedCama;
    public capa;
    public titulo: string;

    private subscription: Subscription;

    constructor(
        private plex: Plex,
        private mapaCamasService: MapaCamasService
    ) {

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.capa,
            this.mapaCamasService.selectedCama,
        ).subscribe(([capa, cama]) => {
            this.capa = capa;
            this.selectedCama = cama;
        });

        this.titulo = 'CAMBIAR A ' + this.destino.toUpperCase();

        this.camas$ = this.mapaCamasService.snapshot$.pipe(
            map((snapshot) => {
                return snapshot.filter(snap => snap.estado === 'disponible');
            })
        );
    }

    guardar() {
        if (this.selectedCama) {
            // Se modifica el estado de la cama
            this.selectedCama.estado = this.destino;

            this.mapaCamasService.save(this.selectedCama, this.fecha).subscribe(camaActualizada => {
                this.plex.info('success', 'Cama ' + this.destino);
                this.mapaCamasService.setFecha(this.fecha);
                this.onSave.emit({ cama: this.selectedCama });
            }, (err1) => {
                this.plex.info('danger', err1, 'Error al intentar ocupar la cama');
            });
        }
    }

    setFecha() {
        this.mapaCamasService.setFecha(this.fecha);
    }

    selectCama(cama: ISnapshot) {
        this.mapaCamasService.select(cama);
    }
}
