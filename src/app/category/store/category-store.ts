import { computed, inject } from "@angular/core";
import { toObservable } from "@angular/core/rxjs-interop";
import { Category } from "@core/domain-classes/category";
import { CommonError } from "@core/error-handler/common-error";
import { CategoryService } from "src/app/category/category.service";
import { TranslationService } from "@core/services/translation.service";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ToastrService } from "ngx-toastr";
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from "rxjs";

type CategoryState = {
    categories: Category[];
    childCategories: Category[];
    isAddUpdate: boolean;
    loadList: boolean;
    commonError: CommonError;
};

export const initialCategoryState: CategoryState = {
    categories: [],
    childCategories: [],
    isAddUpdate: false,
    loadList: true,
    commonError: null,
};

export const CategoryStore = signalStore(
    { providedIn: 'root' },
    withState(initialCategoryState),
    withComputed((store) => ({
        rootCategories: computed(() => store.categories().filter((c) => c.parentId === null)),
    })),
    withMethods(
        (
            store,
            categoryService = inject(CategoryService),
            toastrService = inject(ToastrService),
            translationService = inject(TranslationService)
        ) => ({
            loadByCategory: rxMethod<void>(
                pipe(
                    debounceTime(300),
                    switchMap(() =>
                        categoryService.getAllCategoriesForDropDown().pipe(
                            tapResponse({
                                next: (categories: Category[]) => {
                                    let allCategories: Category[] = [];
                                    setDeafLevel(allCategories, [...categories]);
                                    patchState(store, {
                                        categories: [...allCategories],
                                        commonError: null,
                                        loadList: false,
                                    });
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            loadbyChildCategory: rxMethod<string>(
                pipe(
                    tap((parentId: string) => {
                        patchState(store, { childCategories: store.categories().filter((c) => c.parentId === parentId) });
                    })
                )
            ),
            addCategory: rxMethod<Category>(
                pipe(
                    tap(() => patchState(store, { loadList: false })),
                    switchMap((category: Category) =>
                        categoryService.add(category).pipe(
                            tapResponse({
                                next: () => {
                                    toastrService.success(translationService.getValue('CATEGORY_SAVE_SUCCESSFULLY'));
                                    patchState(store, { isAddUpdate: true, loadList: true });
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            updateCategory: rxMethod<Category>(
                pipe(
                    switchMap((category: Category) =>
                        categoryService.update(category).pipe(
                            tapResponse({
                                next: (res: Category) => {
                                    const updateCategory = res as Category;
                                    toastrService.success(translationService.getValue('CATEGORY_SAVE_SUCCESSFULLY'));
                                    patchState(store, {
                                        isAddUpdate: true,
                                        categories: store.categories().map((category) => updateCategory.id === category.id ? updateCategory : category),
                                    });
                                    if (updateCategory.parentId) {
                                        const updatedCategories = [...store.categories()];
                                        setDeafLevel([], updatedCategories);
                                        patchState(store, { childCategories: updatedCategories.filter((c) => c.parentId === updateCategory.parentId) });
                                    }
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            deleteCategoryById: rxMethod<string>(
                pipe(
                    distinctUntilChanged(),
                    tap(() => patchState(store, { loadList: false })),
                    switchMap((categoryId: string) =>
                        categoryService.delete(categoryId).pipe(
                            tapResponse({
                                next: () => {
                                    toastrService.success(translationService.getValue('CATEGORY_DELETED_SUCCESSFULLY'));
                                    patchState(store, { loadList: true });
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            resetFlag() {
                patchState(store, { isAddUpdate: false });
            }
        })
    ),
    withHooks({
        onInit(store) {
            toObservable(store.loadList).subscribe((flag) => {
                if (flag) {
                    store.loadByCategory();
                }
            });
        },
    })
);

export function setDeafLevel(allCategories: Category[], categories: Category[], parent?: Category, parentId?: string) {
    const children = categories.filter((c) => c.parentId == parentId);
    if (children.length > 0) {
        children.map((c, index) => {
            c.deafLevel = parent ? parent.deafLevel + 1 : 0;
            c.index =
                (parent ? parent.index : 0) + index * Math.pow(0.1, c.deafLevel);
            allCategories.push(c);
            setDeafLevel(allCategories, categories, c, c.id);
        });
    }
    return parent;
}
