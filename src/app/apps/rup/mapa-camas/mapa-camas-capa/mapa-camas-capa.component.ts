import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import * as moment from 'moment';
import { MapaCamasService } from '../mapa-camas.service';

@Component({
    selector: 'app-mapa-camas-capa',
    templateUrl: 'mapa-camas-capa.component.html',
})

export class MapaCamasCapaComponent implements OnInit {
    @ViewChild('dateSelect', { static: false }) dateSelect: ElementRef;

    ambito = 'internacion';
    capa: string;
    fecha = moment().toDate();
    snapshot: any;
    auxSnapshot: any;
    censables = [{ id: 0, nombre: 'No censable' }, { id: 1, nombre: 'Censable' }];
    filtro: any = {};

    unidadesOrganizativas = [];
    sectores = [];
    tiposCama = [];
    camasGroupXUO: any;

    itemsDropdown = [
        { label: 'CENSO DIARIO', route: `/internacion/censo/diario` },
        { label: 'CENSO MENSUAL', route: `/internacion/censo/mensual` },
    ];

    constructor(
        public auth: Auth,
        private plex: Plex,
        private route: ActivatedRoute,
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.capa = params.get('capa');
            this.getSnapshot();
        });
    }

    groupBy(xs: any[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    getSnapshot() {
        if (this.fecha) {
            this.mapaCamasService.snapshot(this.ambito, this.capa, moment(this.fecha).toDate()).subscribe(snap => {
                this.snapshot = snap;
                this.auxSnapshot = snap;

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

                this.camasGroupXUO = this.groupBy(snap, 'uo');
            });
        }
    }

    filtrar(filtro) {
        if (!this.filtro[filtro]) {
            this.snapshot = this.auxSnapshot;
        }

        if (this.filtro.paciente) {
            this.snapshot = this.snapshot.filter(snap =>
                (snap.paciente.nombre.toLowerCase().includes(this.filtro.paciente.toLowerCase())) ||
                (snap.paciente.apellido.toLowerCase().includes(this.filtro.paciente.toLowerCase()))
            );
        }

        if (this.filtro.unidadOrganizativa) {
            this.snapshot = this.snapshot.filter(snap => snap.unidadOrganizativa.conceptId === this.filtro.unidadOrganizativa.id);
        }

        if (this.filtro.sector) {
            this.snapshot = this.snapshot.filter(snap => String(snap.sectores[snap.sectores.length - 1]._id) === this.filtro.sector.id);
        }

        if (this.filtro.tipoCama) {
            this.snapshot = this.snapshot.filter(snap => snap.tipoCama.conceptId === this.filtro.tipoCama.id);
        }

        if (this.filtro.censable) {
            if (this.filtro.censable.id === 0) {
                this.snapshot = this.snapshot.filter(snap => !snap.esCensable);
            } else if (this.filtro.censable.id === 1) {
                this.snapshot = this.snapshot.filter(snap => snap.esCensable);
            }
        }
    }

    seleccionarFecha() {
        this.dateSelect.nativeElement.click();
    }
}
