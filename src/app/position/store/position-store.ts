import { Position } from '@core/domain-classes/position';
import { PositionService } from '@core/services/position.service';
import { CommonError } from '@core/error-handler/common-error';
import { Injectable, computed, inject, signal } from '@angular/core';
import { signalStore, patchState, withMethods, withState, withComputed } from '@ngrx/signals';
import { ToastrService } from 'ngx-toastr';
import { TranslationService } from '@core/services/translation.service';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { debounceTime, pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';

export interface PositionState {
    positions: Position[];
    childPositions: Position[];
    isAddUpdate: boolean;
    loadList: boolean;
    commonError: CommonError;
}

export const initialPositionState: PositionState = {
    positions: [],
    childPositions: [],
    isAddUpdate: false,
    loadList: true,
    commonError: null,
};

export const PositionStore = signalStore(
    { providedIn: 'root' },
    withState(initialPositionState),
    withComputed((store) => ({
        rootPositions: computed(() => store.positions().filter((c) => c.parentId === null)),
    })),
    withMethods(
        (
            store,
            positionService = inject(PositionService),
            toastrService = inject(ToastrService),
            translationService = inject(TranslationService)
        ) => ({
            loadByPosition: rxMethod<void>(
                pipe(
                    debounceTime(300),
                    switchMap(() =>
                        positionService.getAllPositionsForDropDown().pipe(
                            tapResponse({
                                next: (positions: Position[]) => {
                                    let allPositions: Position[] = [];
                                    setDeafLevel(allPositions, [...positions]);
                                    patchState(store, {
                                        positions: [...allPositions],
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
            loadbyChildPosition: rxMethod<string>(
                pipe(
                    tap((parentId: string) => {
                        patchState(store, { childPositions: store.positions().filter((c) => c.parentId === parentId) });
                    })
                )
            ),
            deletePositionById: rxMethod<string>(
                pipe(
                    switchMap((id: string) =>
                        positionService.delete(id).pipe(
                            tapResponse({
                                next: () => {
                                    const positions = store.positions().filter((c) => c.id != id && c.parentId != id);
                                    patchState(store, { positions: positions, commonError: null });
                                    toastrService.success(translationService.getValue('Position deleted successfully'));
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            addPosition: rxMethod<Position>(
                pipe(
                    switchMap((position: Position) =>
                        positionService.add(position).pipe(
                            tapResponse({
                                next: (position: Position) => {
                                    const positions = [...store.positions()];
                                    let allPositions: Position[] = [];
                                    position.deafLevel = 0;
                                    position.index = 0;
                                    if (position.parentId) {
                                        const parentPosition = store.positions().find(c => c.id === position.parentId);
                                        if (parentPosition) {
                                            position.deafLevel = parentPosition.deafLevel + 1;
                                            position.index = parentPosition.index + positions.length * Math.pow(0.1, position.deafLevel);
                                        }
                                    }
                                    positions.push(position);
                                    setDeafLevel(allPositions, [...positions]);
                                    patchState(store, { positions: [...allPositions], isAddUpdate: true, commonError: null });
                                    toastrService.success(translationService.getValue('POSITION_ADDED_SUCCESSFULLY'));
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            updatePosition: rxMethod<Position>(
                pipe(
                    switchMap((position: Position) =>
                        positionService.update(position).pipe(
                            tapResponse({
                                next: (position: Position) => {
                                    const positions = store.positions().map((c) => {
                                        if (c.id === position.id) {
                                            return position;
                                        }
                                        return c;
                                    });
                                    patchState(store, { positions: positions, isAddUpdate: true, commonError: null });
                                    toastrService.success(translationService.getValue('Position updated successfully'));
                                },
                                error: (err: CommonError) => {
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            ),
            resetFlag: () => {
                patchState(store, { isAddUpdate: false });
            },
        })
    )
);

export function setDeafLevel(positions: Position[], allPositions: Position[], parent?: Position, parentId?: string) {
    const children = allPositions.filter((c) => c.parentId == parentId);
    if (children.length > 0) {
        children.map((c, index) => {
            c.deafLevel = parent ? parent.deafLevel + 1 : 0;
            c.index =
                (parent ? parent.index : 0) + index * Math.pow(0.1, c.deafLevel);
            positions.push(c);
            setDeafLevel(positions, allPositions, c, c.id);
        });
    }
    return parent;
} 