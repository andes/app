import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { InscripcionService } from '../services/inscripcion.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';

@Component({
    selector: 'filtros-vacunacion',
    templateUrl: './filtros-vacunacion.html'
})

export class FiltrosVacunacionComponent implements OnInit {

    public filtro: any = {};
    public localidades$: Observable<ILocalidad[]>;
    public gruposPoblacionales$: Observable<any[]>;
    private idNeuquenProv = '57f3f3aacebd681cc2014c53';

    constructor(
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        private gruposService: GrupoPoblacionalService
    ) { }

    ngOnInit() {
        this.localidades$ = this.localidadService.getXProvincia(this.idNeuquenProv);
        this.gruposPoblacionales$ = this.gruposService.search();
    }

    filtrar() {
        this.inscripcionService.lastResults.next(null);
        this.inscripcionService.grupoSelected.next(this.filtro.grupo);
        this.inscripcionService.documentoText.next(this.filtro.documento);
        this.inscripcionService.localidadSelected.next(this.filtro.localidad);
    }
}
