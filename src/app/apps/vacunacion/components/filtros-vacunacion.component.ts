import { Component, OnInit } from '@angular/core';
import { Observable, empty } from 'rxjs';
import { InscripcionService } from '../services/inscripcion.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { Auth } from '@andes/auth';

@Component({
    selector: 'filtros-vacunacion',
    templateUrl: './filtros-vacunacion.html'
})

export class FiltrosVacunacionComponent implements OnInit {

    public filtro: any = {};
    public localidades$: Observable<ILocalidad[]>;
    public gruposPoblacionales$: Observable<any[]>;
    public hoy = moment().toDate();
    private idNeuquenProv = '57f3f3aacebd681cc2014c53';

    constructor(
        private inscripcionService: InscripcionService,
        private localidadService: LocalidadService,
        private gruposService: GrupoPoblacionalService,
        private auth: Auth
    ) { }

    ngOnInit() {
        this.localidades$ = this.localidadService.getXProvincia(this.idNeuquenProv);
        const gruposHabilitados = this.auth.getPermissions('vacunacion:tipoGrupos:?');
        if (gruposHabilitados.length) {
            if (gruposHabilitados.length === 1 && gruposHabilitados[0] === '*') {
                this.gruposPoblacionales$ = this.gruposService.search({});
            } else {
                this.gruposPoblacionales$ = this.gruposService.search({ ids: gruposHabilitados });
            }
        } else {
            this.gruposPoblacionales$ = empty();
        }
    }

    filtrar() {
        this.inscripcionService.lastResults.next(null);
        if (this.filtro.grupo) {
            this.inscripcionService.gruposSelected.next([this.filtro.grupo.nombre]);
        } else {
            this.gruposPoblacionales$.subscribe(grupos => {
                this.inscripcionService.gruposSelected.next(
                    grupos.map(grupo => grupo.nombre));
            });
        }
        this.inscripcionService.documentoText.next(this.filtro.documento);
        this.inscripcionService.localidadSelected.next(this.filtro.localidad);
        this.inscripcionService.fechaDesde.next(this.filtro.fechaDesde);
        this.inscripcionService.fechaHasta.next(this.filtro.fechaHasta);
        this.inscripcionService.tieneCertificado.next(this.filtro.tieneCertificado);
    }
}
