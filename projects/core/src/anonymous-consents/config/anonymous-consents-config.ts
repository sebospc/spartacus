/*
 * SPDX-FileCopyrightText: 2023 SAP Spartacus team <spartacus-team@sap.com>
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import { Injectable } from '@angular/core';
import { Config } from '../../config/config-tokens';
import { OccConfig } from '../../occ/config/occ-config';

@Injectable({
  providedIn: 'root',
  useExisting: Config,
})
export abstract class AnonymousConsentsConfig extends OccConfig {
  anonymousConsents?: {
    /**
     * Specify the consent template ID to be show on the registration page.
     */
    registerConsent?: string;
    /**
     * Show the legal description at the top of the anonymous consents dialog.
     */
    showLegalDescriptionInDialog?: boolean;
    /**
     * Specify the list of consent template IDs that are required and which can't be toggled off.
     */
    requiredConsents?: string[];
    /**
     * Consent management page configuration.
     */
    consentManagementPage?: {
      /**
       * Show all anonymous consents on the consent management page.
       */
      showAnonymousConsents?: boolean;
      /**
       * A list of consent template IDs that should be hidden on the consent management page.
       */
      hideConsents?: string[];
    };
  };
}

declare module '../../config/config-tokens' {
  interface Config extends AnonymousConsentsConfig {}
}
