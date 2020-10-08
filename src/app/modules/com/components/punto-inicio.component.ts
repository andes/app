import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { Auth } from '@andes/auth';
import { IDerivacion } from '../interfaces/IDerivacion.interface';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { cache } from '@andes/shared';
import { Plex } from '@andes/plex';

@Component({
    selector: 'com-punto-inicio',
    templateUrl: './punto-inicio.html'
})

export class ComPuntoInicioComponent implements OnInit {
    public orgActual;
    public esCOM = false;
    public showSidebar = false;
    public showNuevaDerivacion = false;
    public showDetalle = false;
    public showEditarEstado = false;
    public verAyuda = false;
    derivacionSeleccionada: IDerivacion;
    derivaciones$: Observable<any[]>;
    derivaciones: any[];
    organizacionActual: any[];
    organizacionOrigen: IOrganizacion;
    organizacionDestino: IOrganizacion;
    paciente: any;
    estado: any;
    tabIndex = 0;
    public estados = [
        { id: 'solicitada', nombre: 'SOLICITADA' },
        { id: 'habilitada', nombre: 'HABILITADA' },
        { id: 'inhabilitada', nombre: 'INHABILITADA' },
        { id: 'asignada', nombre: 'ASIGNADA' },
        { id: 'rechazada', nombre: 'RECHAZADA' },
        { id: 'aceptada', nombre: 'ACEPTADA' },
        { id: 'finalizada', nombre: 'FINALIZADA' },
        { id: 'encomendada', nombre: 'ENCOMENDADA' }
    ];

    constructor(private derivacionesService: DerivacionesService, private organizacionService: OrganizacionService, private auth: Auth,
        public router: Router, public plex: Plex) { }

    ngOnInit() {
        if (!(this.auth.getPermissions('com:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.organizacionActual = this.auth.organizacion as any;
        this.derivaciones$ = this.derivacionesService.search({ cancelada: false }).pipe(cache());
        this.organizacionService.getById(this.auth.organizacion.id).subscribe(org => {
            this.orgActual = org;
            if (org.esCOM) {
                this.esCOM = true;
            }
            this.actualizarTabla();
        });
    }

    loadOrganizaciones(event) {
        if (event.query) {
            let query = {
                nombre: event.query
            };
            this.organizacionService.get(query).subscribe(event.callback);
        } else {
            event.callback([]);
        }
    }

    actualizarTabla() {
        this.derivaciones$.subscribe((derivaciones: [IDerivacion]) => {
            this.derivaciones = derivaciones.filter(e => !e.cancelada);
            if (this.tabIndex === 0) {
                this.derivaciones = this.derivaciones.filter(e => e.organizacionDestino.id === this.auth.organizacion.id);
                if (this.organizacionOrigen) {
                    this.derivaciones = this.derivaciones.filter(e => e.organizacionOrigen.id === this.organizacionOrigen.id);
                }
            }
            if (this.tabIndex === 1) {
                if (this.esCOM) {
                    this.derivaciones = this.derivaciones.filter(e => e.organizacionDestino.id !== this.auth.organizacion.id);
                } else {
                    this.derivaciones = this.derivaciones.filter(e => e.organizacionOrigen.id === this.auth.organizacion.id);
                }
                if (this.organizacionDestino) {
                    this.derivaciones = this.derivaciones.filter(e => e.organizacionDestino.id === this.organizacionDestino.id);
                }
            }
            // por defecto no muestra las derivaciones finalizadas
            if (this.estado) {
                this.derivaciones = this.derivaciones.filter(e => e.estado === this.estado.id);
            } else {
                this.derivaciones = this.derivaciones.filter(e => e.estado !== 'finalizada');
            }
            if (this.paciente) {
                this.derivaciones = this.derivaciones.filter(e => e.paciente.documento.includes(this.paciente) || e.paciente.apellido.includes(this.paciente.toUpperCase()) || e.paciente.nombre.includes(this.paciente.toUpperCase()));
            }
        });
    }

    ocultarSidebars() {
        this.showSidebar = false;
        this.showDetalle = false;
        this.showNuevaDerivacion = false;
        this.showEditarEstado = false;
    }

    // acciones relacionadas a una nueva derivación
    nuevaDerivacion() {
        this.ocultarSidebars();
        this.showNuevaDerivacion = true;
        this.showSidebar = true;
    }

    returnBusqueda(event) {
        if (event.status) {
            this.router.navigate([`/com/${event.paciente}`]);
        } else {
            this.ocultarSidebars();
        }
    }

    // acciones relacionadas al detalle
    seleccionar(derivacion) {
        this.ocultarSidebars();
        this.derivacionSeleccionada = derivacion;
        this.showDetalle = true;
        this.showSidebar = true;
    }

    actualizarEstado(derivacion) {
        this.ocultarSidebars();
        this.derivacionSeleccionada = derivacion;
        this.showEditarEstado = true;
        this.showSidebar = true;
    }

    returnDetalle(actualizada) {
        this.ocultarSidebars();
        if (actualizada) {
            this.derivaciones$ = this.derivacionesService.search({ cancelada: false }).pipe(cache());
            this.actualizarTabla();
        }
    }

    returnActualizar() {
        this.ocultarSidebars();
    }

    cambiarTab(index) {
        this.ocultarSidebars();
        this.actualizarTabla();
        this.tabIndex = index;
    }

    cancelar(derivacion) {
        this.plex.confirm('¿Está seguro de querer cancelar la derivación?').then((resultado) => {
            if (resultado) {
                derivacion.cancelada = true;
                this.derivacionesService.update(derivacion._id, derivacion).subscribe(() => {
                    this.plex.toast('success', 'Derivación cancelada');
                    this.actualizarTabla();
                });
            }
            this.ocultarSidebars();
        });
    }

    cambiarVerAyuda(mostrar) {
        this.verAyuda = mostrar;
    }
}


