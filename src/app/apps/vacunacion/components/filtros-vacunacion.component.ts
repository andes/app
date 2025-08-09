import moment from 'moment';
import { Auth } from '@andes/auth';
import { cache } from '@andes/shared';
import { Component, OnInit } from '@angular/core';
import { empty, Observable } from 'rxjs';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import { InscripcionService } from '../services/inscripcion.service';

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
                this.gruposPoblacionales$ = this.gruposService.search({}).pipe(cache());
            } else {
                this.gruposPoblacionales$ = this.gruposService.search({ ids: gruposHabilitados }).pipe(cache());
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
        if (this.filtro.paciente?.length >= 3) {
            this.inscripcionService.pacienteText.next(this.filtro.paciente);
        } else {
            this.inscripcionService.pacienteText.next(null);
        }
        this.inscripcionService.localidadSelected.next(this.filtro.localidad);
        if (moment(this.filtro.fechaDesde).isValid()) {
            this.inscripcionService.fechaDesde.next(this.filtro.fechaDesde);
        }
        if (moment(this.filtro.fechaHasta).isValid()) {
            this.inscripcionService.fechaHasta.next(this.filtro.fechaHasta);
        }
        this.inscripcionService.tieneCertificado.next(this.filtro.tieneCertificado);
    }
}
