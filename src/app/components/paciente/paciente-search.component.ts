
import {IPaciente} from './../../interfaces/IPaciente';
import {PacienteService} from './../../services/paciente.service';
import * as enumerados from './../../utils/enumerados';

import {Observable} from 'rxjs/Rx';
import {Component,OnInit,Output,Input,EventEmitter} from '@angular/core';
import {FormBuilder,FormGroup,Validators} from '@angular/forms';
import {} from '@angular/common';


@Component({
    selector: 'pacientesSearch',
    templateUrl: 'pacienteSearch.html'
})
export class PacienteSearchComponent implements OnInit {
    
    error: boolean = false;
    mensaje: string = "";
    pacientes: IPaciente[];
    estados: string[] = [];
    sexos: string[] = [];
    searchForm: FormGroup;
    selectedPaciente: IPaciente;
    
    constructor(private formBuilder: FormBuilder, private pacienteService: PacienteService) {}

    checked: boolean = true;

    ngOnInit() {

        this.sexos = enumerados.getSexo();
        this.estados = enumerados.getEstados();

        this.searchForm = this.formBuilder.group({
            nombre: [''],
            apellido: [''],
            documento: [''],
            sexo: [null],
            estado: [''],
            fechaNacimiento: [null],
            info:['']
        });

    }

    loadPaciente() {
        this.error = false;
        var formulario = this.searchForm.value;
        this.pacienteService.postSearch(formulario.info)
            .subscribe(
                pacientes => {this.pacientes = pacientes}, 
                err => {
                    if (err) {
                        console.log(err);
                        this.error = true;
                        return;
                    }
                });
    }

    findPacientes() {
        //Revisar esta parte
        this.error = false;
        var formulario = this.searchForm.value;
        if ((formulario.info == "")){
            this.error = true;
            this.mensaje = "Debe ingresar información a buscar";
            return;
        }
        this.loadPaciente();
    }

    parseData(data:string){
     
       if(data)
       {
            var datosLector = data.split('"');
            
            //Parseo la fecha para darle el formato adecuado
            var fecha = datosLector[6].split('-');
            var fechaNac = fecha[1]+'/'+fecha[0]+'/'+fecha[2]
            //fin parseo de fecha

            this.searchForm.patchValue(
                {
                    apellido:datosLector[1],
                    nombre:datosLector[2],
                    sexo:datosLector[3],
                    documento:datosLector[4],
                    fechaNacimiento: new Date(fechaNac)
                }
            )
            
        }
    }



}