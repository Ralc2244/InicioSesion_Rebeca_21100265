import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoCompletadoComponent } from './pago-completado.component';

describe('PagoCompletadoComponent', () => {
  let component: PagoCompletadoComponent;
  let fixture: ComponentFixture<PagoCompletadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoCompletadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagoCompletadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
