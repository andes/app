import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { SnomedService } from 'src/app/apps/mitos';
import { ServicioIntermedioService } from 'src/app/modules/rup/services/servicio-intermedio.service';
import { ReglaService } from 'src/app/services/top/reglas.service';

@Component({
    selector: 'servicio-intermedio-crud',
    templateUrl: './servicio-intermedio-crud.component.html'
})
export class ServicioIntermedioCRUDComponent implements OnInit {

    public origenTodas = false;
    public origenDescendientes = false;
    public destinoDescendientes = false;
    public regla = {
        id: null,
        origen: {
            organizacion: null,
            prestaciones: null
        },
        destino: {
            servicioIntermedio: null,
            organizacion: null,
            prestaciones: null,
            agendas: null
        }
    };

    constructor(
        private snomedService: SnomedService,
        private reglasService: ReglaService,
        private route: ActivatedRoute,
        private servicioIntermedioService: ServicioIntermedioService,
        private location: Location,
        private plex: Plex
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.regla.id = id;
            this.reglasService.getById(id).subscribe((regla) => {
                this.regla.origen.organizacion = regla.origen.organizacion;
                if (!regla.origen.prestaciones) {
                    this.origenTodas = true;
                } else {
                    this.regla.origen.prestaciones = regla.origen.prestaciones.map(p => p.prestacion)[0];
                }
                this.regla.destino.organizacion = regla.destino.organizacion;
                this.regla.destino.agendas = regla.destino.agendas;
                this.servicioIntermedioService.getAll().subscribe(servicios => {
                    const servicio = servicios.find(s => s.id === regla.destino.servicioIntermedioId);
                    this.regla.destino.servicioIntermedio = servicio;
                });
                if (regla.destino.query) {
                    this.destinoDescendientes = true;
                }
                this.regla.destino.prestaciones = regla.destino.prestacion[0];

            });
        }
    }

    onSave() {

        const requestOrigen = !this.origenTodas && this.origenDescendientes
            ? this.snomedService.getQuery({ expression: `<<${this.regla.origen.prestaciones.conceptId}` })
            : of([this.regla.origen.prestaciones]);
        const requestDestino = this.destinoDescendientes
            ? this.snomedService.getQuery({ expression: `<<${this.regla.destino.prestaciones.conceptId}` })
            : of([this.regla.destino.prestaciones]);

        forkJoin([
            requestOrigen,
            requestDestino
        ]).subscribe(([prestacionesOrigen, prestacionesDestino]) => {
            const modelo: any = {
                id: this.regla.id,
                origen: {},
                destino: {}
            };

            modelo.origen.organizacion = this.regla.origen.organizacion;
            if (!this.origenTodas) {
                if (this.origenDescendientes) {
                    modelo.origen.query = `<<${this.regla.origen.prestaciones.conceptId}`;
                }
                modelo.origen.prestaciones = prestacionesOrigen.map(p => ({
                    auditable: false,
                    prestacion: p
                }));

            } else {
                modelo.origen.prestaciones = null;
            }

            modelo.destino.organizacion = this.regla.destino.organizacion;
            modelo.destino.prestacion = prestacionesDestino;
            modelo.destino.inicio = 'servicio-intermedio';
            modelo.destino.servicioIntermedioId = this.regla.destino.servicioIntermedio.id;
            modelo.destino.turneable = false;
            if (this.destinoDescendientes) {
                modelo.destino.query = `<<${this.regla.destino.prestaciones.conceptId}`;
            }
            modelo.destino.informe = 'none';
            modelo.destino.agendas = this.regla.destino.agendas;

            this.reglasService.saveRaw(modelo).subscribe(() => {
                this.plex.toast('success', 'Regla creada exitosamente!');
                this.location.back();
            });

        });

    }

    onVolverClick() {
        this.location.back();
    }
}
