import { inject } from "@angular/core";
import { DocumentStatus } from "@core/domain-classes/document-status";
import { patchState, signalStore, withHooks, withMethods, withState } from "@ngrx/signals";
import { DocumentStatusService } from "../document-status.service";
import { ToastrService } from "ngx-toastr";
import { TranslationService } from "@core/services/translation.service";
import { toObservable } from "@angular/core/rxjs-interop";


type DoumentStatusState = {
    statusList: DocumentStatus[],
    curruntStatus: DocumentStatus,
    isAddorUpdate: boolean,
    loadList: boolean
}

const initialState: DoumentStatusState = {
    statusList: [],
    loadList: true,
    isAddorUpdate: false,
    curruntStatus: {
        id: '',
        name: '',
        description: '',
        colorCode: '',
    }
}

export const DocumentStatusStore = signalStore(
    { providedIn: 'root' },
    withState(initialState),
    withMethods((
        store,
        documentStatusService = inject(DocumentStatusService),
        toastr = inject(ToastrService),
        translationService = inject(TranslationService),
    ) => ({
        loadDocumentStatus() {
            documentStatusService.getDocumentStatuss().subscribe({
                next: (res) => {
                    const statusList = res as DocumentStatus[];
                    patchState(store, { statusList: [...statusList] as DocumentStatus[], loadList: false });
                }
            });
        },
        addDocumentStatus(status: DocumentStatus) {
            documentStatusService.addDocumentStatus(status).subscribe({
                next: (res) => {
                    const status = res as DocumentStatus;
                    if (status) {
                        patchState(store, { curruntStatus: { ...status }, isAddorUpdate: true, loadList: true });
                        toastr.success(translationService.getValue('DOCUMENT_STATUS_CREATED_SUCCESSFULLY'));
                    }
                }
            });
        },
        updateDocumentStatus(updateStatus: DocumentStatus) {
            documentStatusService.updateDocumentStatus(updateStatus).subscribe({
                next: (resp) => {
                    const status = resp as DocumentStatus;
                    patchState(store, {
                        curruntStatus: { ...status }, isAddorUpdate: true,
                        statusList: store.statusList().map((status) => updateStatus.id === status.id ? updateStatus : status),
                    });
                    toastr.success(translationService.getValue('DOCUMENT_STATUS_UPDATED_SUCCESSFULLY'));
                }
            })
        },
        deleteDocumentStatus(statusId: string) {
            documentStatusService.deleteDocumentStatus(statusId).subscribe({
                next: () => {
                    patchState(store, { loadList: true });
                    toastr.success(translationService.getValue('DOCUMENT_STATUS_DELETED_SUCCESSFULLY'));
                }
            })
        },
        resetFlag() {
            patchState(store, { isAddorUpdate: false });
        }
    })),
    withHooks({
        onInit(store) {
            toObservable(store.loadList).subscribe((flag) => {
                if (flag) {
                    store.loadDocumentStatus();
                }
            })
        }
    })
)
