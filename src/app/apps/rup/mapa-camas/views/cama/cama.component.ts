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
import { map, pluck } from 'rxjs/operators';
import { cache } from '@andes/shared';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public disabled = false;

    public expr = SnomedExpression;

    public fecha;
    private ambito: string = this.mapaCamasService.ambito;
    public sectores$: Observable<any[]>;
    public mapaSectores$: Observable<any[]>;
    public unidadesOrganizativas$: Observable<any[]>;
    public organizacion$: Observable<any>;

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
    public infoCama = {};
    public capas = [
        'estadistica',
        'medica',
        // 'enfermeria'
    ];
    public puedeEditar = true;

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
        public permisosMapaCamasService: PermisosMapaCamasService,
    ) {

    }

    ngOnInit() {
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.permisosMapaCamasService.setAmbito(this.ambito);

        this.plex.updateTitle([{
            route: '/inicio',
            name: 'Andes'
        }, {
            name: this.ambito
        }, {
            name: 'Cama'
        }]);

        this.getOrganizacion();
        this.getCama();
        if (this.permisosMapaCamasService.camaBaja) {
            this.maquinaEstadosHTTP.get(this.ambito, undefined, this.auth.organizacion.id).subscribe(maquinaEstados => {
                maquinaEstados.forEach(mq => {
                    if (!this.infoCama[mq.capa]) {
                        this.infoCama[mq.capa] = [];
                    }
                    this.infoCama[mq.capa][0] = mq;
                });
            });
        }
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

    getCama() {
        const id = this.route.snapshot.params.id;
        if (id) {
            if (!this.permisosMapaCamasService.camaEdit) {
                this.puedeEditar = false;
            }
            const snapshotRequests = this.capas.map(capa => {
                return this.camasHTTP.snapshot(this.ambito, capa, moment().toDate(), null, null, id).pipe(
                    map(snapshots => snapshots[0])
                );
            });
            forkJoin(
                ...snapshotRequests
            ).subscribe(snapshots => {
                snapshots.forEach((snap) => {
                    if (!this.infoCama[snap.capa]) {
                        this.infoCama[snap.capa] = [];
                    }
                    this.infoCama[snap.capa][1] = snap;
                    this.cama = { ...snap };
                    this.camaEditada = { ...snap };
                });
            });
        } else {
            this.camaEditada.esCensable = true;
            this.fecha = moment().toDate();
        }

    }

    getCamaModel() {
        return {
            nombre: this.camaEditada.nombre,
            unidadOrganizativa: this.camaEditada.unidadOrganizativa,
            unidadOrganizativaOriginal: this.camaEditada.unidadOrganizativa,
            fecha: this.camaEditada.fecha,
            tipoCama: this.camaEditada.tipoCama,
            equipamiento: this.camaEditada.equipamiento,
            especialidades: this.camaEditada.especialidades,
            genero: this.camaEditada.genero,
            sectores: this.camaEditada.sectores,
            esCensable: this.camaEditada.esCensable
        };
    }

    save(valid) {
        if (!valid.formValid) {
            this.plex.info('danger', 'Reviso los datos ingresados');
            return;
        }
        this.disabled = true;
        if (this.cama) {
            const fecha = moment().toDate();
            const datosCama = {
                _id: this.cama.idCama,
                ...this.getCamaModel(),
                esMovimiento: false
            };
            const savedRequest = this.capas.map(capa => this.guardarCambios(datosCama, capa, fecha));
            concat(
                ...savedRequest
            ).subscribe(
                () => null,
                (err) => {
                    this.disabled = false;
                    this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                },
                () => {
                    this.disabled = false;
                    this.plex.info('success', 'La cama fue guardada', 'Cama guardada!');
                    this.router.navigate([`/mapa-camas/${this.ambito}/${this.mapaCamasService.capa}`]);
                }
            );
        } else {
            const dtoCama = {
                ...this.getCamaModel(),
                esMovimiento: true
            };
            this.guardarCambios(dtoCama, null, this.fecha).subscribe(() => {
                this.disabled = false;
                this.plex.info('success', 'La cama fue guardada', 'Cama guardada!');
                this.router.navigate([`/mapa-camas/${this.ambito}`]);
            }, () => {
                this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                this.disabled = false;
            });
        }

    }

    darBaja() {
        const puedeInactivar = this.verificarBaja();
        // No me fio del disabled del boton.
        if (!puedeInactivar) {
            return;
        }
        const textoModal = `¿Dar de baja la cama "${this.cama.nombre}"?'`;
        const tituloModal = '¿Desea dar de baja?';
        this.plex.confirm(textoModal, tituloModal).then(confirmacion => {
            if (confirmacion) {
                this.disabled = true;
                const datosCama = {
                    _id: this.cama.idCama,
                    estado: 'inactiva',
                    esMovimiento: true
                };
                const hoy = moment().toDate();
                const inactivarRequest = this.capas.map(capa => this.guardarCambios(datosCama, capa, hoy));
                concat(
                    ...inactivarRequest
                ).subscribe(
                    () => null,
                    (err) => {
                        this.disabled = false;
                        this.plex.info('warning', 'ERROR: Ocurrio un problema al guardar la cama');
                    },
                    () => {
                        this.disabled = false;
                        this.plex.info('success', 'La cama fue dada de baja', 'Baja exitosa!');
                        this.router.navigate([`/mapa-camas/${this.ambito}`]);
                    }
                );
            }
        });
    }

    verificarBaja() {
        let contador = 0;

        for (const capa of this.capas) {
            const maquinaEstados = this.infoCama[capa][0];
            const snap = this.infoCama[capa][1];
            if (maquinaEstados) {
                for (const relacion of maquinaEstados.relaciones) {
                    if ((relacion.destino === 'inactiva') && (relacion.origen === snap.estado)) {
                        contador++;
                    }
                }
            }
        }

        return (contador === this.capas.length);
    }

    onSectorSelect($event, organizacion) {
        if ($event.value) {
            this.camaEditada.sectores = this.organizacionService.getRuta(organizacion, $event.value);
        } else {
            this.camaEditada.sectores = null;
        }
    }

    guardarCambios(datosCama, capa, fecha) {
        return this.camasHTTP.save(this.ambito, capa, fecha, datosCama);
    }

    volver() {
        this.location.back();
    }
}
