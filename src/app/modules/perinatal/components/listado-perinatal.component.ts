import { Plex } from '@andes/plex';
import { CarnetPerinatalService } from './../services/carnet-perinatal.service';
import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth } from '@andes/auth';

@Component({
    selector: 'listado-perinatal',
    templateUrl: './listado-perinatal.component.html'
})
export class ListadoPerinatalComponent implements OnInit {
    public fechaDesdeEntrada;
    public fechaHastaEntrada;
    public paciente;
    public controles: [];
    public fechaCita;
    public fechaUltimoControl;
    public listado$: Observable<any[]>;
    private listadoActual: any[];
    public showSidebar = false;
    // Muestra efecto de selección
    public carnetSelected;
    public columns = [

        {
            key: 'fecha',
            label: 'Fecha inicio',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fecha.localeCompare(b.fecha)
        },
        {
            key: 'paciente',
            label: 'Paciente',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.paciente.localeCompare(b.paciente)
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.documento.localeCompare(b.documento)
        },
        {
            key: 'telefono',
            label: 'Teléfono',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.telefono.localeCompare(b.telefono)
        },
        {
            key: 'edad',
            label: 'Edad',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.edad.localeCompare(b.edad)
        },
        {
            key: 'ausente',
            label: '',
            sorteable: true,
            opcional: false,
            sort: (a: any, b: any) => a.ausente.localeCompare(b.ausente)
        },
        {
            key: 'fechaCita',
            label: 'Fecha de cita',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaCita.localeCompare(b.fechaCita)
        },
        {
            key: 'ultimoControl',
            label: 'Último control',
            sorteable: false,
            opcional: true,
            sort: (a: any, b: any) => a.ultimoControl.localeCompare(b.ultimoControl)
        }
    ];
    constructor(
        private auth: Auth,
        private router: Router,
        private location: Location,
        private carnetPerinatalService: CarnetPerinatalService) { }

    ngOnInit(): void {
        if (!this.auth.getPermissions('perinatal:?').length) {
            this.router.navigate(['inicio']);
        }
        this.listado$ = this.carnetPerinatalService.carnetsFiltrados$.pipe(
            map(resp => this.listadoActual = resp)
        );
    }

    filtrar() {
        if (this.fechaUltimoControl) {
            this.fechaUltimoControl = moment(this.fechaUltimoControl).startOf('day').toDate();
        }
        if (this.fechaCita) {
            this.fechaCita = moment(this.fechaCita).startOf('day').toDate();
        }
        this.carnetPerinatalService.lastResults.next(null);
        this.carnetPerinatalService.paciente.next(this.paciente);
        this.carnetPerinatalService.fechaDesde.next(this.fechaDesdeEntrada);
        this.carnetPerinatalService.fechaHasta.next(this.fechaHastaEntrada);
        this.carnetPerinatalService.fechaUltimoControl.next(this.fechaUltimoControl);
        this.carnetPerinatalService.fechaProximoControl.next(this.fechaCita);
    }

    onScroll() {
        this.carnetPerinatalService.lastResults.next(this.listadoActual);
    }

    showInSidebar(carnet) {
        if (carnet.paciente) {
            this.carnetSelected = carnet;
            this.controles = carnet.controles;
            this.showSidebar = true;
        }
    }

    closeSidebar() {
        this.showSidebar = false;
        this.carnetSelected = null;
    }

    volverInicio() {
        this.location.back();
    }

    irSipsPlus() {
        window.open('http://www.sips.andes.gob.ar', '_blank');
    }

}
