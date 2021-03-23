import { Injectable } from '@angular/core';
import { ICard } from '../interfaces/icard';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CARDS } from '../mock-data/mock-cards';

@Injectable()

export class CardService {

    constructor() { }

    // Armo menu lateral
    getCards(): Observable<ICard[]> {
        return of(CARDS);
    }

    getCard(path: string) {
        return this.getCards().pipe(
            map((cards: ICard[]) => cards.find(card => card.path))
        );
    }
}
