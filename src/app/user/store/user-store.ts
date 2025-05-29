import { computed, inject } from "@angular/core";
import { User } from "@core/domain-classes/user";
import { CommonError } from "@core/error-handler/common-error";
import { UserService } from "src/app/user/user.service";
import { TranslationService } from "@core/services/translation.service";
import { tapResponse } from "@ngrx/operators";
import { patchState, signalStore, withComputed, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { ToastrService } from "ngx-toastr";
import { debounceTime, pipe, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";

// Define the user position interface based on the actual API response
export interface UserPosition {
    userId: string;
    firstname: string;
    lastname: string;
    email: string;
    positionId: string;
    positionName: string;
}

export interface UserState {
    users: User[];
    userPositions: {
        dept: UserPosition[];
        pst: UserPosition[];
    };
    commonError: CommonError;
}

export const initialUserState: UserState = {
    users: [],
    userPositions: {
        dept: [],
        pst: []
    },
    commonError: null,
};

export const UserStore = signalStore(
    { providedIn: 'root' },
    withState(initialUserState),
    withComputed((store) => ({
        formattedUserPositions: computed(() => {
            return store.userPositions().pst.map(user => ({
                id: user.userId,
                firstName: user.firstname,
                lastName: user.lastname,
                email: user.email,
                positionName: user.positionName,
                displayName: `${user.firstname} ${user.lastname} (${user.positionName})`
            }));
        }),
    })),
    withMethods(
        (
            store,
            userService = inject(UserService),
            httpClient = inject(HttpClient),
            toastrService = inject(ToastrService),
            translationService = inject(TranslationService)
        ) => ({
            loadUsers: rxMethod<void>(
                pipe(
                    debounceTime(300),
                    switchMap(() =>
                        httpClient.get<User[]>('user-dropdown').pipe(
                            tapResponse({
                                next: (users: User[]) => {
                                    patchState(store, {
                                        users: users,
                                        commonError: null
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
            
            loadUserPositions: rxMethod<void>(
                pipe(
                    debounceTime(300),
                    switchMap(() =>
                        httpClient.get<{dept: UserPosition[], pst: UserPosition[]}>('api/user-dropdown').pipe(
                            tapResponse({
                                next: (positions) => {
                                    // Log the response to the console
                                    console.log('User positions from API:', positions);
                                    
                                    patchState(store, {
                                        userPositions: positions,
                                        commonError: null
                                    });
                                    
                                    // Log the formatted array to verify transformation
                                    console.log('Formatted user positions:', 
                                        positions.pst.map(user => ({
                                            id: user.userId,
                                            displayName: `${user.firstname} ${user.lastname} (${user.positionName})`
                                        }))
                                    );
                                },
                                error: (err: CommonError) => {
                                    console.error('Error loading user positions:', err);
                                    patchState(store, { commonError: err });
                                },
                            })
                        )
                    )
                )
            )
        })
    )
); 