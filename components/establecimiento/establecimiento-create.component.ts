import { Observable } from 'rxjs/Rx';
import { EstablecimientoService } from './../../services/establecimiento.service';
import { IEstablecimiento } from './../../interfaces/IEstablecimiento';
import { Component, OnInit, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { ITipoEstablecimiento } from './../../interfaces/ITipoEstablecimiento';
import { IProvincia } from './../../interfaces/IProvincia';
import { ProvinciaService } from './../../services/provincia.service';
import { TipoEstablecimientoService } from './../../services/tipoEstablecimiento.service';


@Component({
    selector: 'establecimiento-create',
    directives: [REACTIVE_FORM_DIRECTIVES],
    templateUrl: 'components/establecimiento/establecimiento-create.html'
})
export class EstablecimientoCreateComponent implements OnInit {
@Output() data: EventEmitter<IEstablecimiento> = new EventEmitter<IEstablecimiento>();


    tipos: ITipoEstablecimiento[];
    provincias: IProvincia[];
    createForm: FormGroup;
    localidades: any[]=[];
   

    constructor(private formBuilder: FormBuilder, private establecimientoService: EstablecimientoService,
    private provinciaService: ProvinciaService, private tipoEstablecimientoService: TipoEstablecimientoService) {}

    ngOnInit() {

        this.provinciaService.get()
            .subscribe(resultado => {this.provincias = resultado;
                this.localidades = this.provincias[0].localidades;});

        
        
        this.tipoEstablecimientoService.get()
            .subscribe(resultado => {this.tipos = resultado;});
         
        this.createForm = this.formBuilder.group({
            nombre: ['', Validators.required],
            nivelComplejidad:[''],
            descripcion:['', Validators.required],
            codigo: this.formBuilder.group({
                sisa: ['', Validators.required],
                cuie:[''],
                remediar:[''],
            }),
            domicilio: this.formBuilder.group({
                calle: ['', Validators.required],
                numero:[''],
                provincia: [''],
                localidad: ['']
            }),
            
            tipoEstablecimiento:[''],
        
        });

        
    }
    
    onSave(model: IEstablecimiento, isvalid: boolean){
        if(isvalid){
            let estOperation:Observable<IEstablecimiento>;
            debugger;
            model.habilitado = true;
            estOperation = this.establecimientoService.post(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));

        }else{
            alert("Complete datos obligatorios");
        }
    }

    getLocalidades(index) {
        this.localidades= this.provincias[index].localidades;
    }


    onCancel(){
        this.data.emit(null)
    }

}