import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DocumentosService } from 'src/app/services/documentos.service';
import { CarnetPerinatalService } from './../services/carnet-perinatal.service';

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
    public profesional;
    public organizacion;
    public sortBy: string;
    public sortOrder = 'desc';
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
            label: 'Estado',
            sorteable: false,
            opcional: true,
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

    get disableDescargar() {
        return !this.fechaDesdeEntrada || !this.fechaHastaEntrada;
    }

    constructor(
        private auth: Auth,
        private router: Router,
        private location: Location,
        private carnetPerinatalService: CarnetPerinatalService,
        private documentosService: DocumentosService,
        private plex: Plex
    ) { }

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
        this.carnetPerinatalService.lastResults.next(null);
        this.carnetPerinatalService.paciente.next(this.paciente);
        this.carnetPerinatalService.fechaDesde.next(this.fechaDesdeEntrada);
        this.carnetPerinatalService.fechaHasta.next(this.fechaHastaEntrada);
        this.carnetPerinatalService.organizacion.next(this.organizacion);
        this.carnetPerinatalService.profesional.next(this.profesional);
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

    esAusente(fechaProximoControl, fechaFinEmbarazo) {
        return ((moment().diff(moment(fechaProximoControl), 'days') >= 1) && !fechaFinEmbarazo);
    }

    descargarListado() {
        const params = {
            fechaDesde: this.fechaDesdeEntrada,
            fechaHasta: this.fechaHastaEntrada,
            profesional: this.profesional?.id,
            organizacion: this.organizacion?.id,
            paciente: this.paciente || ''
        };

        this.documentosService.descargarListadoPerinatal(params, `perinatal ${moment().format('DD-MM-hh-mm-ss')}`).subscribe();
    }

    returnEdicion(carnetActualizado) {
        if (carnetActualizado) {
            this.carnetSelected = carnetActualizado;
            this.listado$ = this.carnetPerinatalService.carnetsFiltrados$.pipe(
                map(resp => this.listadoActual = resp)
            );
        }
    }

    returnNotas(nota) {
        this.carnetSelected.nota = nota;
        this.carnetPerinatalService.update(this.carnetSelected.id, this.carnetSelected).subscribe(resultado => {
            this.listado$ = this.carnetPerinatalService.carnetsFiltrados$.pipe(
                map(resp => this.listadoActual = resp)
            );
            if (nota) {
                this.plex.toast('success', 'Nota editada con éxito');
            } else {
                this.plex.toast('success', 'Nota eliminada con éxito');
            }
        }, error => {
            this.plex.toast('danger', 'El carnet no pudo ser actualizado');
        });
    }
}
