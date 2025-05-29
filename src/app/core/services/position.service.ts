import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Position } from '@core/domain-classes/position';
import { CommonHttpErrorService } from '@core/error-handler/common-http-error.service';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PositionService {
  constructor(
    private httpClient: HttpClient,
    private commonHttpErrorService: CommonHttpErrorService
  ) {}

  getAllPositions(): Observable<Position[]> {
    const url = `position`;      // GET /position
    return this.httpClient.get<Position[]>(url);
  }

  delete(id) {
    const url = `position/${id}`;      // DELETE /position/{id}
    return this.httpClient.delete<void>(url);
  }

  update(position: Position) {
    const url = `position/${position.id}`;      // PUT /position/{id}
    return this.httpClient.put<Position>(url, position);
  }

  add(position: Position) {
    const url = 'position';      // POST /position
    return this.httpClient
      .post<Position>(url, position)
      .pipe(catchError(this.commonHttpErrorService.handleError));
  }

  getSubPositions(id: string) {
    const url = `position/${id}/subpositions`;      // GET /position/{id}/subpositions
    return this.httpClient.get<Position[]>(url);
  }

  getAllPositionsForDropDown() {
    const url = `position/dropdown`;      // GET /position/dropdown
    return this.httpClient.get<Position[]>(url);
  }
} 