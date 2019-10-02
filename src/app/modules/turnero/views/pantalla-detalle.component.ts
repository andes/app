import { Plex } from '@andes/plex';
import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { PantallaService } from '../services/pantalla.service';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Unsubscribe } from '@andes/shared';

@Component({
    selector: 'pantalla-detalle',
    templateUrl: 'pantalla-detalle.html'
})
export class PantallaDetalleComponent implements OnInit, OnDestroy {
    public espaciosFisicos = [];

    @Output() ocultarDetalleEmmiter: EventEmitter<any> = new EventEmitter<any>();
    @Input() pantalla: any;

    constructor(
        public pantallasService: PantallaService,
        private _location: Location,
        private auth: Auth,
        private plex: Plex
    ) { }

    get consultorios() {
        return this.pantalla.espaciosFisicos;
    }

    set consultorios(value) {
        this.pantalla.espaciosFisicos = value;
    }

    ngOnInit() {
        this.pantallasService.getEspacios({ organizacion: this.auth.organizacion.id }).subscribe(data => this.espaciosFisicos = data);
    }

    ngOnDestroy() {
    }

    @Unsubscribe()
    guardar() {
        return this.pantallasService.save(this.pantalla).subscribe(() => {
            this.plex.toast('success', 'Pantalla guardada correctamente', 'Pantalla guardada', 100);
            this.back();
        });
    }

    back() {
        this.ocultarDetalleEmmiter.emit();
        this._location.back();
    }
}
