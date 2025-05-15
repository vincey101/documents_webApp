import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Category } from '@core/domain-classes/category';
import { CategoryService } from '@core/services/category.service';
import { TranslationService } from '@core/services/translation.service';
import { BaseComponent } from 'src/app/base.component';
import { ManageCategoryComponent } from '../manage-category/manage-category.component';
import { Direction } from '@angular/cdk/bidi';

@Component({
  selector: 'app-category-list-presentation',
  templateUrl: './category-list-presentation.component.html',
  styleUrls: ['./category-list-presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class CategoryListPresentationComponent extends BaseComponent {
  @Input() categories: Category[];
  @Output() addEditCategoryHandler: EventEmitter<Category> =
    new EventEmitter<Category>();
  @Output() deleteCategoryHandler: EventEmitter<string> =
    new EventEmitter<string>();
  columnsToDisplay: string[] = ['subcategory', 'action', 'name'];
  subCategoryColumnToDisplay: string[] = ['action', 'name'];
  subCategories: Category[] = [];
  expandedElement: Category | null;
  direction: Direction;

  constructor(
    private dialog: MatDialog,
    private commonDialogService: CommonDialogService,
    private cd: ChangeDetectorRef,
    private categoryService: CategoryService,
    private translationService: TranslationService
  ) {
    super();
    this.getLangDir();
  }

  getLangDir() {
    this.sub$.sink = this.translationService.lanDir$.subscribe(
      (c: Direction) => (this.direction = c)
    );
  }

  toggleRow(element: Category) {
    if (element == this.expandedElement) {
      this.expandedElement = null;
      this.cd.detectChanges();
      return;
    }
    this.subCategories = [];
    this.categoryService.getSubCategories(element.id).subscribe((subCat) => {
      this.subCategories = subCat;
      this.expandedElement = this.expandedElement === element ? null : element;
      this.cd.detectChanges();
    });
  }

  deleteCategory(category: Category): void {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(
        this.translationService.getValue('ARE_YOU_SURE_YOU_WANT_TO_DELETE'),
        category.name
      )
      .subscribe((isTrue) => {
        if (isTrue) {
          this.deleteCategoryHandler.emit(category.id);
        }
      });
  }

  manageCategory(category: Category): void {
    const dialogRef = this.dialog.open(ManageCategoryComponent, {
      width: '400px',
      data: Object.assign({}, category),
    });

    this.sub$.sink = dialogRef.afterClosed().subscribe((result: Category) => {
      if (result) {
        this.addEditCategoryHandler.emit(result);
      }
    });
  }

  addSubCategory(category: Category) {
    this.manageCategory({
      id: '',
      description: '',
      name: '',
      parentId: category.id,
    });
  }
}
