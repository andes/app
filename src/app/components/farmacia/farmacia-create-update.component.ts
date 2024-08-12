import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IFarmacia } from 'src/app/interfaces/IFarmacia';
import { Plex } from '@andes/plex';
import { FarmaciaService } from 'src/app/services/farmacia.service';
import { Observable, map } from 'rxjs';
import { IPais } from 'src/app/interfaces/IPais';
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
        farmaceuticosAuxiliares: [{
            farmaceutico: '',
            matricula: '',
            disposicionAlta: '',
        }],
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
        contactos: [
            {
                tipo: '',
                valor: '',
                activo: true
            }
        ],
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
        disposiciones: [{
            numero: '',
            descripcion: '',
        }],
        sancion: [{
            numero: '',
            descripcion: '',
        }]
    }

    public validado = false;
    public listadoFarmacia$: Observable<IFarmacia[]>;
    public paises$: Observable<IPais[]>;
    public provincias$: Observable<IProvincia[]>;
    public localidades$: Observable<ILocalidad[]>;
    public paisCargado;
    public gabinete = false;
    public laboratorio = false;
    public diaHorario;
    public tipoComunicacion;
    patronContactoCelular = /^[0-9]{3,4}[0-9]{6}$/;
    patronContactoFijo = /^[0-9]{7}$/;
    patronContactoAlfabetico = /^[-\w.%+]{1,61}@[a-z]+(.[a-z]+)+$/;

    constructor(
        private plex: Plex,
        public farmaciaService: FarmaciaService,
        public paisService: PaisService,
        public provinciaService: ProvinciaService,
        public localidadService: LocalidadService
    ) { }

    ngOnInit() {
        // console.log(this.farmaciaSeleccionada);
        if (this.farmaciaSeleccionada) {
            this.farmacia = this.farmaciaSeleccionada;
        }
        this.paises$ = this.paisService.get({}).pipe(
            cache()
        );
        this.provincias$ = this.provinciaService.get({}).pipe(
            cache()
        );
        this.gabinete = this.farmacia.gabineteInyenctables;
        this.laboratorio = this.farmacia.laboratoriosMagistrales;
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        console.log(this.farmacia);
    }

    volver() {
        this.data.emit();
    }

    save() {
        // si estamos editado
        if (this.farmaciaSeleccionada) {
            const farmaciaUpdate = Object.assign({}, this.farmacia);
            return this.farmaciaService.update(this.farmacia.id, farmaciaUpdate).subscribe(() => {
                this.plex.info('success', 'Farmacia editada con éxito');
                this.volver();
            });
        } else {
            // Si ingresamos una farmacia nueva
            const nuevaFarmacia = Object.assign({}, this.farmacia);
            console.log(this.farmacia);
            return this.farmaciaService.create(this.farmacia).subscribe(() => {
                this.plex.info('success', 'Farmacia creada con éxito.');
                this.volver();
            });
        }
    }

    addFarmaceutico() {
        const indexUltimo = this.farmacia.farmaceuticosAuxiliares.length - 1;
        const ultimoAuxiliar = this.farmacia.farmaceuticosAuxiliares[indexUltimo];
        if (ultimoAuxiliar.farmaceutico && ultimoAuxiliar.matricula && ultimoAuxiliar.disposicionAlta) {
            const nuevoFarmaceutico = Object.assign({}, {
                farmaceutico: null,
                matricula: null,
                disposicionAlta: null
            });
            this.farmacia.farmaceuticosAuxiliares.push(nuevoFarmaceutico);
        } else {
            this.plex.toast('info', 'Debe completar los campos anteriores.');
        }
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
        const indexUltimo = this.farmacia.contactos.length - 1;
        if (this.farmacia.contactos[indexUltimo].valor) {
            const nuevoContacto = Object.assign({}, {
                tipo: 'email',
                valor: '',
                activo: true
            });
            this.farmacia.contactos.push(nuevoContacto);
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

}