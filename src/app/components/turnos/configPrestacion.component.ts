import { IPrestacion } from './../../interfaces/IPrestacion';
import { IConfigPrestacion } from './../../interfaces/IConfigPrestacion';
import { PlexService } from 'andes-plex/src/lib/core/service';
import { PlexValidator } from 'andes-plex/src/lib/core/validator.service';
import { Component, Output,EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Rx';
import { ConfigPrestacionService } from '../../services/configPrestacion.service';
@Component({
    templateUrl: 'configPrestacion.html',
})
export class ConfigPrestacionComponent {
    @Output() data: EventEmitter<IConfigPrestacion> = new EventEmitter<IConfigPrestacion>();
    private form1: FormGroup;
    private form2: FormGroup;
    public modelo2 : any;
    configuraciones: IConfigPrestacion;
    
    constructor(private formBuilder: FormBuilder, public plex: PlexService, public servicio: ConfigPrestacionService) { }

    ngOnInit() {
        this.form1 = this.formBuilder.group({
            deldiaAccesoDirecto: false,
            deldiaReservado: false,
            deldiaAutocitado: false,
            programadosAccesoDirecto:false,
            programadosReservado: false,
            programadosAutocitado: false,
            prestacion: null
        });

        this.form2 = this.formBuilder.group({
           prestacion: {}
        });
        
        this.form2.valueChanges.subscribe((value) => {
            this.modelo2 = value.prestacion;
            alert('traer todo');
            // this.servicio.getConfig(this.modelo2.id)
            // .subscribe(
            // configuraciones => this.configuraciones = configuraciones, //Bind to view
            // err => {
            //     if (err) {
            //         console.log(err);
            //     }
            // });
        });

    }

    onClick(model: IConfigPrestacion, isvalid: boolean){
        if(isvalid){
            let estOperation:Observable<IConfigPrestacion>;
            model.prestacion = {"id":this.modelo2.id, "nombre":this.modelo2.nombre};
            
            estOperation = this.servicio.post(model);
            estOperation.subscribe(resultado => this.data.emit(resultado));
        }else{
            alert("Complete datos obligatorios");
        }
    }

    loadData(event) {
        this.servicio.get(event.query).subscribe(event.callback);       
    }

}
