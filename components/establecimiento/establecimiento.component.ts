import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { Observable } from 'rxjs/Rx';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

@Component({
    selector: 'establecimientos',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimiento.html'
})
export class EstablecimientoComponent implements OnInit {
    showcreate:boolean = false;
    establecimientos: IEstablecimiento[];
    searchForm: FormGroup;
    
    constructor(private formBuilder:FormBuilder,private establecimientoService: EstablecimientoService){}

    ngOnInit() {
        this.searchForm = this.formBuilder.group({
            codigoSisa: [''],
            nombre: ['']
        });
    
        this.searchForm.valueChanges.subscribe((value) => {
            console.log(value.codigoSisa + " --- " + value.nombre);
            this.establecimientos = this.establecimientos.filter(e => e.codigo.sisa.toString().indexOf(value.codigoSisa) > -1);
        })

        this.loadEstablecimientos();
    }

    loadEstablecimientos() {
        debugger;
        this.establecimientoService.get()
                               .subscribe(
                               establecimientos => {debugger; this.establecimientos = establecimientos }, //Bind to view
                                err => {
                                    if(err){
                                        console.log(err);
                                    }
                                });
                                 
    }

    onReturn(objEstablecimiento:IEstablecimiento):void{
        this.showcreate = false;
        this.establecimientos.push(objEstablecimiento);
    }

}