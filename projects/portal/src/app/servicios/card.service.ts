import { Injectable } from '@angular/core';
import { Card } from '../modelos/card';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { CARDS } from '../mock-data/mock-cards';

@Injectable()

export class CardService {

    constructor(
    ) {
    }

    // Armo menu lateral
    getCards(): Observable<Card[]> {
        return of(CARDS);
    }

    getCard(path: string) {
        return this.getCards().pipe(
            map((cards: Card[]) => cards.find(card => card.path))
        );
    }
}