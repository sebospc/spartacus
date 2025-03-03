/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { effects } from './effects/index';
import { ORDER_FEATURE } from './order-state';
import { reducerProvider, reducerToken } from './reducers/index';

@NgModule({
  imports: [
    EffectsModule.forFeature(effects),
    StoreModule.forFeature(ORDER_FEATURE, reducerToken),
  ],
  providers: [reducerProvider],
})
export class OrderStoreModule {}
