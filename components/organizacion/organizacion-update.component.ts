import { Control } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { OrganizacionService } from './../../services/organizacion.service';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { IOrganizacion } from './../../interfaces/IOrganizacion';


@Component({
    selector: 'organizacion-update',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/organizacion/organizacion-update.html'
})
export class OrganizacionUpdateComponent implements OnInit {

    @Input('selectedOrg') organizacionHijo: IOrganizacion;


    @Output()
    data: EventEmitter<IOrganizacion> = new EventEmitter<IOrganizacion>();

    /*Datos externos que deberían venir de algún servicio*/
    tipos: ITipoEstablecimiento[];
    provincias: IProvincia[];
    updateForm: FormGroup;
    localidades: any[] = [];
    myTipoEst: ITipoEstablecimiento;
    myLocalidad: any;
    myProvincia: any;

    constructor(private formBuilder: FormBuilder, private organizacionService: OrganizacionService,
        private provinciaService: ProvinciaService, private tipoEstablecimientoService: TipoEstablecimientoService) { }

    ngOnInit() {
        //Carga de combos
        this.provinciaService.get()
            .subscribe(resultado => this.provincias = resultado);
        
        // this.provinciaService.getLocalidades(this.organizacionHijo.domicilio.provincia)
        //     .subscribe(resultado => { this.localidades = resultado[0].localidades});
        
        this.tipoEstablecimientoService.get()
                 .subscribe(resultado => {this.tipos = resultado;});

        this.updateForm = this.formBuilder.group({
            nombre: [this.organizacionHijo.nombre, Validators.required],
            nivelComplejidad: [this.organizacionHijo.nivelComplejidad],
            codigo: this.formBuilder.group({
                sisa: [this.organizacionHijo.codigo.sisa, Validators.required],
                cuie: [this.organizacionHijo.codigo.cuie],
                remediar: [this.organizacionHijo.codigo.remediar],
            }),
            // domicilio: this.formBuilder.group({
            //     calle: [this.organizacionHijo.domicilio.calle, Validators.required],
            //     numero: [this.organizacionHijo.domicilio.numero],
            //     provincia: [this.organizacionHijo.domicilio.provincia],
            //     localidad: []
            // }),

            tipoEstablecimiento: ['']
        });

    //    this.myProvincia=  this.organizacionHijo.domicilio.provincia;
          this.myTipoEst = this.organizacionHijo.tipoEstablecimiento;
    //    this.myLocalidad = this.organizacionHijo.domicilio.localidad;
    }

    onSave(model: any, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let estOperation: Observable<IOrganizacion>;
            model.tipoEstablecimiento = this.myTipoEst;
            model.habilitado = this.organizacionHijo.activo;
            model._id = this.organizacionHijo._id;
            model.domicilio.localidad = this.myLocalidad;
            estOperation = this.organizacionService.put(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));

        } else {
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
        //this.localidades = this.provincias[index].localidades;
    }

    onCancel() {
        this.data.emit(null)
    }
}