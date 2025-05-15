import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, pipe, switchMap, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { CommonError } from '@core/error-handler/common-error';
import { TranslationService } from '@core/services/translation.service';
import { SecurityService } from '@core/security/security.service';
import { ClientService } from './client.service';
import { Client } from '@core/domain-classes/client';

type ClientState = {
  clients: Client[];
  client: Client;
  isLoading: boolean;
  loadList: boolean;
  isAddUpdate: boolean;
  commonError: CommonError;
};

export const initialClientState: ClientState = {
  clients: [],
  client: null,
  isLoading: false,
  loadList: false,
  isAddUpdate: false,
  commonError: null,
};

export const ClientStore = signalStore(
  { providedIn: 'root' },
  withState(initialClientState),
  withComputed(({}) => ({})),
  withMethods(
    (
      store,
      clientService = inject(ClientService),
      toastrService = inject(ToastrService),
      translationService = inject(TranslationService)
    ) => ({
      loadClients: rxMethod<void>(
        pipe(
          debounceTime(300),
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            clientService.getClients().pipe(
              tapResponse({
                next: (clients: Client[]) => {
                  patchState(store, {
                    clients: [...clients],
                    isLoading: false,
                    commonError: null,
                  });
                },
                error: (err: CommonError) => {
                  patchState(store, { commonError: err, isLoading: false });
                },
              })
            )
          )
        )
      ),
      deleteClientById: rxMethod<string>(
        pipe(
          distinctUntilChanged(),
          tap(() => patchState(store, { isLoading: true })),
          switchMap((clientId: string) =>
            clientService.deleteClient(clientId).pipe(
              tapResponse({
                next: () => {
                  toastrService.success(
                    translationService.getValue('CLIENT_DELETED_SUCCESSFULLY')
                  );
                  patchState(store, {
                    clients: store.clients().filter((w) => w.id !== clientId),
                    isLoading: false,
                  });
                },
                error: (err: CommonError) => {
                  patchState(store, { commonError: err, isLoading: false });
                },
              })
            )
          )
        )
      ),
      addUpdateClient: rxMethod<Client>(
        pipe(
          distinctUntilChanged(),
          tap(() => patchState(store, { isLoading: true })),
          switchMap((client: Client) => {
            if (client.id) {
              return clientService.updateClient(client).pipe(
                tapResponse({
                  next: (response) => {
                    const updatedClient = response as Client;
                    toastrService.success(
                      translationService.getValue('CLIENT_UPDATED_SUCCESSFULLY')
                    );
                    patchState(store, {
                      isLoading: false,
                      isAddUpdate: true,
                      clients: store.clients().map((client) => client.id === updatedClient.id ? updatedClient : client),
                    });
                  },
                  error: (err: CommonError) => {
                    patchState(store, { commonError: err, isLoading: false });
                  },
                })
              );
            } else {
              return clientService.addClient(client).pipe(
                tapResponse({
                  next: () => {
                    toastrService.success(
                      translationService.getValue('CLIENT_CREATED_SUCCESSFULLY')
                    );
                    patchState(store, {
                      isLoading: false,
                      loadList: true,
                      isAddUpdate: true,
                    });
                  },
                  error: (err: CommonError) => {
                    patchState(store, { commonError: err, isLoading: false });
                  },
                })
              );
            }
          })
        )
      ),
      getClientById: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap((clientId: string) =>
            clientService.getClient(clientId).pipe(
              tapResponse({
                next: (client: Client) => {
                  patchState(store, {
                    client: client,
                    isLoading: false,
                    commonError: null,
                  });
                },
                error: (err: CommonError) => {
                  patchState(store, { commonError: err, isLoading: false });
                },
              })
            )
          )
        )
      ),
      resetFlag(){
        patchState(store, { isAddUpdate: false });
      }
    })
  ),
  withHooks({
    onInit(store, securityService = inject(SecurityService)) {
      toObservable(store.loadList).subscribe((flag) => {
        if (flag) {
          store.loadClients();
        }
      });
      if (
        securityService.isUserAuthenticate() &&
        securityService.hasClaim('all_documents_view_documents')
      ) {
        store.loadClients();
      }
    },
  })
);
