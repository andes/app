import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFarmacia } from 'src/app/interfaces/IFarmacia';
import { Plex } from '@andes/plex';
import { FarmaciaService } from 'src/app/services/farmacia.service';
import { Observable } from 'rxjs';
import { PaisService } from 'src/app/services/pais.service';
import { cache } from '@andes/shared';
import { IProvincia } from 'src/app/interfaces/IProvincia';
import { ILocalidad } from 'src/app/interfaces/ILocalidad';
import { ProvinciaService } from 'src/app/services/provincia.service';
import { LocalidadService } from 'src/app/services/localidad.service';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'farmacia-create-update',
    templateUrl: 'farmacia-create-update.component.html',
    styleUrls: ['farmacia.scss']
})

export class FarmaciaCreateUpdateComponent implements OnInit {

    @Output() data = new EventEmitter();
    @Input() farmaciaSeleccionada: IFarmacia;

    public farmacia: IFarmacia = {
        id: '',
        denominacion: '',
        razonSocial: '',
        cuit: '',
        DTResponsable: '',
        matriculaDTResponsable: '',
        disposicionAltaDT: '',
        activo: true,
        farmaceuticosAuxiliares: [],
        horarios: [{
            dia: ''
        }],
        domicilio: {
            valor: '',
            codigoPostal: '',
            ubicacion: {
                provincia: null,
                localidad: null
            }
        },
        contactos: [],
        asociadoA: '',
        disposicionHabilitacion: '',
        fechaHabilitacion: null,
        fechaRenovacion: null,
        vencimientoHabilitacion: null,
        gabineteInyenctables: false,
        laboratoriosMagistrales: false,
        expedientePapel: '',
        expedienteGDE: '',
        nroCaja: '',
        disposiciones: [],
        sancion: []
    };
    public validado = false;
    public provincias$: Observable<IProvincia[]>;
    public localidades$: Observable<ILocalidad[]>;
    public gabinete = false;
    public laboratorio = false;
    public tipoComunicacion;
    public asociado;
    patronContactoCelular = /^[0-9]{3,4}[0-9]{6}$/;
    patronContactoFijo = /^[0-9]{7}$/;
    patronContactoAlfabetico = /^[-\w.%+]{1,61}@[a-z]+(.[a-z]+)+$/;
    patronNumerico = /^\d*$/;
    patronCUIT = /^\d{2}-\d{8}-\d$/;
    public arrayAsociado = [
        { id: 'colegio', nombre: 'Colegio de Farmacéuticos' },
        { id: 'farmacia', nombre: 'Farmacias Sociales' },
        { id: 'camara', nombre: 'Camara de Farmacéuticos' },
        { id: 'independiente', nombre: 'Independientes' }
    ];

    constructor(
        private plex: Plex,
        public farmaciaService: FarmaciaService,
        public paisService: PaisService,
        public provinciaService: ProvinciaService,
        public localidadService: LocalidadService
    ) { }

    ngOnInit() {
        if (this.farmaciaSeleccionada) {
            this.farmacia = this.farmaciaSeleccionada;
            this.asociado = { id: this.farmaciaSeleccionada.asociadoA, nombre: this.farmaciaSeleccionada.asociadoA };
        }
        this.provincias$ = this.provinciaService.get({}).pipe(
            cache()
        );
        this.gabinete = this.farmacia.gabineteInyenctables;
        this.laboratorio = this.farmacia.laboratoriosMagistrales;
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
    }

    volver() {
        this.data.emit();
    }

    save() {
        this.farmacia.asociadoA = this.asociado.nombre;
        // si estamos editado una farmacia.
        if (this.farmaciaSeleccionada) {
            const farmaciaUpdate = Object.assign({}, this.farmacia);
            this.farmaciaService.update(this.farmacia.id, farmaciaUpdate).subscribe({
                next: () => this.plex.toast('success', 'Farmacia editada con éxito.'),
                error: () => this.plex.toast('danger', 'Error al editar la farmacia.')
            });
        } else {
            // si estamos creando una farmacia nueva.
            this.farmaciaService.create(this.farmacia).subscribe({
                next: () => this.plex.toast('success', 'Farmacia creada con éxito.'),
                error: () => this.plex.toast('danger', 'Error al crear la farmacia.')
            });
        }
        this.volver();
    }

    removeElement(tipo, i) {
        if (i >= 0) {
            (tipo === 'auxiliar') ? this.farmacia.farmaceuticosAuxiliares.splice(i, 1) : this.farmacia.contactos.splice(i, 1);
        }
    }

    addDia() {
        const indexUltimo = this.farmacia.horarios.length - 1;
        if (this.farmacia.horarios[indexUltimo].dia !== '') {
            this.farmacia.horarios.push({ dia: '' });
        } else {
            this.plex.toast('info', 'Debe completar los campos anteriores.');
        }
    }

    removeDia(i) {
        if (i >= 0) {
            this.farmacia.horarios.splice(i, 1);
        }
    }

    loadLocalidades(provincia) {
        if (provincia) {
            this.localidades$ = this.localidadService.getXProvincia(provincia.id).pipe(
                cache()
            );
        } else {
            this.farmacia.domicilio.ubicacion.localidad = null;
            this.farmacia.domicilio.valor = null;
        }
    }

    loadDireccion(localidad) {
        if (localidad) {
            this.farmacia.domicilio.valor = null;
        }
    }

    addContacto() {
        const contactos = this.farmacia.contactos;
        const ultimoContacto = contactos[contactos.length - 1];

        if (!contactos.length || ultimoContacto.valor) {
            contactos.push({
                tipo: null,
                valor: '',
                activo: true
            });
        } else {
            this.plex.toast('info', 'Debe completar los campos anteriores.');
        }
    }

    addFarmaceutico() {
        const auxiliares = this.farmacia.farmaceuticosAuxiliares;
        const ultimoAuxiliar = auxiliares[auxiliares.length - 1];
        if (!auxiliares.length || (ultimoAuxiliar.farmaceutico && ultimoAuxiliar.matricula && ultimoAuxiliar.disposicionAlta)) {
            auxiliares.push({
                farmaceutico: null,
                matricula: null,
                disposicionAlta: null
            });
        } else {
            this.plex.toast('info', 'Debe completar los campos anteriores.');
        }
    }

    contactoTelefonico(index) {
        if (typeof this.farmacia.contactos[index].tipo === 'string') {
            return this.farmacia.contactos[index].tipo;
        }
        return this.farmacia.contactos[index].tipo.id;
    }

    formatoCuit(event: any): void {
        let cuit = event.target.value.replace(/\D/g, '');

        if (cuit.length > 2) {
            cuit = cuit.slice(0, 2) + '-' + cuit.slice(2);
        }
        if (cuit.length > 11) {
            cuit = cuit.slice(0, 11) + '-' + cuit.slice(11, 12);
        }

        this.farmacia.cuit = cuit;
    }
}
