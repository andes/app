import { DerivacionesService } from './../../../services/com/derivaciones.service';
import { Component, OnInit } from '@angular/core';
import { OrganizacionService } from '../../../services/organizacion.service';
import { IOrganizacion } from '../../../interfaces/IOrganizacion';
import { Auth } from '@andes/auth';
import { IDerivacion } from '../interfaces/IDerivacion.interface';
import { Router } from '@angular/router';
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
    derivaciones: any[];
    organizacionActual: any[];
    organizacionOrigen: IOrganizacion;
    organizacionDestino: IOrganizacion;
    paciente: any;
    estado: any;
    gravedad: any;
    tabIndex = 0;
    public loading = false;
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
    public opcionesGravedad = [
        { id: 'baja', nombre: 'baja' },
        { id: 'media', nombre: 'media' },
        { id: 'alta', nombre: 'alta' }
    ];

    constructor(private derivacionesService: DerivacionesService, private organizacionService: OrganizacionService, private auth: Auth,
        public router: Router, public plex: Plex) { }

    ngOnInit() {
        if (!(this.auth.getPermissions('com:?').length > 0)) {
            this.router.navigate(['./inicio']);
        }
        this.organizacionActual = this.auth.organizacion as any;
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
        this.loading = true;
        let query: any = { cancelada: false, sort: 'fecha' };
        if (this.estado) {
            query.estado = this.estado.id;
        } else {
            query.estado = ['asignada', 'solicitada', 'inhabilitada', 'habilitada', 'asignada', 'rechazada', 'aceptada', 'encomendada'];
        }
        if (this.gravedad) {
            query.gravedad = this.gravedad.id;
        }
        if (this.tabIndex === 0) {
            query.organizacionDestino = this.auth.organizacion.id;
            if (this.organizacionOrigen) {
                query.organizacionOrigen = this.organizacionOrigen.id;
            }
        } else {
            if (!this.esCOM) {
                query.organizacionOrigen = this.auth.organizacion.id;
            }
            if (this.organizacionDestino) {
                query.organizacionDestino = this.organizacionDestino.id;
            }
        }
        if (this.paciente) {
            query.paciente = `^${this.paciente}`;
        }
        this.derivacionesService.search(query).subscribe((derivaciones: [IDerivacion]) => {
            this.derivaciones = derivaciones;
            if (this.tabIndex === 1 && this.esCOM) {
                this.derivaciones = this.derivaciones.filter(e => e.organizacionDestino.id !== this.auth.organizacion.id);
            }
            this.loading = false;
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
            this.actualizarTabla();
        }
    }

    returnActualizar() {
        this.ocultarSidebars();
    }

    cambiarTab(index) {
        if (index !== this.tabIndex) {
            this.tabIndex = index;
            this.ocultarSidebars();
            this.actualizarTabla();
        }
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


