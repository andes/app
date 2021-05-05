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
    // Permite :hover y click()
    public selectable = true;
    // Muestra efecto de selección
    public carnetSelected;
    public columns = [

        {
            key: 'fechaInicio',
            label: 'Fecha inicio',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fecha.getTime() - b.fecha.getTime()
        },
        {
            key: 'paciente',
            label: 'Paciente',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => {
                const nameA = `${a.paciente.apellido} ${a.paciente.nombre}`;
                const nameB = `${b.paciente.apellido} ${b.paciente.nombre}`;
                return nameA.localeCompare(nameB);
            }
        },
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.paciente.documento.localeCompare(b.paciente.documento)
        },
        {
            key: 'edad',
            label: 'Edad',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.paciente.fechaNacimiento.getTime() - b.paciente.fechaNacimiento.getTime()
        },
        {
            key: 'ausente',
            label: '',
            sorteable: false
        },
        {
            key: 'fechaCita',
            label: 'Fecha de cita',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaProximoControl?.getTime() - b.fechaProximoControl?.getTime()
        },
        {
            key: 'ultimoControl',
            label: 'Último control',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.fechaUltimoControl.getTime() - b.fechaUltimoControl.getTime()
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
        this.filtrar();
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

    esAusente(fechaProximoControl) {
        return (moment().diff(moment(fechaProximoControl), 'days') >= 1);
    }

}
