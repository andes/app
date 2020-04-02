import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { OrganizacionService } from '../../../../../services/organizacion.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Plex } from '@andes/plex';
import { SnomedExpression } from '../../../../mitos';
import * as moment from 'moment';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { TouchSequence } from 'selenium-webdriver';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public expr = SnomedExpression;

    public ambito: string;
    public capa: string;
    public fecha: Date;
    public organizacion: any;
    public sectores: any[] = [];
    public cama: any;
    public camaSnap: ISnapshot;
    public infoCama = {};
    public capas = [
        'estadistica',
        'medica',
        'enfermeria'
    ];

    constructor(
        public authService: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        private mapaCamasService: MapaCamasService,
        private camasHTTP: MapaCamasHTTP,
        private location: Location,
    ) {

    }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;
        this.capa = this.mapaCamasService.capa;
        this.fecha = moment().toDate();

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

            for (const capa of this.capas) {
                this.infoCama[capa] = [];
                this.camasHTTP.getMaquinaEstados(this.ambito, capa, organizacion.id).subscribe(maquinaEstados => {
                    this.infoCama[capa][0] = maquinaEstados;
                });
            }
        });
    }

    getCama() {
        this.route.paramMap.subscribe(params => {
            if (params.get('id')) {
                let idCama = params.get('id');
                this.mapaCamasService.get(this.fecha, idCama).subscribe(cama => {
                    this.cama = cama;
                });

                for (const capa of this.capas) {
                    this.infoCama[capa] = [];
                    this.camasHTTP.snapshot(this.ambito, capa, this.fecha, null, null, idCama).subscribe(snap => {
                        this.infoCama[capa][1] = snap[0];

                        if (this.capa === capa && snap[0].estado === 'disponible') {
                            this.camaSnap = snap[0];
                        }
                    });
                }

            } else {
                this.cama = {
                    esCensable: true
                };
            }
        });
    }

    save() {
        const esMovimiento = !this.cama._id;
        this.mapaCamasService.save(this.cama, this.fecha, esMovimiento).subscribe(response => {
            if (response) {
                this.router.navigate(['/internacion/mapa-camas']);
            } else {
                this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
            }
        });
    }

    darBaja() {
        this.plex.confirm('¿Dar de baja la cama "' + this.cama.nombre + '"?', '¿Desea dar de baja?').then(confirmacion => {
            if (confirmacion) {
                // Verificar relaciones de las maquinas de estados de todas las capas
                const puedeInactivar = this.verificarBaja();

                if (puedeInactivar) {
                    const estadoPatch = {
                        _id: this.camaSnap.idCama,
                        estado: 'inactiva',
                    };

                    for (const capa of this.capas) {
                        this.camasHTTP.save(this.ambito, capa, this.fecha, estadoPatch).subscribe(response => {
                            if (response) {
                                if (capa === this.capas[this.capas.length - 1]) {
                                    this.plex.info('success', 'La cama fue dada de baja', 'Baja exitosa!');
                                    this.router.navigate(['/internacion/mapa-camas']);
                                }
                            } else {
                                this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                                return false;
                            }
                        });
                    }
                } else {
                    this.plex.info('warning', 'No se puede dar de baja la cama ya que está siendo utilizada otra capa.', 'Atención!');
                }
            }
        });
    }

    verificarBaja() {
        let contador = 0;

        for (const capa of this.capas) {
            const maquinaEstados = this.infoCama[capa][0];
            const snap = this.infoCama[capa][1];

            for (const relacion of maquinaEstados.relaciones) {
                if ((relacion.destino === 'inactiva') && (relacion.origen === snap.estado)) {
                    contador++;
                }
            }
        }

        return (contador === this.capas.length);
    }

    volver() {
        this.location.back();
    }
}
