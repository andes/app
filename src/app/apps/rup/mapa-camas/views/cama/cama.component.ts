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
import { Observable, combineLatest, Subscription, forkJoin, concat } from 'rxjs';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MaquinaEstadosHTTP } from '../../services/maquina-estados.http';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public expr = SnomedExpression;

    public fecha;
    public ambito: string;
    public capa: string;
    public organizacion: any;
    public sectores: any[] = [];
    public cama: ISnapshot;
    public camaEditada = {
        nombre: null,
        unidadOrganizativa: null,
        fecha: null,
        tipoCama: null,
        equipamiento: null,
        especialidades: null,
        genero: null,
        sectores: null,
        esCensable: null
    };
    public permisoBaja = false;
    public disableBaja = true;
    public infoCama = {};
    public capas = [
        'estadistica',
        'medica',
        'enfermeria'
    ];

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService,
        private mapaCamasService: MapaCamasService,
        private camasHTTP: MapaCamasHTTP,
        private maquinaEstadosHTTP: MaquinaEstadosHTTP,
        private location: Location,
    ) {

    }

    ngOnInit() {
        this.ambito = this.mapaCamasService.ambito;

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: 'Internacion'
        }, {
            name: 'Cama'
        }]);

        this.permisoBaja = this.auth.check('internacion:cama:baja');
        this.getOrganizacion();
        this.getCapa();
        this.getCama();
    }

    getOrganizacion() {
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(organizacion => {
            this.organizacion = organizacion;
            this.sectores = this.organizacionService.getFlatTree(this.organizacion);

            if (this.permisoBaja) {
                for (const capa of this.capas) {
                    this.infoCama[capa] = [];
                    this.maquinaEstadosHTTP.getOne(this.ambito, capa, organizacion.id).subscribe(maquinaEstados => {
                        this.infoCama[capa][0] = maquinaEstados;
                    });
                }
            }
        });
    }

    getCapa() {
        this.route.paramMap.subscribe(params => {
            this.capa = params.get('capa');
            if (!this.capa) {
                this.router.navigate(['/inicio']);
            }
        });
    }

    getCama() {
        this.route.paramMap.subscribe(params => {
            if (params.get('id')) {
                let idCama = params.get('id');
                for (const capa of this.capas) {
                    this.infoCama[capa] = [];
                    this.camasHTTP.snapshot(this.ambito, capa, moment().toDate(), null, null, idCama).subscribe(snap => {
                        this.infoCama[capa][1] = snap[0];

                        if (this.capa === capa) {
                            this.cama = snap[0];
                            this.camaEditada = snap[0];
                            if (snap[0].estado === 'disponible') {
                                this.disableBaja = false;
                            }
                        }
                    });
                }
            } else {
                this.camaEditada.esCensable = true;
                this.fecha = moment().toDate();
            }
        });
    }

    save(valid) {
        if (valid.formValid) {
            let idCama = null;
            let fecha = this.fecha;
            let capas = [this.capa];

            if (this.cama) {
                idCama = this.cama.idCama;
                capas = this.capas;
                fecha = moment().toDate();
            }

            const esMovimiento = !idCama;

            const datosCama = {
                _id: idCama,
                nombre: this.camaEditada.nombre,
                unidadOrganizativa: this.camaEditada.unidadOrganizativa,
                fecha: this.camaEditada.fecha,
                tipoCama: this.camaEditada.tipoCama,
                equipamiento: this.camaEditada.equipamiento,
                especialidades: this.camaEditada.especialidades,
                genero: this.camaEditada.genero,
                sectores: this.camaEditada.sectores,
                esCensable: this.camaEditada.esCensable,
                esMovimiento
            };

            concat(...capas.map(capa => this.guardarCambios(datosCama, capa, fecha))).subscribe(
                () => null,
                (err) => {
                    this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                },
                () => {
                    this.plex.info('success', 'La cama fue guardada', 'Cama guardada!');
                    this.router.navigate(['/internacion/mapa-camas']);
                }
            );
        }
    }

    darBaja() {
        this.plex.confirm('¿Dar de baja la cama "' + this.cama.nombre + '"?', '¿Desea dar de baja?').then(confirmacion => {
            if (confirmacion) {
                // Verificar relaciones de las maquinas de estados de todas las capas
                const puedeInactivar = this.verificarBaja();

                if (puedeInactivar) {
                    const datosCama = {
                        _id: this.cama.idCama,
                        estado: 'inactiva'
                    };

                    concat(...this.capas.map(capa => this.guardarCambios(datosCama, capa, moment().toDate()))).subscribe(
                        () => null,
                        (err) => {
                            this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                        },
                        () => {
                            this.plex.info('success', 'La cama fue dada de baja', 'Baja exitosa!');
                            this.router.navigate(['/internacion/mapa-camas']);
                        }
                    );
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

    guardarCambios(datosCama, capa, fecha) {
        return this.camasHTTP.save(this.ambito, capa, fecha, datosCama);
    }

    volver() {
        this.location.back();
    }
}
