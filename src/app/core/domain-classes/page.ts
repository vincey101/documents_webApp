import { Action } from "./action";

export interface Page {
    id?: string;
    name: string;
    url?: string;
    order?: number;
    pageActions?: Action[];
}
