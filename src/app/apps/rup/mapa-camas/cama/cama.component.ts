import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../services/organizacion.service';
import { MapaCamasService } from '../mapa-camas.service';
import { Plex } from '@andes/plex';
import { SnomedService } from '../../../../services/term/snomed.service';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
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
        private router: Router,
        private snomed: SnomedService,
        private plex: Plex,
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
                console.log('ID CAMA: ', idCama);
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
        if (this.cama._id) {
            this.mapaCamasService.patchCama(this.cama, this.ambito, this.capa).subscribe(response => {

            });
        } else {
            this.mapaCamasService.storeCama(this.cama, this.ambito, this.capa).subscribe(response => {

            });
        }

    }

    loadTipoDeCama($event) {
        this.snomed.getQuery({ expression: '^2051000013106' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadEquipamientos($event) {
        this.snomed.getQuery({ expression: '^2061000013108' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadEspecialidades($event) {
        this.snomed.getQuery({ expression: '<<394733009' }).subscribe(result => {
            $event.callback(result);
        });
    }

    loadGenero($event) {
        this.snomed.getQuery({ expression: '703118005 OR 703117000' }).subscribe(result => {
            $event.callback(result);
        });
    }
}
