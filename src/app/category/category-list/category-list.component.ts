import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ManageCategoryComponent } from '../manage-category/manage-category.component';
import { Direction } from '@angular/cdk/bidi';
import { MatDialog } from '@angular/material/dialog';
import { CommonDialogService } from '@core/common-dialog/common-dialog.service';
import { Category } from '@core/domain-classes/category';
import { TranslationService } from '@core/services/translation.service';
import { CategoryStore } from '../store/category-store';
import { BaseComponent } from 'src/app/base.component';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class CategoryListComponent extends BaseComponent {
  columnsToDisplay: string[] = ['subcategory', 'action', 'name'];
  subCategoryColumnToDisplay: string[] = ['action', 'name'];
  expandedElement: Category | null;
  direction: Direction;
  categoryStore = inject(CategoryStore);

  constructor(
    private dialog: MatDialog,
    private commonDialogService: CommonDialogService,
    private cd: ChangeDetectorRef,
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
    this.categoryStore.loadbyChildCategory(element.id);
    this.expandedElement = this.expandedElement === element ? null : element;
  }

  manageCategory(category: Category): void {
    const dialogRef = this.dialog.open(ManageCategoryComponent, {
      width: '400px',
      data: Object.assign({}, category),
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

  deleteCategory(category: Category): void {
    this.sub$.sink = this.commonDialogService
      .deleteConformationDialog(this.translationService.getValue(`ARE_YOU_SURE_YOU_WANT_TO_DELETE`), category.name)
      .subscribe((isTrue) => {
        if (isTrue) {
          this.categoryStore.deleteCategoryById(category.id)
        }
      });
  }

  refresh() {
    this.categoryStore.loadByCategory();
  }
}
