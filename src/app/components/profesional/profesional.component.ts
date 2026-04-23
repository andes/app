
import { map } from 'rxjs/operators';
import { IProfesional } from './../../interfaces/IProfesional';
import { ProfesionalService } from './../../services/profesional.service';
import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { Observable } from 'rxjs';
@Component({
    selector: 'profesionales',
    templateUrl: 'profesional.html',
    styleUrls: [
        'profesional.scss'
    ]
})
export class ProfesionalComponent implements OnInit {

    showcreate = false;
    showupdate = false;
    listadoActual: IProfesional[];
    filtros: any = {};
    seleccion: IProfesional;
    skip = 0;
    loader = false;
    finScroll = false;
    tengoDatos = true;
    value: any;
    limit: any = 200;
    profesionalSelected: any = false;
    fotoProfesional: any;
    nuevoProfesional = false;
    puedeDeshacerMatricula = false;
    estadoDeshacerPorFormacion: { [formacionId: string]: any } = {};

    public listado$: Observable<any[]>;

    // Permite :hover y click()
    @Input() selectable = true;

    // Muestra efecto de selección
    @Input() selected = false;

    public sortBy: string;
    public sortOrder = 'desc';
    botonera = true;

    public columns = [
        {
            key: 'documento',
            label: 'Documento',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.documento.localeCompare(b.documento)
        },
        {
            key: 'apellido',
            label: 'Apellido',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.apellido.localeCompare(b.apellido)
        },
        {
            key: 'nombre',
            label: 'Nombre',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.nombre.localeCompare(b.nombre)

        },
        {
            key: 'condicion',
            label: 'Condición',
            opcional: true,
        },
        {
            key: 'estado',
            label: 'Estado',
            opcional: true
        }
    ];


    constructor(
        private profesionalService: ProfesionalService,
        public sanitizer: DomSanitizer,
        private router: Router,
        private auth: Auth,
        private plex: Plex) { }

    ngOnInit() {
        if (this.auth.getPermissions('matriculaciones:profesionales:?').length < 1) {
            this.router.navigate(['inicio']);
        } else {
            this.filtrar();
            this.listado$ = this.profesionalService.profesionalesFiltrados$.pipe(
                map(resp => {
                    this.listadoActual = resp;
                    this.loader = false;
                    return resp;
                })
            );
        }
    }

    onScroll() {
        this.profesionalService.lastResults.next(this.listadoActual);
    }

    filtrar() {
        this.profesionalService.lastResults.next(null);
        this.profesionalService.documento.next(this.filtros.documento);
        this.profesionalService.apellido.next(this.filtros.apellido);
        this.profesionalService.nombre.next(this.filtros.nombre);
        this.profesionalService.activo.next(this.filtros.estado ? !this.filtros.estado : null);
        this.profesionalService.noMatriculado.next(this.filtros.noMatriculado);
    }

    seleccionarProfesional(profesional) {
        this.profesionalSelected = profesional;
        this.puedeDeshacerMatricula = this.auth.getPermissions('matriculaciones:supervisor:aprobar').length > 0;
        this.estadoDeshacerPorFormacion = {};
        if (this.profesionalSelected.validadoRenaper) {
            this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl(this.profesionalSelected.foto);
        } else {
            this.profesionalService.getFoto({ id: this.profesionalSelected.id }).subscribe(resp => {
                this.fotoProfesional = this.sanitizer.bypassSecurityTrustResourceUrl('data:image/jpeg;base64,' + resp);
            });
        }

        if (this.puedeDeshacerMatricula) {
            this.cargarEstadosDeshacer();
        }
    }

    routeTo(action, id) {
        this.router.navigate([`tm/profesional/${action}/${id}`]);
    }

    cerrar() {
        this.profesionalSelected = false;
    }

    cargarEstadosDeshacer() {
        const formaciones = this.profesionalSelected?.formacionGrado || [];
        formaciones.forEach((formacion) => {
            const formacionId = formacion?._id;
            if (!formacionId || !formacion?.matriculacion?.length) {
                return;
            }
            this.estadoDeshacerPorFormacion[formacionId] = { loading: true, canUndo: false, reason: null };
            this.profesionalService.canUndoMatriculaGrado(this.profesionalSelected.id, formacionId).subscribe(
                (estado) => {
                    this.estadoDeshacerPorFormacion[formacionId] = {
                        loading: false,
                        canUndo: !!estado?.canUndo,
                        reason: estado?.reason || null
                    };
                },
                () => {
                    this.estadoDeshacerPorFormacion[formacionId] = {
                        loading: false,
                        canUndo: false,
                        reason: 'no se pudo verificar el estado'
                    };
                }
            );
        });
    }

    estadoDeshacer(formacion: any) {
        const formacionId = formacion?._id;
        return formacionId ? this.estadoDeshacerPorFormacion[formacionId] : null;
    }

    deshacerMatricula(formacion: any) {
        const estado = this.estadoDeshacer(formacion);
        if (!estado?.canUndo || estado?.loading) {
            return;
        }
        const ultimaMatricula = formacion.matriculacion[formacion.matriculacion.length - 1];
        const mensaje = `${formacion.profesion?.nombre || 'Profesion'} - matrícula ${ultimaMatricula?.matriculaNumero}`;
        this.plex.confirm(`¿Desea deshacer el número de matrícula?<br>${mensaje}`, 'Atención').then(confirmacion => {
            if (!confirmacion) {
                return;
            }
            this.profesionalService.undoMatriculaGrado(this.profesionalSelected.id, formacion._id).subscribe(
                () => {
                    this.plex.info('success', 'Número de matrícula deshecho correctamente.');
                    this.profesionalService.get({ id: this.profesionalSelected.id }).subscribe(prof => {
                        if (prof?.length) {
                            this.seleccionarProfesional(prof[0]);
                        }
                    });
                },
                (error) => {
                    const mensajeError = error?.error?.message || 'No fue posible deshacer la matrícula.';
                    this.plex.info('warning', mensajeError);
                    this.profesionalService.get({ id: this.profesionalSelected.id }).subscribe(prof => {
                        if (prof?.length) {
                            this.seleccionarProfesional(prof[0]);
                        }
                    });
                }
            );
        });
    }
}
