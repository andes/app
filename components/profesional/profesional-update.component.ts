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
        //CArga de combos
        this.provinciaService.get()
            .subscribe(resultado => this.provincias = resultado);

        this.provinciaService.getLocalidades(this.ProfesionalHijo.domicilio.provincia)
            .subscribe(resultado => {  this.localidades = resultado[0].localidades; });

        debugger;
        
        this.fechaNac = this.cammbiarFecha(this.ProfesionalHijo.fechaNacimiento);
        this.updateForm = this.formBuilder.group({
            _id: [this.ProfesionalHijo._id],
            nombre: [this.ProfesionalHijo.nombre, Validators.required],
            apellido: [this.ProfesionalHijo.apellido],
            tipoDni: [this.ProfesionalHijo.tipoDni],
            numeroDni: [this.ProfesionalHijo.numeroDni, Validators.required],
            fechaNacimiento: [this.fechaNac],
            domicilio: this.formBuilder.group({
                calle: [this.ProfesionalHijo.domicilio.calle, Validators.required],
                numero: [this.ProfesionalHijo.domicilio.numero],
                provincia: [this.ProfesionalHijo.domicilio.provincia],
                localidad: []
            }),
            telefono: [this.ProfesionalHijo.telefono],
            email: [this.ProfesionalHijo.email],
            matriculas: this.formBuilder.array([])
        });

        debugger;
        this.ProfesionalHijo.matriculas.forEach(element => {
            this.addMatricula(element);
        });

        this.myLocalidad = this.ProfesionalHijo.domicilio.localidad;
        this.myProvincia = this.ProfesionalHijo.domicilio.provincia;
    }


    private cammbiarFecha(myDate:Date): string {
        var fecha1:string = myDate.toString();
        var fecha2 = new Date(Date.parse(fecha1));
        var mes = fecha2.getMonth() + 1;
        var fechaSal = fecha2.getDate().toString() + "/" + mes.toString() + "/" + fecha2.getFullYear().toString();
        return fechaSal;
    }

    iniMatricula(objMatricula?: IMatricula) {
        // Inicializa matrículas
        debugger;
        if (objMatricula) {
           var fechaIni = this.cammbiarFecha(objMatricula.fechaInicio);
           var fechaFin = this.cammbiarFecha(objMatricula.fechaVencimiento);

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
        debugger;
        if (isvalid) {
            let profOperation: Observable<IProfesional>;
            model.habilitado = true;
            model.domicilio.localidad = this.myLocalidad;
            profOperation = this.profesionalService.put(model);
            profOperation.subscribe(resultado => { this.data.emit(resultado); });

        } else {
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
        this.localidades = this.provincias[index].localidades;
    }

    onCancel() {
        this.data.emit(null)
    }
}