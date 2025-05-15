import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentDeepSearchComponent } from './document-deep-search.component';

describe('DocumentDeepSearchComponent', () => {
  let component: DocumentDeepSearchComponent;
  let fixture: ComponentFixture<DocumentDeepSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDeepSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentDeepSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
