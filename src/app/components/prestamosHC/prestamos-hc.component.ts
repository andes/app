import { ListarPrestamosComponent } from './prestamos/listar-prestamos.component';
import { Plex } from '@andes/plex';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { ListarSolicitudesComponent } from './solicitudes/listar-solicitudes.component';

@Component({
    selector: 'app-prestamos-hc',
    templateUrl: './prestamos-hc.component.html',
    styleUrls: ['./prestamos-hc.scss']
})


export class PrestamosHcComponent implements OnInit {
    @ViewChild('solicitudes', { static: false }) solicitudes: ListarSolicitudesComponent;
    @ViewChild('prestamos', { static: false }) prestamos: ListarPrestamosComponent;

    recargaPrestamos: any = false;
    recargaSolicitudes: any = false;
    showSidebar = false;
    verSolicitudManual = false;
    verPrestar = false;
    verNuevaCarpeta = false;
    verDevolver = false;
    pacientesSearch = false;
    listaCarpetas: any;
    paciente: any;

    carpetaSeleccionada: any;


    // // ---- Variables asociadas a componentes paciente buscar y paciente listado
    // pacienteSelected = null;
    loading = false;

    public carpetas;
    public imprimirSolicitudes: any = false;
    public autorizado = false;

    constructor(private plex: Plex, public auth: Auth, private router: Router) { }

    ngOnInit() {
        this.autorizado = this.auth.check('prestamos:?');
        if (!this.autorizado) {
            this.redirect('inicio');
        }
    }

    redirect(pagina: string) {
        this.router.navigate(['./' + pagina]);
        return false;
    }

    imprimirCarpetas(carpetas) {
        this.hideSidebar();
        this.carpetas = carpetas;
        this.imprimirSolicitudes = true;
    }

    mostrarSolicitudManual() {
        this.verDevolver = false;
        this.verNuevaCarpeta = false;
        this.verSolicitudManual = false;
        this.verPrestar = false;
        this.showSidebar = true;
        this.pacientesSearch = true;
    }

    cancelarImprimir() {
        this.imprimirSolicitudes = false;
    }

    // -------------- SOBRE BUSCADOR PACIENTES ----------------

    searchStart() {
        this.paciente = null;
    }
    searchEnd(resultado) {
        this.loading = false;
        if (resultado.err) {
            this.plex.info('danger', resultado.err);
            return;
        }
    }

    onSearchClear() {
        this.paciente = null;
    }

    onSelectPaciente(event) {
        this.paciente = event;
        this.pacientesSearch = false;
        this.verSolicitudManual = true;
    }

    onPrestarCarpeta(value) {
        this.showSidebar = true;
        this.carpetaSeleccionada = value;
        this.verPrestar = true;
        this.verSolicitudManual = false;
        this.verNuevaCarpeta = false;
    }

    onCarpetaPrestada() {
        this.hideSidebar();
        this.solicitudes.getCarpetas({}, null);
    }

    onDevolverCarpeta(value) {
        this.showSidebar = true;
        this.carpetaSeleccionada = value;
        this.verDevolver = true;
        this.verPrestar = false;
        this.verSolicitudManual = false;
        this.verNuevaCarpeta = false;
    }

    crearNuevaCarpeta() {
        this.showSidebar = true;
        this.verDevolver = false;
        this.verPrestar = false;
        this.verSolicitudManual = false;
        this.verNuevaCarpeta = true;
    }

    onCarpeta(value) {
        this.showSidebar = true;
        this.verPrestar = true;
        this.verSolicitudManual = false;
        this.verNuevaCarpeta = false;
    }

    onCarpetaDevuelta() {
        this.hideSidebar();
        this.prestamos.getCarpetas({}, null);
    }


    onDevolver(solicitudCarpeta) {
        this.showSidebar = true;
        this.carpetaSeleccionada = solicitudCarpeta;
        this.verDevolver = true;
    }

    hideSidebar() {
        this.showSidebar = false;
        this.verSolicitudManual = false;
        this.pacientesSearch = false;
        this.showSidebar = false;
        this.verDevolver = false;
        this.verPrestar = false;
        this.verNuevaCarpeta = false;
    }

    onTabsChange() {
        this.hideSidebar();
        this.solicitudes.getCarpetas({}, null);
        this.prestamos.getCarpetas({}, null);
    }

    // Se usa tanto para guardar como cancelar
    afterComponenteCarpeta(carpetas) {
        this.verNuevaCarpeta = false;

        if (carpetas && carpetas.length) {
            this.carpetaSeleccionada = carpetas.find(x => x.organizacion._id === this.auth.organizacion.id);
            let msj = `Nro de Carpeta ${this.carpetaSeleccionada.nroCarpeta} asignada a ${this.paciente.apellido}, ${this.paciente.nombre}`;
            this.plex.info('warning', msj);
            this.verSolicitudManual = true;
        } else {
            this.hideSidebar();
        }
    }
}
