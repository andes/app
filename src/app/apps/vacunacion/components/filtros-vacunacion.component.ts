import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { InscripcionService } from '../services/inscripcion.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'filtros-vacunacion',
    templateUrl: './filtros-vacunacion.html'
})

export class FiltrosVacunacionComponent implements OnInit {

    public filtro: any = {};
    public localidades$: Observable<ILocalidad[]>;
    public gruposPoblacionales$: Observable<any[]>;
    private idNeuquenProv = '57f3f3aacebd681cc2014c53';

    @Input() filtroGrupos: String[];  // grupos poblacionales que puede visualizar el usuario

    constructor(
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        private gruposService: GrupoPoblacionalService
    ) { }

    ngOnInit() {
        this.localidades$ = this.localidadService.getXProvincia(this.idNeuquenProv);
        // filtra por los grupos permitidos para el usuario
        this.gruposPoblacionales$ = this.gruposService.search().pipe(
            map(grupos => {
                if (this.filtroGrupos?.length) {
                    grupos = grupos.filter(g => this.filtroGrupos.some(gv => gv === g.nombre));
                }
                return grupos;
            })
        );
    }

    filtrar() {
        this.inscripcionService.lastResults.next(null);
        this.inscripcionService.grupoSelected.next(this.filtro.grupo);
        this.inscripcionService.documentoText.next(this.filtro.documento);
        this.inscripcionService.localidadSelected.next(this.filtro.localidad);
    }
}
