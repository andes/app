import { Component, OnInit } from '@angular/core';
import { InscripcionService } from '../services/inscripcion.service';
import { GrupoPoblacionalService } from 'src/app/services/grupo-poblacional.service';
import { Auth } from '@andes/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { LocalidadService } from 'src/app/services/localidad.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { PacienteService } from 'src/app/core/mpi/services/paciente.service';
import { IDireccion } from 'src/app/core/mpi/interfaces/IDireccion';

@Component({
    selector: 'listado-inscriptos',
    templateUrl: 'listado-inscriptos.html',
    styleUrls: ['./listado-inscriptos.scss']
})

export class ListadoInscriptosVacunacionComponent implements OnInit {
    public mainSize = 12;
    public showSidebar = false;
    public pacienteSelected: any;   // incripto
    public pacienteMpi: IPaciente;  // vinculado de mpi
    public listado: any[] = [];
    public gruposPoblacionales: any[];
    public filtroGruposPoblacionales = [];
    public permisosEdicion = [];
    public editarDatos = false;
    public estadosInscripcion = [{ nombre: 'pendiente' }, { nombre: 'habilitado' }, { nombre: 'inhabilitado' }];
    public patronContactoNumerico = /^[0-9]{3,4}[0-9]{6}$/;
    private idNeuquenProv = '57f3f3aacebd681cc2014c53';
    public localidades$: Observable<ILocalidad[]>;
    public direccion: IDireccion = {
        valor: '',
        codigoPostal: '',
        ubicacion: {
            pais: null,
            provincia: null,
            localidad: null,
            barrio: null,
        },
        ranking: 0,
        geoReferencia: null,
        ultimaActualizacion: new Date(),
        activo: true
    };

    constructor(
        private inscripcionService: InscripcionService,
        private gruposService: GrupoPoblacionalService,
        private auth: Auth,
        private router: Router,
        private localidadService: LocalidadService,
        private pacienteService: PacienteService
    ) { }

    filtrarGrupos(permisos) {
        if (permisos[0] !== '*') {
            this.inscripcionService.filtroGrupos.next(permisos);
            this.filtroGruposPoblacionales = permisos;
        }
    }

    ngOnInit() {
        this.permisosEdicion = this.auth.getPermissions('visualizacionInformacion:listadoInscriptos:editar:?');
        const permisosLectura = this.auth.getPermissions('visualizacionInformacion:listadoInscriptos:ver:?');
        if (!permisosLectura.length) {
            this.router.navigate(['/inicio']);
        }
        this.filtrarGrupos(permisosLectura);
        this.inscripcionService.inscriptosFiltrados$.subscribe(resp => this.listado = resp);
        this.gruposService.search().subscribe(grupos => {
            this.gruposPoblacionales = grupos;
        });
        this.localidades$ = this.localidadService.getXProvincia(this.idNeuquenProv);
    }

    showInSidebar(paciente) {
        if (paciente) {
            this.pacienteSelected = paciente;
            this.pacienteService.getById(this.pacienteSelected.paciente.id).subscribe(pac => {
                this.pacienteMpi = pac;
                if (!this.pacienteMpi.direccion?.length) {
                    this.pacienteMpi.direccion = [this.direccion];
                }
            });
            this.showSidebar = true;
            this.mainSize = 8;
        }
    }

    closeSidebar() {
        this.showSidebar = false;
        this.mainSize = 12;
        this.pacienteSelected = null;
        this.pacienteMpi = null;
        this.editarDatos = false;
    }

    // Devuelve el nombre (descripción) del grupo hasta 35 caracteres
    grupoPoblacional(nombre: string) {
        const maxLength = 35;
        let descripcion = this.gruposPoblacionales?.find(item => item.nombre === nombre).descripcion;
        if (descripcion?.length > maxLength) {
            return `${descripcion.substring(0, maxLength)} ..`;
        }
        return descripcion;
    }

    puedeEditar(campo: string) {
        const puedeEditarCampo = this.permisosEdicion[0] === '*' || this.permisosEdicion.some(p => p === campo);
        if (campo === 'grupoPoblacional') {
            // No debe tener filtrado grupos poblacionales
            return !this.filtroGruposPoblacionales.length && puedeEditarCampo;
        }
        return puedeEditarCampo;
    }

    guardarEdicion() {
        this.pacienteMpi.direccion[0].ubicacion.localidad = this.pacienteSelected.localidad;
        this.pacienteSelected.estado = (typeof this.pacienteSelected.estado === 'string') ? this.pacienteSelected.estado : this.pacienteSelected.estado.nombre;
        this.pacienteService.save(this.pacienteMpi).subscribe();
        this.inscripcionService.save(this.pacienteSelected).subscribe();
        this.editarDatos = false;
    }

    onScroll() {
        this.inscripcionService.lastResults.next(this.listado);
    }
}
