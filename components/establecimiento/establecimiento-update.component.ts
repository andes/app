import { Control } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { Observable } from 'rxjs/Rx';

import { EstablecimientoService } from './../../services/establecimiento.service';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';

import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { IEstablecimiento } from './../../interfaces/IEstablecimiento';


@Component({
    selector: 'establecimiento-update',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimiento-update.html'
})
export class EstablecimientoUpdateComponent implements OnInit {

    @Input('selectedEst') establecimientoHijo: IEstablecimiento;


    @Output()
    data: EventEmitter<IEstablecimiento> = new EventEmitter<IEstablecimiento>();

    /*Datos externos que deberían venir de algún servicio*/
    tipos: any[];
    provincias: IProvincia[];
    updateForm: FormGroup;
    localidades: any[] = [];
    myTipoEst: ITipoEstablecimiento;
    mylocalidad: any;
    myProvincia: any;

    constructor(private formBuilder: FormBuilder, private establecimientoService: EstablecimientoService,
        private provinciaService: ProvinciaService, private tipoEstablecimientoService: TipoEstablecimientoService) { }

    ngOnInit() {
        //CArga de combos
        this.provinciaService.get()
            .subscribe(resultado => this.provincias = resultado);

        this.provinciaService.getLocalidades(this.establecimientoHijo.domicilio.provincia)
            .subscribe(resultado => this.localidades = resultado.localidades);    
        
        this.updateForm = this.formBuilder.group({
            nombre: [this.establecimientoHijo.nombre, Validators.required],
            nivelComplejidad: [this.establecimientoHijo.nivelComplejidad],
            descripcion: [this.establecimientoHijo.descripcion, Validators.required],
            codigo: this.formBuilder.group({
                sisa: [this.establecimientoHijo.codigo.sisa, Validators.required],
                cuie: [this.establecimientoHijo.codigo.cuie],
                remediar: [this.establecimientoHijo.codigo.remediar],
            }),
            domicilio: this.formBuilder.group({
                calle: [this.establecimientoHijo.domicilio.calle, Validators.required],
                numero: [this.establecimientoHijo.domicilio.numero],
                provincia: [this.establecimientoHijo.domicilio.provincia],
                localidad: [this.establecimientoHijo.domicilio.localidad]
            }),

            tipoEstablecimiento: [this.establecimientoHijo.tipoEstablecimiento]
        });
       this.myProvincia=  this.establecimientoHijo.domicilio.provincia;
       this.myTipoEst = this.establecimientoHijo.tipoEstablecimiento;

       this.tipoEstablecimientoService.get()
            .subscribe(resultado => {this.tipos = resultado; debugger;  this.updateForm.controls['tipoEstablecimiento'].setValue(this.establecimientoHijo.tipoEstablecimiento);} );

    }

    onSave(model: any, isvalid: boolean) {
        debugger;
        if (isvalid) {
            let estOperation: Observable<IEstablecimiento>;
            estOperation = this.establecimientoService.put(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));

        } else {
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
         debugger;
        this.localidades = this.provincias[index].localidades;
    }

    onCancel() {
        this.data.emit(null)
    }
    
    getTipo(tipo){
        debugger;
        
    }


}