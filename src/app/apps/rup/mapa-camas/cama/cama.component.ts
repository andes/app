import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { MapaCamasService } from '../mapa-camas.service';
import { Plex } from '@andes/plex';
import { SnomedService, SnomedExpression } from '../../../mitos';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public expr = SnomedExpression;

    public ambito = 'internacion';
    public capa: string;
    public fecha = moment().toDate();
    public organizacion: any;
    public unidadesOrganizativas: any;
    public unidadOrganizativa = null;
    public sectores: any[] = [];
    public nuevaCama = true;
    public cama: any;
    public estado: any;


    constructor(
        public authService: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Cama'
        }]);



        this.organizacionService.getById(this.authService.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.sectores = this.organizacionService.getFlatTree(this.organizacion);

            this.unidadesOrganizativas = this.organizacion.unidadesOrganizativas;
        });

        this.route.paramMap.subscribe(params => {
            this.capa = params.get('capa');
            if (params.get('id')) {
                let idCama = params.get('id');
                this.mapaCamasService.getCama(this.ambito, this.capa, this.fecha, idCama)
                    .subscribe(cama => {
                        this.cama = cama;
                    });
            } else {
                this.cama = {};
            }
        });
    }

    save() {
        this.mapaCamasService.patchCama(this.cama, this.ambito, this.capa, this.fecha).subscribe(response => {
            if (response) {
                this.router.navigate(['/internacion/mapa-camas']);
            } else {
                this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
            }
        });
    }

}
