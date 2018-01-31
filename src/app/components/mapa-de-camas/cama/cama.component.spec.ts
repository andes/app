import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CamaComponent } from './cama.component';

describe('CamaComponent', () => {
  let component: CamaComponent;
  let fixture: ComponentFixture<CamaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CamaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CamaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
