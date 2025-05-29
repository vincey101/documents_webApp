import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ManagePositionComponent } from '../manage-position/manage-position.component';
import { Direction } from '@angular/cdk/bidi';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Position } from '@core/domain-classes/position';
import { TranslationService } from '@core/services/translation.service';
import { PositionStore } from '../store/position-store';
import { BaseComponent } from 'src/app/base.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-position-list',
  templateUrl: './position-list.component.html',
  styleUrls: ['./position-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class PositionListComponent extends BaseComponent {
  columnsToDisplay: string[] = ['subposition', 'action', 'name'];
  subPositionColumnToDisplay: string[] = ['action', 'name'];
  expandedElement: Position | null;
  direction: Direction;
  positionStore = inject(PositionStore);

  constructor(
    private dialog: MatDialog,
    private commonDialogService: CommonDialogService,
    private cd: ChangeDetectorRef,
    private translationService: TranslationService
  ) {
    super();
    this.getLangDir();
  }

  ngOnInit() {
    // Load position data from the API
    this.positionStore.loadByPosition();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
  }

  toggleRow(element: Position) {
    if (element == this.expandedElement) {
      this.expandedElement = null;
      this.cd.detectChanges();
      return;
    }
    this.positionStore.loadbyChildPosition(element.id);
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  managePosition(position: Position): void {
    const dialogRef = this.dialog.open(ManagePositionComponent, {
      width: '400px',
      data: Object.assign({}, position),
    });
  }

  addSubPosition(position: Position) {
    this.managePosition({
      id: '',
      description: '',
      name: '',
      parentId: position.id,
    });
  }

  deletePosition(position: Position): void {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(this.translationService.getValue(`ARE_YOU_SURE_YOU_WANT_TO_DELETE`), position.name)
      .subscribe((isTrue) => {
        if (isTrue) {
          this.positionStore.deletePositionById(position.id)
        }
      });
  }

  refresh() {
    this.positionStore.loadByPosition();
  }
} 