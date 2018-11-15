import { from } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Input, Component, OnInit } from '@angular/core';
import { IHojaTrabajo } from './../../../interfaces/practica/hojaTrabajo/IHojaTrabajo';


@Component({
    selector: 'grilla-hojatrabajo',
    templateUrl: './grilla-hojatrabajo.html'
})
export class GrillaHojatrabajoComponent implements OnInit {
    // Protocolos.ejecucion
    public beers = [
        { id: 27, description: '00001-CR18' },
        { id: 28, description: '00125-ZP18' },
        { id: 29, description: '00002-CR18' }];

    // Practicas
    public characteristics = [
        { id: 3, description: 'ABV' },
        { id: 4, description: 'IBU' },
        { id: 5, description: 'Calories' },
        { id: 6, description: 'Reviews' }];

    // Resultados
    public crossData = [
        { beerId: 27, characteristicId: 3, value: 10 },
        { beerId: 27, characteristicId: 4, value: 70 },
        { beerId: 27, characteristicId: 5, value: 300 },
        { beerId: 27, characteristicId: 6, value: 3419 },
        { beerId: 28, characteristicId: 3, value: 11 },
        { beerId: 28, characteristicId: 4, value: 70 },
        { beerId: 28, characteristicId: 5, value: 336 },
        { beerId: 28, characteristicId: 6, value: 2949 },
        { beerId: 29, characteristicId: 3, value: 6 },
        { beerId: 29, characteristicId: 4, value: 50 },
        { beerId: 29, characteristicId: 5, value: 186 },
        { beerId: 29, characteristicId: 6, value: 1454 }];

    @Input() hojaTrabajo: IHojaTrabajo;
    constructor() { }

    ngOnInit() {
    }

    getCrossDataRow = function (beerId, charId) {
        console.log('beerId, charId: ', beerId, charId);

        const source = from(this.crossData);
        const example = source.pipe(filter((x: any) => x.beerId === beerId && x.characteristicId === charId));
        return example.subscribe(val => {});)
        // return filter(this.crossData, { beerId: beerId, characteristicId: charId })[0];
    };

}
