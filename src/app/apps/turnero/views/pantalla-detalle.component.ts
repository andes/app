import { Component, OnInit, OnDestroy, EventEmitter, Output, Input } from '@angular/core';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Unsubscribe } from '@andes/shared';
import { PantallaService } from '../services/pantalla.service';
import { EspacioFisicoService } from './../../../services/turnos/espacio-fisico.service';

@Component({
    selector: 'pantalla-detalle',
    templateUrl: 'pantalla-detalle.html'
})
export class PantallaDetalleComponent implements OnInit, OnDestroy {
    public espaciosFisicos = [];
    public turnero = false;
    public listaTipos = [];
    public esTurnero = false;

    @Output() ocultarDetalleEmmiter: EventEmitter<any> = new EventEmitter<any>();
    @Input() pantalla: any;

    constructor(
        public pantallasService: PantallaService,
        private _location: Location,
        private auth: Auth,
        private plex: Plex,
        public espacioFisicoService: EspacioFisicoService,
    ) { }

    get consultorios() {
        return this.pantalla.espaciosFisicos;
    }

    set consultorios(value) {
        this.pantalla.espaciosFisicos = value;
    }

    ngOnInit() {
        this.espacioFisicoService.get({ organizacion: this.auth.organizacion }).subscribe(data => this.espaciosFisicos = data);
        this.listaTipos = [{ id: 'totem', nombre: 'Totem' }, { id: 'turnero', nombre: 'Turnero' }];
        this.esTurnero = this.pantalla.tipo === 'turnero';
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

    changeTipo(event) {
        this.pantalla.tipo = event.value.id;
        if (this.pantalla.tipo === 'totem') {
            this.esTurnero = false;
        } else {
            this.esTurnero = true;
        }
    }

    back() {
        this.ocultarDetalleEmmiter.emit();
        this._location.back();
    }
}
