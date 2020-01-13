import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { MapaCamasService } from '../mapa-camas.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
    styleUrls: ['./mapa-camas-capa.component.scss']

})

export class MapaCamasCapaComponent implements OnInit {
    organizacion: string;
    fecha = moment().toDate();
    ambito = 'internacion';
    capa: string;
    camas: Observable<any[]>;
    snapshot: any;
    auxSnapshot: any;
    unidadesOrganizativas = [];
    sectores = [];
    tiposCama = [];
    camasXEstado: any;
    itemsDropdown = [
        { label: 'CENSO DIARIO', route: `/internacion/censo/diario` },
        { label: 'CENSO MENSUAL', route: `/internacion/censo/mensual` },
    ];
    estadosCama: any;
    estados: any;
    relaciones: any;
    maquinaEstados: any;

    selectedCama: any;
    estadoDestino: any;

    opcionesCamas = [];
    accion = null;

    constructor(
        public auth: Auth,
        private plex: Plex,
        private router: Router,
        private route: ActivatedRoute,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.organizacion = this.auth.organizacion.id;
        this.route.paramMap.subscribe(params => {
            this.capa = params.get('capa');
            this.getSnapshot();
            this.getMaquinaEstados();
        });
    }

    getMaquinaEstados() {
        this.mapaCamasService.getMaquinaEstados(this.organizacion, this.ambito, this.capa).subscribe(maquinaEstados => {
            // [TODO] Sin no esta configurado que avise y no pinche
            this.maquinaEstados = maquinaEstados[0];
            this.estados = maquinaEstados[0].estados;
            this.relaciones = maquinaEstados[0].relaciones;
        });
    }

    getSnapshot(fecha = null) {
        if (!fecha) {
            fecha = this.fecha;
        }

        this.mapaCamasService.snapshot(this.ambito, this.capa, moment(fecha).toDate()).subscribe(snap => {
            this.snapshot = snap;
            this.auxSnapshot = snap;
            this.camas = Observable.of(snap);
            let index;
            snap.map(s => {
                s['uo'] = s.unidadOrganizativa.conceptId;
                index = this.sectores.findIndex(i => i.id === s.sectores[s.sectores.length - 1]._id);
                if (index < 0) {
                    this.sectores.push({ 'id': s.sectores[s.sectores.length - 1]._id, 'nombre': s.sectores[s.sectores.length - 1].nombre });
                }

                index = this.tiposCama.findIndex(i => i.id === s.tipoCama.conceptId);
                if (index < 0) {
                    this.tiposCama.push({ 'id': s.tipoCama.conceptId, 'nombre': s.tipoCama.term });
                }

                this.tiposCama.push(s.sectores[s.sectores.length - 1].nombre);
                index = this.unidadesOrganizativas.findIndex(i => i.conceptId === s.unidadOrganizativa.conceptId);
                if (index < 0) {
                    this.unidadesOrganizativas.push({ id: s.unidadOrganizativa.conceptId, nombre: s.unidadOrganizativa.term });
                }
            });
        });
    }

    filtrarTabla(filtros) {
        this.snapshot = this.auxSnapshot;

        if (filtros.paciente) {
            this.snapshot = this.snapshot.filter(snap =>
                (snap.paciente) &&
                ((snap.paciente.nombre.toLowerCase().includes(filtros.paciente.toLowerCase())) ||
                    (snap.paciente.apellido.toLowerCase().includes(filtros.paciente.toLowerCase())))
            );
        }

        if (filtros.unidadOrganizativa) {
            this.snapshot = this.snapshot.filter(snap => snap.unidadOrganizativa.conceptId === filtros.unidadOrganizativa.id);
        }

        if (filtros.sector) {
            this.snapshot = this.snapshot.filter(snap => String(snap.sectores[snap.sectores.length - 1]._id) === filtros.sector.id);
        }

        if (filtros.tipoCama) {
            this.snapshot = this.snapshot.filter(snap => snap.tipoCama.conceptId === filtros.tipoCama.id);
        }

        if (filtros.censable) {
            if (filtros.censable.id === 0) {
                this.snapshot = this.snapshot.filter(snap => !snap.esCensable);
            } else if (filtros.censable.id === 1) {
                this.snapshot = this.snapshot.filter(snap => snap.esCensable);
            }
        }

        this.camas = Observable.of(this.snapshot);
    }

    agregarCama() {
        this.router.navigate([`/internacion/cama/${this.capa}`]);
    }

    selectCama(accion) {
        this.selectedCama = accion.cama;
        if (accion.relacion) {
            this.estadoDestino = accion.relacion.destino;
            this.accion = accion.relacion.accion;
            let relacionesConDestino = this.relaciones.filter(rel => rel.destino === accion.relacion.destino);
            relacionesConDestino.map(rel => {
                this.opcionesCamas.push(...this.snapshot.filter(snap => snap.estado === rel.origen));
            });
        }
    }

    accionDesocupar(event) {
        this.accion = event.accion;
    }

    refresh(accion) {
        let i = this.snapshot.findIndex((snap: any) => snap._id === accion.cama._id);
        this.snapshot[i] = accion.cama;
        this.camas = Observable.of(this.snapshot);
        this.volverAResumen();
    }

    volverAResumen() {
        this.selectedCama = null;
        this.estadoDestino = null;
        this.accion = null;
    }

    cambiarCama(selectedCama) {
        this.selectedCama = selectedCama;
    }
}
