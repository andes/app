import { BarrioService } from './../../services/barrio.service';
import { IPais } from './../../interfaces/IPais';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { Observable } from 'rxjs/Rx';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { Component, OnInit, Output, EventEmitter, Input, HostBinding } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import * as enumerados from './../../utils/enumerados';
import { PaisService } from './../../services/pais.service';
import { ProvinciaService } from './../../services/provincia.service';
import { LocalidadService } from './../../services/localidad.service';

@Component({
    selector: 'organizacion-create-update',
    templateUrl: 'organizacion-create-update.html'
})
export class OrganizacionCreateUpdateComponent implements OnInit {

    @HostBinding('class.plex-layout') layout = true;  // Permite el uso de flex-box en el componente
    @Input('seleccion') seleccion: IOrganizacion;
    @Output() data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();

    createForm: FormGroup;
    // definición de arreglos
    tipos: ITipoEstablecimiento[];
    tiposcom: String[];
    tipoComunicacion: any[];
    paises: IPais[];
    provincias: IProvincia[];
    todasProvincias: IProvincia[];
    localidades: ILocalidad[];
    todasLocalidades: ILocalidad[];
    barrios: IBarrio[];

    constructor(
        private formBuilder: FormBuilder,
        private organizacionService: OrganizacionService,
        private paisService: PaisService,
        private provinciaService: ProvinciaService,
        private localidadService: LocalidadService,
        private BarrioService: BarrioService,
        private tipoEstablecimientoService: TipoEstablecimientoService
    ) { }

    ngOnInit() {
        this.tiposcom = enumerados.getTipoComunicacion();
        this.tipoComunicacion = enumerados.getObjTipoComunicacion();
        let nombre = this.seleccion ? this.seleccion.nombre : '';
        let nivelComplejidad = this.seleccion ? this.seleccion.nivelComplejidad : '';
        let sisa = this.seleccion ? this.seleccion.codigo.sisa : '';
        let cuie = this.seleccion ? this.seleccion.codigo.cuie : '';
        let remediar = this.seleccion ? this.seleccion.codigo.remediar : '';
        let tipoEstablecimiento = this.seleccion ? this.seleccion.tipoEstablecimiento : '';
        let valor = this.seleccion ? this.seleccion.direccion.valor : '';
        let pais = this.seleccion ? this.seleccion.direccion.ubicacion.pais : '';
        let provincia = this.seleccion ? this.seleccion.direccion.ubicacion.provincia : '';
        let localidad = this.seleccion ? this.seleccion.direccion.ubicacion.localidad : '';
        let codigoPostal = this.seleccion ? this.seleccion.direccion.codigoPostal : '';

        this.createForm = this.formBuilder.group({
            nombre: [nombre, Validators.required],
            nivelComplejidad: [nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [sisa, Validators.required],
                cuie: [cuie],
                remediar: [remediar],
            }),
            tipoEstablecimiento: [tipoEstablecimiento],
            direccion: this.formBuilder.group({
                valor: [valor],
                ubicacion: this.formBuilder.group({
                    pais: [pais],
                    provincia: [provincia],
                    localidad: [localidad]
                }),
                ranking: [''],
                codigoPostal: [codigoPostal],
                latitud: [''],
                longitud: [''],
                activo: [true]
            }),
            // telecom: this.formBuilder.array([]),
            contacto: this.formBuilder.array([]),
            edificio: this.formBuilder.array([])
        });

        if (this.seleccion) {
            this.loadContactos();
            /*this.seleccion.telecom.forEach(element => {
                this.addTelecom(element);
            });*/
            this.loadEdificios();
        }
    }

    /*Código de contactos*/

    initContacto(rank: Number) {
        // Inicializa contacto
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: ['', Validators.required],
            valor: ['', Validators.required],
            ranking: [rank],
            ultimaActualizacion: [fecha],
            activo: [true]
        });
    }

    addContacto() {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.push(this.initContacto(control.length + 1));
    }

    removeContacto(indice: number) {
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(indice);
    }

    setContacto(cont: any) {
        let tipo = cont ? enumerados.getObjeto(cont.tipo) : null;
        return this.formBuilder.group({
            tipo: [tipo, Validators.required],
            valor: [cont.valor, Validators.required],
            ranking: [cont.ranking],
            ultimaActualizacion: [cont.ultimaActualizacion],
            activo: [cont.activo]
        });
    }

    loadContactos() {
        let cantidadContactosActuales = this.seleccion.contacto.length;
        const control = <FormArray>this.createForm.controls['contacto'];

        if (cantidadContactosActuales > 0) {
            for (let i = 0; i < cantidadContactosActuales; i++) {
                let contacto: any = this.seleccion.contacto[i];
                control.push(this.setContacto(contacto));
            }
        } else {
            control.push(this.initContacto(1));
        }
    }

    /*Cod. edificio*/

    loadEdificios() {
        this.seleccion.edificio.forEach(element => {
            this.addEdificio(element, 'previo');
        });
    }
    addEdificio(unEdificio, tipo) {
        // agrega formContacto 
        const control = <FormArray>this.createForm.controls['edificio'];
        control.push(this.iniEdificio(unEdificio, 'nuevo'));
    }

    iniEdificio(unEdificio, tipo) {
        // Inicializa edificio
        if (tipo !== 'nuevo') {
            return this.formBuilder.group({
                id: unEdificio.id,
                _id: unEdificio.id,
                descripcion: unEdificio.descripcion,
                direccion: this.formBuilder.group({
                    valor: unEdificio.direccion ? unEdificio.direccion.valor : [''],
                    ubicacion: this.formBuilder.group({
                        pais: unEdificio.direccion ? unEdificio.direccion.ubicacion.pais :
                            this.seleccion ? this.seleccion.direccion.ubicacion.pais : [''],
                        provincia: unEdificio.direccion ? unEdificio.direccion.ubicacion.provincia :
                            this.seleccion ? this.seleccion.direccion.ubicacion.provincia : [''],
                        localidad: unEdificio.direccion ? unEdificio.direccion.ubicacion.localidad :
                            this.seleccion ? this.seleccion.direccion.ubicacion.localidad : ['']
                    }),
                    ranking: unEdificio.direccion ? unEdificio.direccion.ranking : [''],
                    codigoPostal: unEdificio.direccion ? unEdificio.direccion.codigoPostal :
                        this.seleccion ? this.seleccion.direccion.codigoPostal : [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                }),
                telefono: this.formBuilder.group({
                    tipo: unEdificio.telefono ? unEdificio.telefono.tipo : [''],
                    valor: unEdificio.telefono ? unEdificio.telefono.valor : [''],
                    ranking: unEdificio.telefono ? unEdificio.telefono.ranking : [''],
                    activo: unEdificio.telefono ? unEdificio.telefono.activo : [''],
                }),
            });
        } else {
            return this.formBuilder.group({
                descripcion: unEdificio.descripcion,
                direccion: this.formBuilder.group({
                    valor: unEdificio.direccion ? unEdificio.direccion.valor : [''],
                    ubicacion: this.formBuilder.group({

                        pais: unEdificio.direccion ? unEdificio.direccion.ubicacion.pais : this.seleccion ?
                            this.seleccion.direccion.ubicacion.pais : [''],
                        provincia: unEdificio.direccion ? unEdificio.direccion.ubicacion.provincia : this.seleccion ?
                            this.seleccion.direccion.ubicacion.provincia : [''],
                        localidad: unEdificio.direccion ? unEdificio.direccion.ubicacion.localidad : this.seleccion ?
                            this.seleccion.direccion.ubicacion.localidad : ['']
                    }),
                    ranking: unEdificio.direccion ? unEdificio.direccion.ranking : [''],
                    codigoPostal: unEdificio.direccion ? unEdificio.direccion.codigoPostal : this.seleccion ?
                        this.seleccion.direccion.codigoPostal : [''],
                    latitud: [''],
                    longitud: [''],
                    activo: [true]
                }),
                telefono: this.formBuilder.group({
                    tipo: unEdificio.telefono ? unEdificio.telefono.tipo : [''],
                    valor: unEdificio.telefono ? unEdificio.telefono.valor : [''],
                    ranking: unEdificio.telefono ? unEdificio.telefono.ranking : [''],
                    activo: unEdificio.telefono ? unEdificio.telefono.activo : [''],
                }),
            });
        }

    }

    removeEdificio(i: number) {
        // elimina formContacto
        const control = <FormArray>this.createForm.controls['edificio'];
        control.removeAt(i);
    }

    loadTipos(event) {
        this.tipoEstablecimientoService.get().subscribe(event.callback);
    }

    /*Código de filtrado de combos*/
    loadPaises(event) {
        this.paisService.get({}).subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        this.provinciaService.get({ pais: pais.value.id }).subscribe(event.callback);
    }

    loadLocalidades(event, provincia) {
        this.localidadService.get({ provincia: provincia.value.id }).subscribe(event.callback);
    }

    onSave(model: any, isvalid: boolean) {
        if (isvalid) {
            let guardar: Observable<IOrganizacion>;
            model.activo = true;
            model.contacto = model.contacto.map(elem => { elem.tipo = elem.tipo.id; return elem; })
            model.edificio = model.edificio.map(elem => { return elem; })
            if (this.seleccion) {
                model.id = this.seleccion.id;
                guardar = this.organizacionService.put(model);
            } else {
                guardar = this.organizacionService.post(model);
            }
            guardar.subscribe(resultado => { this.data.emit(resultado); });
        } else {
            alert('Complete datos obligatorios');
        }
    }

    onCancel() {
        window.setTimeout(() => this.data.emit(null), 100);
    }
}
