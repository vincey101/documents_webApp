import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentByCategoryChartComponent } from './document-by-category-chart.component';

describe('DocumentByCategoryChartComponent', () => {
  let component: DocumentByCategoryChartComponent;
  let fixture: ComponentFixture<DocumentByCategoryChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentByCategoryChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentByCategoryChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
