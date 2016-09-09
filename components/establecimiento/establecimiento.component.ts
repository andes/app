import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import {Control, FORM_DIRECTIVES} from '@angular/common';

@Component({
    selector: 'establecimientos',
    directives: [REACTIVE_FORM_DIRECTIVES, FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimiento.html'
})
export class EstablecimientoComponent implements OnInit {
    showcreate: boolean = false;
    establecimientos: IEstablecimiento[];
    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder, private establecimientoService: EstablecimientoService) {
       
    }


    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });

        this.searchForm.valueChanges.debounceTime(200).subscribe((value) => {
            let codSisa = value.codigoSisa ? value.codigoSisa: ""
            this.loadEstablecimientosFiltrados(codSisa,value.nombre);
        })

        this.loadEstablecimientos();
    }

    loadEstablecimientos() {

        this.establecimientoService.get()
            .subscribe(
            establecimientos => this.establecimientos = establecimientos, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    loadEstablecimientosFiltrados(codigoSisa: string,nombre: String){
         this.establecimientoService.getByTerm(codigoSisa,nombre)
            .subscribe(
            establecimientos => this.establecimientos = establecimientos, //Bind to view
            err => {
                if (err) {
                    console.log(err);
                }
            });
    }

    onReturn(objEstablecimiento: IEstablecimiento): void {
        this.showcreate = false;
        this.establecimientos.push(objEstablecimiento);
    }


}