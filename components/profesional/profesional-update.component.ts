import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
// import { FORM_DIRECTIVES } from '@angular/common';

import { ProfesionalService } from './../../services/profesional.service';
import { ProvinciaService } from './../../services/provincia.service';
import { IProfesional } from './../../interfaces/IProfesional';
import { IMatricula } from './../../interfaces/IMatricula';
import { IProvincia } from './../../interfaces/IProvincia';


@Component({
    selector: 'profesional-update',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/profesional/profesional-update.html'
})
export class ProfesionalUpdateComponent implements OnInit {

    @Input('selectedProfesional') ProfesionalHijo: IProfesional;
    @Output() data: EventEmitter<IProfesional> = new EventEmitter<IProfesional>();

    tipos = ["DNI", "LC", "LE", "PASS"];
    provincias: IProvincia[];
    updateForm: FormGroup;
    localidades: any[] = [];
    myLocalidad: any;
    myProvincia: any;    
    fechaNac: string;
    constructor(private formBuilder: FormBuilder, private provinciaService: ProvinciaService,
        private profesionalService: ProfesionalService) { }

    ngOnInit() {
        //Carga de combos
        this.provinciaService.get()
            .subscribe(resultado => this.provincias = resultado);

        var ultimaDireccion = this.ProfesionalHijo.direccion.length - 1;

        this.provinciaService.getLocalidades(this.ProfesionalHijo.direccion[ultimaDireccion].ubicacion.localidad.nombre)
            .subscribe(resultado => {  this.localidades = resultado[0].localidades; });

        this.fechaNac = this.dateToText(this.ProfesionalHijo.fechaNacimiento);
        this.updateForm = this.formBuilder.group({
            _id: [this.ProfesionalHijo._id],
            nombre: [this.ProfesionalHijo.nombre, Validators.required],
            apellido: [this.ProfesionalHijo.apellido],
            numeroDni: [this.ProfesionalHijo.documento, Validators.required],
            fechaNacimiento: [this.fechaNac],
            domicilios: [this.ProfesionalHijo.direccion],
            // domicilio: this.formBuilder.group({
            //     valor: [this.ProfesionalHijo.direccion[ultimaDireccion].valor, Validators.required],
            //     codigoPostal: [this.ProfesionalHijo.direccion[ultimaDireccion].codigoPostal],
            //     provincia: [this.ProfesionalHijo.direccion[ultimaDireccion].ubicacion.provincia.nombre],
            //     localidad: [this.ProfesionalHijo.direccion[ultimaDireccion].ubicacion.localidad.nombre],
            // }),
            contactos: this.ProfesionalHijo.contacto, //Es un array de datos de contacto
            matriculas: this.formBuilder.array([])
        });

        /*
        this.ProfesionalHijo.matriculas.forEach(element => {
            this.addMatricula(element);
        });
        */

        //this.myLocalidad = this.ProfesionalHijo.domicilio.localidad;
        //this.myProvincia = this.ProfesionalHijo.domicilio.provincia;
    }


    private dateToText(myDate:Date): string {
        if(myDate){
            var fecha1:string = myDate.toString();
            var fecha2 = new Date(Date.parse(fecha1));
            var mes = fecha2.getMonth() + 1;
            var fechaSal = fecha2.getDate().toString() + "/" + mes.toString() + "/" + fecha2.getFullYear().toString();
            return fechaSal;
        }
        else return "";
    }

    private textToDate(myDate): Date {
        debugger;
        var fecha2 = new Date(Date.parse(myDate));
        return fecha2;
    }

    iniMatricula(objMatricula?: IMatricula) {
        // Inicializa matrículas
        debugger;
        if (objMatricula) {
           var fechaIni = this.dateToText(objMatricula.fechaInicio);
           var fechaFin = this.dateToText(objMatricula.fechaVencimiento);

            return this.formBuilder.group({
                numero: [objMatricula.numero, Validators.required],
                descripcion: [objMatricula.descripcion],
                fechaInicio: [fechaIni],
                fechaVencimiento: [fechaFin],
                vigente: [objMatricula.vigente]
            });
        } else {
           
            return this.formBuilder.group({
                numero: ['', Validators.required],
                descripcion: [''],
                fechaInicio: [''],
                fechaVencimiento: [''],
                vigente: [false]
            });
        }
    }

    addMatricula(objMatricula?: IMatricula) {
        // agrega formMatricula 
        const control = <FormArray>this.updateForm.controls['matriculas'];
        control.push(this.iniMatricula(objMatricula));
    }

    removeMatricula(i: number) {
        // elimina formMatricula
        const control = <FormArray>this.updateForm.controls['matriculas'];
        control.removeAt(i);
    }

    onSave(model: IProfesional, isvalid: boolean) {
        /*
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.activo = true;
            
            model.domicilio.localidad = this.myLocalidad;
            var ff = model.fechaNacimiento;
            model.fechaNacimiento = this.textToDate(ff);
            model.matriculas.forEach(e => { e.fechaInicio = this.textToDate(e.fechaInicio);
                                            e.fechaVencimiento = this.textToDate(e.fechaVencimiento);
                                         });

            
            profOperation = this.profesionalService.put(model);
            profOperation.subscribe(resultado => { this.data.emit(resultado); });

        } else {
            alert("Complete datos obligatorios");
        }
        */
    }

    getLocalidades(index) {
        this.localidades = this.provincias[index].localidades;
    }

    onCancel() {
        this.data.emit(null)
    }
}