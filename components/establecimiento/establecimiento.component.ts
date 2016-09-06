import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Establecimiento } from './establecimiento';

@Component({
    selector: 'establecimientos',
    templateUrl: 'components/establecimiento/establecimiento.html'
})
export class EstablecimientoComponent implements OnInit {

   establecimientos: Array<any>;

    searchForm: FormGroup;

    constructor(private formBuilder: FormBuilder) {}

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });

        this.establecimientos = [{codigoSisa: 32131,nombre: "ddsfdsfdsf"},
        {codigoSisa: 534534,nombre: "bbbbbbbbbbbbbbbbbbbb"},
        {codigoSisa: 3124134,nombre: "ddddddddddddddddddddd"}];
        
        this.searchForm.valueChanges.subscribe((value) => {
            console.log(value.codigoSisa + " --- " + value.nombre);
        })


    }

}