import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { OrganizacionService } from './../../services/organizacion.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { ITipoPrestacion } from '../../interfaces/ITipoPrestacion';

@Component({
    selector: 'organizacion-prestaciones',
    templateUrl: 'organizacion-prestaciones.html',
})
export class OrganizacionOfertaPrestacionalComponent implements OnInit {
    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    disabledPanel = true;
    agregando = false;
    editando = false;
    prestacion: ITipoPrestacion;
    detalle: string;
    public idOrganizacion: String;
    public organizacion: IOrganizacion;
    public ofertaPrestacionalSeleccionada: any;
    public modelo: any = { prestacion: null, descripcion: null };


    constructor(
        public plex: Plex,
        private auth: Auth,
        private router: Router,
        private route: ActivatedRoute,
        private organizacionService: OrganizacionService
    ) { }

    ngOnInit() {
        this.getOrganizacion();
    }

    getOrganizacion() {
        this.route.params.subscribe(params => {
            this.idOrganizacion = params['id'];
            if (!this.auth.check('tm:organizacion:sectores')) {
                this.router.navigate(['inicio']);
            }
            this.organizacionService.getById(this.idOrganizacion).subscribe(org => {
                this.organizacion = org;
            });
        });
    }


    /*
     * AGREGAR
     */
    onAgregar() {
        this.agregando = true;
        this.cancelarEditar();
    }

    cancelarAgregar() {
        this.agregando = false;
        this.modelo = {
            prestacion: null,
            descripcion: null,
        };
    }

    agregarOferta() {
        if (this.modelo.prestacion) {
            if (!this.organizacion.ofertaPrestacional) {
                this.organizacion.ofertaPrestacional = [this.modelo];
            } else {
                this.organizacion.ofertaPrestacional.push(this.modelo);
            }
            this.organizacionService.save(this.organizacion).subscribe(organizacion => {
                this.plex.info('info', 'La oferta prestacional fue agregada');
                this.ofertaPrestacionalSeleccionada = null;
                this.cancelarAgregar();
                this.cancelarEditar();
            });
        }
    }

    /*
     * EDITAR
     */
    onEditar(oferta: { _id: string; prestacion: ITipoPrestacion; detalle: string }) {
        this.ofertaPrestacionalSeleccionada = oferta;
        this.prestacion = oferta.prestacion;
        this.detalle = oferta.detalle;
        this.editando = true;
    }

    cancelarEditar() {
        this.ofertaPrestacionalSeleccionada = null;
        this.editando = false;
        this.prestacion = null;
        this.detalle = null;
    }

    editarOferta() {
        this.ofertaPrestacionalSeleccionada.prestacion = this.prestacion;
        this.ofertaPrestacionalSeleccionada.detalle = this.detalle;

        let i = 0;
        for (const oferta of this.organizacion.ofertaPrestacional) {
            if (oferta.prestacion.conceptId === this.ofertaPrestacionalSeleccionada.prestacion.conceptId) {
                this.organizacion.ofertaPrestacional[i] = this.ofertaPrestacionalSeleccionada;
            }
            i++;
        }

        this.organizacionService.save(this.organizacion).subscribe(organizacion => {
            this.plex.info('info', 'La oferta prestacional fue editada');
            this.cancelarEditar();
        });
    }

    hayCambios() {
        return ((this.ofertaPrestacionalSeleccionada.prestacion.fsn !== this.prestacion.fsn) || (this.ofertaPrestacionalSeleccionada.detalle !== this.detalle));
    }

    /*
     * ELIMINAR
     */
    eliminarOferta(ofertaSeleccionada) {
        this.ofertaPrestacionalSeleccionada = ofertaSeleccionada;
        this.plex.confirm('Eliminar oferta prestacional "' + this.ofertaPrestacionalSeleccionada.prestacion.fsn + '"', '¿Eliminar oferta prestacional?').then(confirmacion => {
            if (confirmacion) {
                this.organizacion.ofertaPrestacional = this.organizacion.ofertaPrestacional.filter(e => e.prestacion.conceptId !== this.ofertaPrestacionalSeleccionada.prestacion.conceptId) as any;

                this.organizacionService.save(this.organizacion).subscribe(organizacion => {
                    this.plex.info('info', 'La oferta prestacional fue eliminada');
                    this.cancelarEditar();
                });
            }
        });
    }

    checkAuth(permiso, id) {
        return this.auth.check('tm:organizacion:' + permiso + (id ? ':' + id : ''));
    }

    volver() {
        this.router.navigate(['tm/organizacion']);
    }
}
