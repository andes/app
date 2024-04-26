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
import { Observable, forkJoin, of } from 'rxjs';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MaquinaEstadosHTTP } from '../../services/maquina-estados.http';
import { map, pluck, switchMap, take } from 'rxjs/operators';
import { cache } from '@andes/shared';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

@Component({
    selector: 'app-cama',
    templateUrl: './cama.component.html',
})

export class CamaMainComponent implements OnInit {
    public disabledAccion = false; // boton guardar y e inactivar
    public camaOcupada = true; // true si se encuentra ocupada en ALGUNA capa
    public puedeEditar = true; // permisos de usuario
    public expr = SnomedExpression;
    private ambito: string = this.mapaCamasService.ambito;
    public sectores$: Observable<any[]>;
    public mapaSectores$: Observable<any[]>;
    public unidadesOrganizativas$: Observable<any[]>;
    public organizacion$: Observable<any>;
    public verificarBaja$: Observable<Boolean>;
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
    public capas$: Observable<string[]>;

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
    ) { }

    ngOnInit() {
        this.ambito = this.route.snapshot.paramMap.get('ambito');
        this.permisosMapaCamasService.setAmbito(this.ambito);
        // carga capas activas del efector
        this.capas$ = this.maquinaEstadosHTTP.getAll(this.auth.organizacion.id, this.ambito).pipe(
            map(estados => estados.map(estado => estado.capa)
                .filter(capa => capa !== 'enfermeria' && capa !== 'estadistica-v2' && capa !== 'interconsultores')
            )
        );
        // verifica si la cama se encuentra disponible en todas las capas del efector
        this.verificarBaja$ = this.capas$.pipe(
            map(capas => {
                let contador = 0;
                capas.map(capa => {
                    const maquinaEstados = this.infoCama[capa][0];
                    const snap = this.infoCama[capa][1];
                    if (maquinaEstados) {
                        for (const relacion of maquinaEstados.relaciones) {
                            if ((relacion.destino === 'inactiva') && (relacion.origen === snap?.estado)) {
                                contador++;
                            }
                        }
                    }
                });
                return (contador === capas.length);
            }),
            cache()
        );

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
            this.capas$.pipe(
                take(1),
                map(capas => capas.map(capa => this.camasHTTP.snapshot(this.ambito, capa, moment().toDate(), null, null, id))),
                switchMap(snaps => forkJoin(snaps).pipe(
                    map(snapshotsArray => snapshotsArray.map(snapshots => snapshots[0]))
                ))
            ).subscribe((snapshots: any) => {
                this.camaOcupada = snapshots.some(snap => snap.estado === 'ocupada');
                snapshots.map((snap) => {
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
            this.plex.info('danger', 'Alguno de los datos ingresados es incorrecto o está incompleto');
            return;
        }
        this.disabledAccion = true;
        let saveRequest;
        const datosCama: any = {
            ...this.getCamaModel(),
            ambito: this.ambito
        };

        if (this.cama) {
            // edicion de cama
            datosCama._id = this.cama.idCama;
            datosCama.esMovimiento = false;
            datosCama.extras = { edicionCama: true };
            saveRequest = this.capas$.pipe(
                switchMap(capas => this.camasHTTP.save(datosCama).pipe(
                    switchMap(camaUpdated => {
                        const editUO = this.cama.unidadOrganizativaOriginal.conceptId !== datosCama.unidadOrganizativaOriginal.conceptId;
                        const editCensable = this.cama.esCensable !== datosCama.esCensable;
                        if (editUO || editCensable) {
                            return forkJoin(capas.map(capa => this.camasHTTP.updateEstados(this.ambito, capa, moment().toDate(), datosCama)));
                        }
                        return of(camaUpdated);
                    }
                    ))
                )
            );
        } else {
            // nueva cama
            datosCama.esMovimiento = true;
            saveRequest = this.camasHTTP.save(datosCama);
        }
        saveRequest.subscribe(() => {
            this.disabledAccion = false;
            this.plex.info('success', 'La cama fue guardada', 'Cama guardada!');
            this.router.navigate([`/mapa-camas/${this.ambito}/${this.mapaCamasService.capa}`]);
        }, () => {
            this.plex.info('danger', 'ERROR: Ocurrio un problema al guardar la cama');
            this.disabledAccion = false;
        });
    }

    darBaja() {
        const textoModal = `¿Dar de baja la cama <b>${this.cama.nombre}</b>?`;
        const tituloModal = '¿Desea dar de baja?';

        this.plex.confirm(textoModal, tituloModal).then(confirmacion => {
            if (confirmacion) {
                this.disabledAccion = true;
                const datosCama = {
                    _id: this.cama.idCama,
                    estado: 'inactiva',
                    esMovimiento: true
                };
                const hoy = moment().toDate();
                this.capas$.pipe(
                    switchMap(capas => forkJoin(capas.map(capa => this.camasHTTP.updateEstados(this.ambito, capa, hoy, datosCama))))
                ).subscribe(response => {
                    if (response) {
                        this.disabledAccion = false;
                        this.plex.info('success', 'La cama fue dada de baja', 'Baja exitosa!');
                        this.router.navigate([`/mapa-camas/${this.ambito}/${this.mapaCamasService.capa}`]);
                    }
                }, (err) => {
                    this.disabledAccion = false;
                    this.plex.info('danger', 'ERROR: Ocurrio un problema al guardar la cama');
                });
            }
        });
    }


    onSectorSelect($event, organizacion) {
        if ($event.value) {
            this.camaEditada.sectores = this.organizacionService.getRuta(organizacion, $event.value);
        } else {
            this.camaEditada.sectores = null;
        }
    }

    volver() {
        this.location.back();
    }
}
