import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFarmacia } from 'src/app/interfaces/IFarmacia';
import { FarmaciaService } from '../../services/farmacia.service';
import { Router } from '@angular/router';
import { Auth } from '@andes/auth';

@Component({
    selector: 'farmacias',
    templateUrl: 'farmacia.component.html',
    styleUrls: []
})

export class FarmaciaComponent implements OnInit {
    filtros: any = {};
    public listadoFarmacia$: Observable<IFarmacia[]>;
    public listadoActual: any[];
    public loader = false;
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
    public contacto;
    public email;

    constructor(
        private farmaciaService: FarmaciaService,
        private router: Router,
        private auth: Auth
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
            sort: (a: any, b: any) => a.razonSocial.localeCompare(b.razonSocial)
        },
        {
            key: 'cuit',
            label: 'Cuit',
            sorteable: true,
            sort: (a: any, b: any) => a.cuit.localeCompare(b.cuit)
        },
        {
            key: 'DTResponsable',
            label: 'D.T Responsable',
            sorteable: true,
            sort: (a: any, b: any) => a.DTResponsable.localeCompare(b.DTResponsable)
        },
        {
            key: 'matriculaDTR',
            label: 'Matrícula D.T',
            sorteable: true,
            sort: (a: any, b: any) => a.matriculaDTResponsable.localeCompare(b.matriculaDTResponsable)
        },
        {
            key: 'disposicionAltaDT',
            label: 'Disposición Alta D.T',
            sorteable: true,
            sort: (a: any, b: any) => a.disposicionAltaDT.localeCompare(b.disposicionAltaDT)
        },
    ]

    public columFarmac = [
        {
            key: 'farmaceutico',
            label: 'Farmaceutico',
            // sorteable: true,
            // sort: (a: any, b: any) => a.farmaceutico.localeCompare(b.farmaceutico)
        },
        {
            key: 'matricula',
            label: 'Matrícula',
            // sorteable: true,
            // sort: (a: any, b: any) => a.denominacion.localeCompare(b.denominacion)
        },
        {
            key: 'disposicionAlta',
            label: 'Disposición/Alta',
            // sorteable: true,
            // sort: (a: any, b: any) => a.denominacion.localeCompare(b.denominacion)
        },
    ]

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
    ]

    ngOnInit() {
        if (this.auth.getPermissions('tm:farmacia:?').length < 1) {
            this.router.navigate(['inicio']);
        }
        this.listadoFarmacia$ = this.farmaciaService.farmaciasFiltradas$.pipe(
            map(resp => {
                // this.listadoActual = resp;
                // this.loader = false;
                return resp;
            })
        );
    }

    onScroll() {
        this.farmaciaService.lastResults.next(this.listadoActual);
    }

    filtrar() {
        this.farmaciaService.lastResults.next(null);
        this.farmaciaService.denominacion.next(this.filtros.denominacion);
    }

    seleccionarFarmacia(farmacia) {
        this.farmaciaSelected = farmacia;
        this.showSidebar = true;
        this.tieneDisposicion = (farmacia.disposiciones.length) ? true : false;
        this.tieneSancion = (farmacia.sancion.length) ? true : false;
        if (this.farmaciaSelected.contactos?.length) {
            const indexCont = this.farmaciaSelected.contactos.findIndex(c => c.tipo === 'celular' || c.tipo === 'fijo');
            const indexEmail = this.farmaciaSelected.contactos.findIndex(c => c.tipo === 'email');
            this.contacto = (indexCont >= 0) ? this.farmaciaSelected.contactos[indexCont].valor : 'Sin contacto';
            this.email = (indexEmail >= 0) ? this.farmaciaSelected.contactos[indexEmail].valor : 'Sin email';
        } else {
            this.contacto = 'Sin contacto';
            this.email = 'Sin email'
        }

    }

    puedeCrearFarmacia() {
        return this.auth.getPermissions('tm:*').length || this.auth.getPermissions('tm:farmacia:*').length || this.auth.getPermissions('tm:farmacia:?').some(x => x === 'create')
    }

    puedeEditarFarmacia() {
        return this.auth.getPermissions('tm:*').length || this.auth.getPermissions('tm:farmacia:*').length || this.auth.getPermissions('tm:farmacia:?').some(x => x === 'edit')
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
    }

    agregarElem(tipo) {
        tipo === 'disposicion' ? this.showFormDisp = true : this.showFormSanc = true;
    }

    editar(tipo, element) {
        if (tipo === 'disposicion') {
            this.showFormDisp = true;
            this.numeroDisp = element.numero;
            this.descripcionDisp = element.descripcion;
        } else {
            this.showFormSanc = true;
            this.numeroSanc = element.numero;
            this.descripcionSanc = element.descripcion;
        }
    }

    eliminar(tipo) {

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

    }
}