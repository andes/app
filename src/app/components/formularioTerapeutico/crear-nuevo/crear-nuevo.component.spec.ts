import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearNuevoComponent } from './crear-nuevo.component';

describe('CrearNuevoComponent', () => {
  let component: CrearNuevoComponent;
  let fixture: ComponentFixture<CrearNuevoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearNuevoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearNuevoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
