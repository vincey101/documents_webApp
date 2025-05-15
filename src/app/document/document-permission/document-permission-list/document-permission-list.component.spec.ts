import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocumentPermissionListComponent } from './document-permission-list.component';

describe('DocumentPermissionListComponent', () => {
  let component: DocumentPermissionListComponent;
  let fixture: ComponentFixture<DocumentPermissionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentPermissionListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentPermissionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
