import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { SalaComunService } from './sala-comun.service';
import { ActivatedRoute } from '@angular/router';
import { ISalaComun } from '../../interfaces/ISalaComun';
import { Observable } from 'rxjs';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { cache } from '@andes/shared';
import { map, pluck } from 'rxjs/operators';
import { SnomedExpression } from '../../../../mitos';
import { IOrganizacion } from '../../../../../interfaces/IOrganizacion';

@Component({
    selector: 'app-sala-comun',
    templateUrl: './sala-comun.component.html',
})

export class SalaComunComponent implements OnInit {
    public expr = SnomedExpression;

    public sectores$: Observable<any[]>;
    public mapaSectores$: Observable<any[]>;
    public unidadesOrganizativas$: Observable<any[]>;
    public organizacion$: Observable<any>;
    public organizacion;
    public salaComun: ISalaComun = {
        id: null,
        nombre: null,
        organizacion: null,
        unidadOrganizativas: null,
        ambito: null,
        estado: null,
        sectores: null,
    };

    public puedeEliminar = false;
    public puedeEditar = true;
    public disabled = false;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private location: Location,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        private mapaCamasService: MapaCamasService,
        private salaComunService: SalaComunService,
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: this.mapaCamasService.ambito
        }, {
            name: 'Sala Comun'
        }]);

        this.organizacion = this.auth.organizacion;
        this.getOrganizacion();
        this.getSala();
    }

    getOrganizacion() {
        this.organizacion$ = this.organizacionService.getById(this.auth.organizacion.id).pipe(
            cache()
        );
        this.sectores$ = this.organizacion$.pipe(
            map(organizacion => {
                return this.organizacionService.getSectoresNombreCompleto(organizacion);
            })
        );
        this.mapaSectores$ = this.organizacion$.pipe(pluck('mapaSectores'));
        this.unidadesOrganizativas$ = this.organizacion$.pipe(pluck('unidadesOrganizativas'));
    }

    getSala() {
        const id = this.route.snapshot.params.id;
        if (id) {
            if (!this.auth.check('internacion:sala:edit')) {
                this.puedeEditar = false;
            }
            if (this.auth.check('internacion:sala:delete')) {
                this.puedeEliminar = true;
            }
            this.salaComunService.get(id).subscribe(salaComun => {
                this.salaComun = salaComun;
            });
        } else {
            if (!this.auth.check('internacion:sala:create')) {
                this.puedeEditar = false;
            }
            this.salaComun.capacidad = null;
        }
    }

    save(valid) {
        if (!valid.formValid) {
            this.plex.info('danger', 'Revisar los datos ingresados');
            return;
        }
        this.disabled = true;
        this.salaComunService.save(this.organizacion, this.salaComun).subscribe(salaComun => {
            this.disabled = false;
            this.plex.info('success', 'La sala fue guardada exitosamente', 'Sala guardada!');
            this.volver();
        });
    }

    onSectorSelect($event, organizacion) {
        if ($event.value) {
            this.salaComun.sectores = this.organizacionService.getRuta(organizacion, $event.value);
        } else {
            this.salaComun.sectores = null;

        }
    }

    volver() {
        this.location.back();
    }
}
