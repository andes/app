import { BarrioService } from './../../services/barrio.service';
import { LocalidadService } from './../../services/localidad.service';
import { IPais } from './../../interfaces/IPais';
import { PaisService } from './../../services/pais.service';
import { IBarrio } from './../../interfaces/IBarrio';
import { ILocalidad } from './../../interfaces/ILocalidad';
import { Observable } from 'rxjs/Rx';
import { OrganizacionService } from './../../services/organizacion.service';
import { IOrganizacion } from './../../interfaces/IOrganizacion';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { Plex } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import * as enumerados from './../../utils/enumerados';

@Component({
    selector: 'organizacion-create-update',
    templateUrl: 'organizacion-create-update.html'
})
export class OrganizacionCreateUpdateComponent implements OnInit {
    @Input('selectedOrg') organizacionHijo: IOrganizacion;
    @Output() data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();

    createForm: FormGroup;
    tipos: ITipoEstablecimiento[];
    tiposcom: String[];
    tiposContactos: String[];
    paises: IPais[];
    provincias: IProvincia[];
    todasProvincias: IProvincia[];
    localidades: ILocalidad[];
    todasLocalidades: ILocalidad[];
    barrios: IBarrio[];

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService, private PaisService: PaisService,
        private ProvinciaService: ProvinciaService, private LocalidadService: LocalidadService,
        private BarrioService: BarrioService, private tipoEstablecimientoService: TipoEstablecimientoService) { }

    ngOnInit() {
        this.tiposcom = enumerados.getTipoComunicacion();
        this.tiposContactos = enumerados.getTipoComunicacion();
        let nombre = this.organizacionHijo? this.organizacionHijo.nombre: '';
        let nivelComplejidad = this.organizacionHijo? this.organizacionHijo.nivelComplejidad: '';
        let sisa = this.organizacionHijo? this.organizacionHijo.codigo.sisa: '';
        let cuie = this.organizacionHijo? this.organizacionHijo.codigo.cuie: '';
        let remediar = this.organizacionHijo? this.organizacionHijo.codigo.remediar: '';
        let tipoEstablecimiento = this.organizacionHijo? this.organizacionHijo.tipoEstablecimiento: '';
        let valor = this.organizacionHijo? this.organizacionHijo.direccion[0].valor: '';
        let pais = this.organizacionHijo? this.organizacionHijo.direccion[0].ubicacion.pais: '';
        let provincia = this.organizacionHijo? this.organizacionHijo.direccion[0].ubicacion.provincia: '';
        let localidad = this.organizacionHijo? this.organizacionHijo.direccion[0].ubicacion.localidad: '';
        let codigoPostal = this.organizacionHijo? this.organizacionHijo.direccion[0].codigoPostal: '';
        this.createForm = this.formBuilder.group({
            nombre: [nombre, Validators.required],
            nivelComplejidad: [nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [sisa, Validators.required],
                cuie: [cuie],
                remediar: [remediar],
            }),
            tipoEstablecimiento: [tipoEstablecimiento],
            telecom: this.formBuilder.array([]),
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

            contacto: this.formBuilder.array([]),
        });
        if (this.organizacionHijo){
            this.organizacionHijo.telecom.forEach(element => {
                this.addTelecom(element);
            });
            this.organizacionHijo.contacto.forEach(element => {
                this.addContacto(element);
            });
        }
    }

    addTelecom(unTelecom) {
        const control = <FormArray>this.createForm.controls['telecom'];
        control.push(this.iniTelecom(unTelecom));
    }

    iniTelecom(unTelecom) {
        // Inicializa telecom
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            tipo: unTelecom.tipo,
            valor: unTelecom.valor,
            ranking: unTelecom.ranking,
            activo: unTelecom.activo
        });
    }

    removeTelecom(i: number) {
        // elimina formTelecom
        const control = <FormArray>this.createForm.controls['telecom'];
        control.removeAt(i);
    }

    addContacto(unContacto) {
        // agrega formContacto 
        const control = <FormArray>this.createForm.controls['contacto'];
        control.push(this.iniContacto(unContacto));
    }

    iniContacto(unContacto) {
        // Inicializa contacto
        let cant = 0;
        let fecha = new Date();
        return this.formBuilder.group({
            proposito: unContacto.proposito,
            nombre: unContacto.nombre,
            apellido: unContacto.apellido,
            tipo: unContacto.tipo,
            valor: unContacto.valor,
            activo: unContacto.activo
        });
    }

    removeContacto(i: number) {
        // elimina formContacto
        const control = <FormArray>this.createForm.controls['contacto'];
        control.removeAt(i);
    }

    loadTipos(event) {
        this.tipoEstablecimientoService.get().subscribe(event.callback);
    }

    loadPaises(event) {
        this.PaisService.get().subscribe(event.callback);
    }

    loadProvincias(event, pais) {
        console.log("pais " + pais.value.id);
        this.ProvinciaService.get({ "pais": pais.value.id }).subscribe(event.callback);
    }

    loadLocalidades(event, provincia) {
        console.log("provincia " + provincia.value.id);
        this.LocalidadService.get({ "provincia": provincia.value.id }).subscribe(event.callback);
    }

    onSave(model: IOrganizacion, isvalid: boolean) {
        
        if (isvalid) {
            let estOperation: Observable<IOrganizacion>;
            model.activo = true;
            if (this.organizacionHijo){
                model.id = this.organizacionHijo.id;
                estOperation = this.organizacionService.put(model);
            }
            else
                estOperation = this.organizacionService.post(model);
            
            estOperation.subscribe(resultado => {this.data.emit(resultado);});
        } else {
            alert("Complete datos obligatorios");
        }
    }

    onCancel() {
        window.setTimeout(() => this.data.emit(null), 100);
    }
}