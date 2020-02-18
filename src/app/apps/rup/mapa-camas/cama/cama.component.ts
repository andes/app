import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { MapaCamasService } from '../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { SnomedService, SnomedExpression } from '../../../mitos';
import * as moment from 'moment';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public expr = SnomedExpression;

    public ambito: string;
    public capa: string;
    public fecha = moment().toDate();
    public organizacion: any;
    public unidadesOrganizativas: any;
    public unidadOrganizativa = null;
    public sectores: any[] = [];
    public nuevaCama = true;
    public cama: any;
    public camaAux: any;
    public estado: any;


    constructor(
        public authService: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        private mapaCamasService: MapaCamasService,
    ) {

    }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;
        this.capa = this.mapaCamasService.capa;

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Cama'
        }]);

        this.getOrganizacion();
        this.getCama();
    }

    getOrganizacion() {
        this.organizacionService.getById(this.authService.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.sectores = this.organizacionService.getFlatTree(this.organizacion);
            this.unidadesOrganizativas = this.organizacion.unidadesOrganizativas;
        });
    }

    getCama() {
        this.route.paramMap.subscribe(params => {
            if (params.get('id')) {
                let idCama = params.get('id');
                this.mapaCamasService.get(this.fecha, idCama)
                    .subscribe(cama => {
                        this.cama = cama;
                        this.camaAux = cama;
                        this.getEstadosCama(cama);
                    });
            } else {
                this.cama = {};
            }
        });
    }

    getEstadosCama(cama) {

    }

    save() {
        this.mapaCamasService.save(this.cama, this.fecha).subscribe(response => {
            if (response) {
                this.router.navigate(['/internacion/mapa-camas']);
            } else {
                this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
            }
        });
    }

    darBaja() {
        this.cama.estado = 'inactiva';

        this.plex.confirm('¿Dar de baja la cama "' + this.cama.nombre + '"?', '¿Desea dar de baja?').then(confirmacion => {
            if (confirmacion) {
                this.mapaCamasService.save(this.cama, this.fecha).subscribe(response => {
                    if (response) {
                        this.plex.info('', 'La cama fue dada de baja');
                        this.router.navigate(['/internacion/mapa-camas']);
                    } else {
                        this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                    }
                });
            }
        });
    }

}
