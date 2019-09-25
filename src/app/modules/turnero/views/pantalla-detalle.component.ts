import { Component, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { PantallaService } from '../services/pantalla.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';

@Component({
    templateUrl: 'pantalla-detalle.html'
})
export class PantallaDetalleComponent implements OnInit, OnDestroy {
    public espaciosFisicos = [];
    private sub = null;
    private id;

    public nuevaPantalla = {
        nombre: '',
        espaciosFisicos: []
    };

    constructor(
        public pantallasService: PantallaService,
        private route: ActivatedRoute,
        private _location: Location,
        private auth: Auth
    ) { }

    get pantalla() {
        return this.id ? this.pantallasService.selected : this.nuevaPantalla;
    }

    get consultorios() {
        return this.pantalla.espaciosFisicos;
    }

    set consultorios(value) {
        this.pantalla.espaciosFisicos = value;
    }

    ngOnInit() {
        this.pantallasService.getEspacios({ organizacion: this.auth.organizacion.id }).subscribe((data) => {
            this.espaciosFisicos = data;
        });
        this.id = this.route.snapshot.params['id'];

        // uso setImmediate por un detalle de angular.
        setImmediate(() => {
            this.pantallasService.select(this.id);
        });

        this.sub = this.route.params.subscribe(params => {
            setImmediate(() => {
                this.pantallasService.select(params['id']);
            });
        });
    }

    ngOnDestroy() {
        this.pantallasService.select(null);
        this.sub.unsubscribe();
    }

    guardar() {
        this.pantallasService.save(this.pantalla).subscribe(() => {
            this._location.back();
        });
    }

    cancelar() {
        this._location.back();
    }
}
