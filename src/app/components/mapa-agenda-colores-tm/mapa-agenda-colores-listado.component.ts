import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { BehaviorSubject } from 'rxjs';
import { finalize } from 'rxjs/operators';

import {
    getMapaAgendaColorId,
    IMapaAgendaColor,
    MapaAgendaColorAlcance
} from '../../interfaces/IMapaAgendaColor';
import { MapaAgendaColoresService } from '../turnos/gestor-agendas/mapa-agendas/mapa-agenda-colores.service';
import {
    alcancesCreables,
    etiquetaAlcance,
    puedeAccederAbmMapaAgendaColores,
    puedeMutarMapaAgendaColor
} from './mapa-agenda-colores-permisos.util';

@Component({
    selector: 'mapa-agenda-colores-tm-listado',
    templateUrl: './mapa-agenda-colores-listado.component.html',
    styleUrls: ['./mapa-agenda-colores-listado.component.scss']
})
export class MapaAgendaColoresListadoComponent implements OnInit {

    searchTerm = '';
    filtroAlcance: MapaAgendaColorAlcance | '' = '';

    readonly items$ = new BehaviorSubject<IMapaAgendaColor[]>([]);
    loading = false;
    loadingMore = false;
    skip = 0;
    readonly pageSize = 25;
    finScroll = false;

    readonly puedeCrear: boolean;
    readonly alcanceOpciones = [
        { id: '', nombre: 'Todos los alcances' },
        { id: 'global', nombre: 'Global' },
        { id: 'organizacion', nombre: 'Organización' },
        { id: 'profesional', nombre: 'Profesional' }
    ];

    public columns = [
        {
            key: 'concepto',
            label: 'Concepto SNOMED',
            sorteable: true,
            opcional: false,
            sort: (a: IMapaAgendaColor, b: IMapaAgendaColor) =>
                (a.concepto?.term || '').localeCompare(b.concepto?.term || '')
        },
        {
            key: 'conceptId',
            label: 'Concept ID',
            sorteable: true,
            opcional: true,
            sort: (a: IMapaAgendaColor, b: IMapaAgendaColor) =>
                (a.concepto?.conceptId || '').localeCompare(b.concepto?.conceptId || '')
        },
        {
            key: 'color',
            label: 'Color',
            sorteable: false,
            opcional: false
        },
        {
            key: 'alcance',
            label: 'Alcance',
            sorteable: true,
            opcional: false,
            sort: (a: IMapaAgendaColor, b: IMapaAgendaColor) => a.alcance.localeCompare(b.alcance)
        },
        {
            key: 'ambito',
            label: 'Ámbito',
            sorteable: false,
            opcional: true
        },
        {
            key: 'activo',
            label: 'Activo',
            sorteable: true,
            opcional: true,
            sort: (a: IMapaAgendaColor, b: IMapaAgendaColor) => Number(!!a.activo) - Number(!!b.activo)
        },
        {
            key: 'acciones',
            label: 'Acciones',
            sorteable: false,
            opcional: false
        }
    ];

    constructor(
        private auth: Auth,
        private router: Router,
        private plex: Plex,
        private mapaAgendaColoresService: MapaAgendaColoresService
    ) {
        this.puedeCrear = alcancesCreables(auth).length > 0;
    }

    ngOnInit() {
        if (!puedeAccederAbmMapaAgendaColores(this.auth)) {
            this.router.navigate(['inicio']);
            return;
        }
        this.plex.updateTitle('Tablas maestras / Colores mapa de agendas');
        this.filtrar();
    }

    etiquetaAlcance = etiquetaAlcance;

    ambitoLabel(row: IMapaAgendaColor): string {
        if (row.alcance === 'global') {
            return '—';
        }
        if (row.alcance === 'organizacion') {
            return row.organizacion?.nombre || 'Organización de sesión';
        }
        const p = row.profesional;
        if (p?.apellido || p?.nombre) {
            return `${p.apellido || ''} ${p.nombre || ''}`.trim();
        }
        return 'Profesional';
    }

    puedeMutar(row: IMapaAgendaColor): boolean {
        return puedeMutarMapaAgendaColor(this.auth, row);
    }

    filtrar() {
        this.skip = 0;
        this.finScroll = false;
        this.items$.next([]);
        this.fetchPage();
    }

    onScroll() {
        if (this.finScroll || this.loading || this.loadingMore) {
            return;
        }
        this.fetchPage();
    }

    private fetchPage() {
        const isFirstPage = this.skip === 0;
        if (isFirstPage) {
            this.loading = true;
        } else {
            this.loadingMore = true;
        }

        const params: Record<string, string | number> = {
            limit: this.pageSize,
            skip: this.skip
        };
        const q = this.searchTerm?.trim();
        if (q) {
            params.search = q;
        }
        if (this.filtroAlcance) {
            params.alcance = this.filtroAlcance;
        }

        this.mapaAgendaColoresService.search(params).pipe(
            finalize(() => {
                this.loading = false;
                this.loadingMore = false;
            })
        ).subscribe(
            (list) => {
                const rows = Array.isArray(list) ? list : [];
                this.items$.next([...this.items$.getValue(), ...rows]);
                this.skip += rows.length;
                if (rows.length < this.pageSize) {
                    this.finScroll = true;
                }
            },
            () => {
                this.plex.toast('danger', 'No se pudo cargar el listado de colores del mapa.');
            }
        );
    }

    irEditar(row: IMapaAgendaColor) {
        const id = getMapaAgendaColorId(row);
        if (!id) {
            return;
        }
        this.router.navigate(['/tm/mapa-agenda-colores/create', id]);
    }

    borrar(row: IMapaAgendaColor) {
        const id = getMapaAgendaColorId(row);
        if (!id || !this.puedeMutar(row)) {
            return;
        }
        const term = row.concepto?.term || row.concepto?.conceptId || 'regla';
        this.plex.confirm(
            `¿Eliminar el color del concepto «${term}» (${etiquetaAlcance(row.alcance)})?`,
            'Confirmar eliminación'
        ).then((confirmado) => {
            if (!confirmado) {
                return;
            }
            this.mapaAgendaColoresService.delete(id).subscribe(
                () => {
                    this.plex.toast('success', 'Regla de color eliminada.');
                    this.filtrar();
                },
                () => {
                    this.plex.toast('danger', 'No se pudo eliminar la regla de color.');
                }
            );
        });
    }
}
