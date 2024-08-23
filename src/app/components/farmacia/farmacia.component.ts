import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFarmacia } from 'src/app/interfaces/IFarmacia';
import { FarmaciaService } from '../../services/farmacia.service';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';
import { Plex } from '@andes/plex';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
    selector: 'farmacias',
    templateUrl: 'farmacia.component.html',
    styleUrls: []
})

export class FarmaciaComponent implements OnInit {
    filtros: any = {};
    public listadoFarmacia$: Observable<IFarmacia[]>;
    public listadoActual: any[];
    public farmaciaSelected;
    public showSidebar = false;
    public showcreate = false;
    public columHora = [];
    public tieneDisposicion;
    public tieneSancion;
    public showFormDisp = false;
    public showFormSanc = false;
    public numeroDisp;
    public numeroSanc;
    public descripcionDisp;
    public descripcionSanc;
    public accion;
    public posicion;
    public disableGuardar = false;
    private breakpointObserver: BreakpointObserver;
    public arrayAsociado = [
        { id: 'colegio', nombre: 'Colegio de Farmacéuticos' },
        { id: 'farmacia', nombre: 'Farmacias Sociales' },
        { id: 'camara', nombre: 'Camara de Farmacéuticos' },
        { id: 'independiente', nombre: 'Independientes' }
    ];

    constructor(
        private farmaciaService: FarmaciaService,
        private router: Router,
        private auth: Auth,
        private plex: Plex,
    ) { }

    public columns = [
        {
            key: 'denominacion',
            label: 'Denominación',
            sorteable: true,
            sort: (a: any, b: any) => a.denominacion.localeCompare(b.denominacion)
        },
        {
            key: 'razonSocial',
            label: 'Razón Social',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.razonSocial.localeCompare(b.razonSocial)
        },
        {
            key: 'cuit',
            label: 'Cuit',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.cuit.localeCompare(b.cuit)
        },
        {
            key: 'DTResponsable',
            label: 'D.T Responsable',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.DTResponsable.localeCompare(b.DTResponsable)
        },
        {
            key: 'matriculaDTR',
            label: 'Matrícula D.T',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.matriculaDTResponsable.localeCompare(b.matriculaDTResponsable)
        },
        {
            key: 'disposicionAltaDT',
            label: 'Disposición Alta D.T',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.disposicionAltaDT.localeCompare(b.disposicionAltaDT)
        },
        {
            key: 'asociado',
            label: 'Asociado',
            sorteable: true,
            opcional: true,
            sort: (a: any, b: any) => a.asociadoA.localeCompare(b.asociadoA)
        },
        {}
    ];

    public columFarmac = [
        {
            key: 'farmaceutico',
            label: 'Farmaceutico'
        },
        {
            key: 'matricula',
            label: 'Matrícula'
        },
        {
            key: 'disposicionAlta',
            label: 'Disposición/Alta'
        },
    ];

    public columSancion = [
        {
            key: 'numero',
            label: 'Número'
        },
        {
            key: 'descripcion',
            label: 'Descripción'
        },
        {}
    ];

    ngOnInit() {
        if (this.auth.getPermissions('tm:farmacia:?').length < 1) {
            this.router.navigate(['inicio']);
        }
        this.filtrar();
        this.listadoFarmacia$ = this.farmaciaService.farmaciasFiltradas$.pipe(
            map(resp => {
                this.listadoActual = resp;
                return resp;
            })
        );
    }

    onScroll() {
        this.farmaciaService.lastResults.next(this.listadoActual);
    }

    isMobile() {
        return this.breakpointObserver?.isMatched('(max-width: 599px)');
    }

    filtrar() {
        this.farmaciaService.lastResults.next(null);
        this.farmaciaService.denominacion.next(this.filtros.denominacion);
        this.farmaciaService.razonSocial.next(this.filtros.razonSocial);
        this.farmaciaService.cuit.next(this.filtros.cuit);
        this.farmaciaService.DTResponsable.next(this.filtros.DTResponsable);
        this.farmaciaService.asociado.next(this.filtros.asociado);
    }

    seleccionarFarmacia(farmacia) {
        this.farmaciaSelected = farmacia;
        this.showSidebar = true;
        this.tieneDisposicionAsociacion(farmacia);
    }

    puedeCrearFarmacia() {
        return this.auth.getPermissions('tm:*').length || this.auth.getPermissions('tm:farmacia:*').length || this.auth.getPermissions('tm:farmacia:?').some(x => x === 'create');
    }

    puedeEditarFarmacia() {
        return this.auth.getPermissions('tm:*').length || this.auth.getPermissions('tm:farmacia:*').length || this.auth.getPermissions('tm:farmacia:?').some(x => x === 'edit');
    }

    puedeEliminarFarmacia() {
        return this.auth.getPermissions('tm:*').length || this.auth.getPermissions('tm:farmacia:*').length || this.auth.getPermissions('tm:farmacia:?').some(x => x === 'delete');
    }

    crearEditarFarmacia(action) {
        this.showcreate = true;
        this.showSidebar = false;
        if (action === 'create') {
            this.farmaciaSelected = null;
        }
    }

    cerrar() {
        this.showSidebar = false;
    }

    volver() {
        this.showcreate = false;
        this.filtrar();
    }

    agregarElem(tipo) {
        if (tipo === 'disposicion') {
            this.showFormDisp = true;
        } else {
            this.showFormSanc = true;
        }
        this.accion = 'agregar';
    }

    editar(tipo, element, pos) {
        if (tipo === 'disposicion') {
            this.showFormDisp = true;
            this.numeroDisp = element.numero;
            this.descripcionDisp = element.descripcion;
        } else {
            this.showFormSanc = true;
            this.numeroSanc = element.numero;
            this.descripcionSanc = element.descripcion;
        }
        this.accion = 'editar';
        this.posicion = pos;
    }

    eliminar(tipo, pos) {
        let mensaje = '';
        if (tipo === 'disposicion') {
            this.farmaciaSelected.disposiciones.splice(pos, 1);
        } else {
            this.farmaciaSelected.sancion.splice(pos, 1);
        }
        return this.farmaciaService.update(this.farmaciaSelected.id, this.farmaciaSelected).subscribe((farmaciaEdit) => {
            this.tieneDisposicionAsociacion(farmaciaEdit);
            mensaje = (tipo === 'disposicion') ? 'Disposición' : 'Sanción';
            this.plex.toast('success', `${mensaje} eliminada exitosamente`);
            this.cancelar(tipo);
        });
    }

    eliminarFarmacia(farmacia) {
        this.plex.confirm('¿Borrar Farmacia?').then((confirmado) => {
            if (!confirmado) {
                return false;
            } else {
                farmacia.activo = false;
                this.farmaciaService.update(farmacia.id, farmacia).subscribe({
                    next: () => {
                        this.plex.toast('success', 'La Farmacia se eliminó exitosamente.');
                        this.cerrar();
                        this.filtrar();
                    },
                    error: () => this.plex.toast('danger', 'No se pudo eliminar la farmacia.')
                });
            }
        });
    }

    cancelar(tipo) {
        if (tipo === 'disposicion') {
            this.showFormDisp = false;
            this.numeroDisp = null;
            this.descripcionDisp = null;
        } else {
            this.showFormSanc = false;
            this.numeroSanc = null;
            this.descripcionSanc = null;
        }
    }

    guardar(tipo) {
        this.disableGuardar = true;
        if (this.accion === 'agregar') {
            if (tipo === 'disposicion') {
                this.farmaciaSelected.disposiciones.push({
                    numero: this.numeroDisp,
                    descripcion: this.descripcionDisp
                });
            } else {
                this.farmaciaSelected.sancion.push({
                    numero: this.numeroSanc,
                    descripcion: this.descripcionSanc
                });
            }
        } else {
            if (tipo === 'disposicion') {
                this.farmaciaSelected.disposiciones[this.posicion].numero = this.numeroDisp;
                this.farmaciaSelected.disposiciones[this.posicion].descripcion = this.descripcionDisp;
            } else {
                this.farmaciaSelected.sancion[this.posicion].numero = this.numeroSanc;
                this.farmaciaSelected.sancion[this.posicion].descripcion = this.descripcionSanc;
            }
        }
        let mensaje = '';
        let accionRealizada = '';
        return this.farmaciaService.update(this.farmaciaSelected.id, this.farmaciaSelected).subscribe({
            next: (farmaciaEdit) => {
                this.tieneDisposicionAsociacion(farmaciaEdit);
                mensaje = (tipo === 'disposicion') ? 'Disposición' : 'Sanción';
                accionRealizada = (this.accion === 'agregar') ? 'creada' : 'editada';
                this.plex.toast('success', `${mensaje} ${accionRealizada} exitosamente`);
                this.cancelar(tipo);
            },
            error: () => {
                mensaje = (tipo === 'disposicion') ? 'disposición' : 'sanción';
                accionRealizada = (this.accion === 'agregar') ? 'crear' : 'editar';
                this.plex.toast('danger', ` Error al ${accionRealizada} ${mensaje}`);
            }
        });
    }

    public tieneDisposicionAsociacion(farmacia) {
        this.tieneDisposicion = (farmacia.disposiciones.length) ? true : false;
        this.tieneSancion = (farmacia.sancion.length) ? true : false;
    }

    formatoCuit(event: any): void {
        let cuit = event.target.value.replace(/\D/g, '');

        if (cuit.length > 2) {
            cuit = cuit.slice(0, 2) + '-' + cuit.slice(2);
        }
        if (cuit.length > 11) {
            cuit = cuit.slice(0, 11) + '-' + cuit.slice(11, 12);
        }

        this.filtros.cuit = cuit;
    }
}
