import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StoreModule } from '@ngrx/store';
import {
  FeatureConfigService,
  FeaturesConfigModule,
  I18nTestingModule,
} from '@spartacus/core';
import { CONFIGURATOR_FEATURE } from '../../../../core/state/configurator-state';
import { getConfiguratorReducers } from '../../../../core/state/reducers';
import { CommonConfiguratorTestUtilsService } from '../../../../../common/testing/common-configurator-test-utils.service';
import { Configurator } from '../../../../core/model/configurator.model';
import { ConfiguratorAttributeCompositionContext } from '../../composition/configurator-attribute-composition.model';
import { ConfiguratorPriceComponentOptions } from '../../../price/configurator-price.component';
import { ConfiguratorAttributeQuantityComponentOptions } from '../../quantity/configurator-attribute-quantity.component';
import { ConfiguratorAttributeInputFieldComponent } from '../input-field/configurator-attribute-input-field.component';
import { ConfiguratorAttributeNumericInputFieldComponent } from '../numeric-input-field/configurator-attribute-numeric-input-field.component';
import { ConfiguratorAttributeDropDownComponent } from './configurator-attribute-drop-down.component';
import { ConfiguratorTestUtils } from '../../../../testing/configurator-test-utils';
import { ConfiguratorCommonsService } from '../../../../core/facade/configurator-commons.service';
import { Observable, of } from 'rxjs';
import { ConfiguratorStorefrontUtilsService } from '../../../service/configurator-storefront-utils.service';
import { MockFeatureLevelDirective } from 'projects/storefrontlib/shared/test/mock-feature-level-directive';

function createValue(code: string, name: string, isSelected: boolean) {
  const value: Configurator.Value = {
    valueCode: code,
    valueDisplay: name,
    name: name,
    selected: isSelected,
  };
  return value;
}

@Directive({
  selector: '[cxFocus]',
})
export class MockFocusDirective {
  @Input('cxFocus') protected config: any;
}

@Component({
  selector: 'cx-configurator-attribute-quantity',
  template: '',
})
class MockConfiguratorAttributeQuantityComponent {
  @Input() quantityOptions: ConfiguratorAttributeQuantityComponentOptions;
  @Output() changeQuantity = new EventEmitter<number>();
}

@Component({
  selector: 'cx-configurator-price',
  template: '',
})
class MockConfiguratorPriceComponent {
  @Input() formula: ConfiguratorPriceComponentOptions;
}

class MockConfiguratorCommonsService {
  updateConfiguration(): void {}
}

let showRequiredErrorMessage: boolean;
class MockConfigUtilsService {
  isCartEntryOrGroupVisited(): Observable<boolean> {
    return of(showRequiredErrorMessage);
  }
}

let testVersion: string;
class MockFeatureConfigService {
  isLevel(version: string): boolean {
    return version === testVersion;
  }
}

describe('ConfigAttributeDropDownComponent', () => {
  let component: ConfiguratorAttributeDropDownComponent;
  let htmlElem: HTMLElement;
  let fixture: ComponentFixture<ConfiguratorAttributeDropDownComponent>;

  const ownerKey = 'theOwnerKey';
  const name = 'attributeName';
  const groupId = 'theGroupId';
  const selectedValue = 'selectedValue';

  const value1 = createValue(
    Configurator.RetractValueCode,
    'Please select a value',
    true
  );
  const value2 = createValue('2', 'val2', false);
  const value3 = createValue('3', 'val3', false);

  const values: Configurator.Value[] = [value1, value2, value3];

  function createComponentWithData(
    releaseVersion: string,
    isCartEntryOrGroupVisited: boolean = true
  ): ConfiguratorAttributeDropDownComponent {
    testVersion = releaseVersion;
    showRequiredErrorMessage = isCartEntryOrGroupVisited;

    fixture = TestBed.createComponent(ConfiguratorAttributeDropDownComponent);
    htmlElem = fixture.nativeElement;
    component = fixture.componentInstance;
    component.attribute = {
      name: name,
      label: name,
      attrCode: 444,
      dataType: Configurator.DataType.USER_SELECTION_QTY_ATTRIBUTE_LEVEL,
      uiType: Configurator.UiType.DROPDOWN,
      selectedSingleValue: selectedValue,
      quantity: 1,
      groupId: groupId,
      required: true,
      incomplete: true,
      values,
    };

    fixture.detectChanges();
    return component;
  }

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [
          ConfiguratorAttributeDropDownComponent,
          ConfiguratorAttributeInputFieldComponent,
          ConfiguratorAttributeNumericInputFieldComponent,
          MockFocusDirective,
          MockConfiguratorAttributeQuantityComponent,
          MockConfiguratorPriceComponent,
          MockFeatureLevelDirective,
        ],
        imports: [
          ReactiveFormsModule,
          NgSelectModule,
          I18nTestingModule,
          FeaturesConfigModule,
          StoreModule.forRoot({}),
          StoreModule.forFeature(CONFIGURATOR_FEATURE, getConfiguratorReducers),
        ],
        providers: [
          {
            provide: ConfiguratorAttributeCompositionContext,
            useValue: ConfiguratorTestUtils.getAttributeContext(),
          },
          {
            provide: ConfiguratorCommonsService,
            useClass: MockConfiguratorCommonsService,
          },
          {
            provide: ConfiguratorStorefrontUtilsService,
            useClass: MockConfigUtilsService,
          },
          { provide: FeatureConfigService, useClass: MockFeatureConfigService },
        ],
      })
        .overrideComponent(ConfiguratorAttributeDropDownComponent, {
          set: {
            changeDetection: ChangeDetectionStrategy.Default,
          },
        })
        .compileComponents();
    })
  );

  afterEach(() => {
    document.body.removeChild(htmlElem);
    fixture.destroy();
  });

  it('should create', () => {
    createComponentWithData('6.2');
    expect(component).toBeTruthy();
    CommonConfiguratorTestUtilsService.expectElementPresent(
      expect,
      htmlElem,
      'select.cx-required-error-msg'
    );
  });

  it('should render an empty component because showRequiredErrorMessage$ is `false`', () => {
    createComponentWithData('6.1', false);
    CommonConfiguratorTestUtilsService.expectElementNotPresent(
      expect,
      htmlElem,
      'select.cx-required-error-msg'
    );
  });

  it('should set selectedSingleValue on init', () => {
    createComponentWithData('6.2');
    expect(component.attributeDropDownForm.value).toEqual(selectedValue);
  });

  it('should call updateConfiguration on select', () => {
    createComponentWithData('6.2');
    component.ownerKey = ownerKey;
    spyOn(
      component['configuratorCommonsService'],
      'updateConfiguration'
    ).and.callThrough();
    component.onSelect(component.attributeDropDownForm.value);
    expect(
      component['configuratorCommonsService'].updateConfiguration
    ).toHaveBeenCalledWith(
      ownerKey,
      {
        ...component.attribute,
        selectedSingleValue: component.attributeDropDownForm.value,
      },
      Configurator.UpdateType.ATTRIBUTE
    );
  });

  describe('attribute level', () => {
    beforeEach(() => {
      createComponentWithData('6.2');
    });

    it('should not display quantity and no price', () => {
      component.attribute.dataType =
        Configurator.DataType.USER_SELECTION_NO_QTY;
      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        '.cx-attribute-level-quantity-price'
      );
    });

    it('should display quantity and price', () => {
      component.attribute.quantity = 5;
      component.attribute.attributePriceTotal = {
        currencyIso: '$',
        formattedValue: '500.00$',
        value: 500,
      };

      let value = component.attribute.values
        ? component.attribute.values[0]
        : undefined;
      if (value) {
        value.valuePrice = {
          currencyIso: '$',
          formattedValue: '$100.00',
          value: 100,
        };
      } else {
        fail('Value not available');
      }

      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-attribute-quantity'
      );

      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-price'
      );
    });
  });

  describe('value level', () => {
    beforeEach(() => {
      createComponentWithData('6.2');
    });

    it('should not display quantity', () => {
      component.attribute.dataType =
        Configurator.DataType.USER_SELECTION_NO_QTY;
      fixture.detectChanges();
      CommonConfiguratorTestUtilsService.expectElementNotPresent(
        expect,
        htmlElem,
        'cx-configurator-attribute-quantity'
      );
    });

    it('should display price formula', () => {
      let value = component.attribute.values
        ? component.attribute.values[0]
        : undefined;
      if (value) {
        value.valuePrice = {
          currencyIso: '$',
          formattedValue: '$100.00',
          value: 100,
        };
      } else {
        fail('Value not available');
      }

      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-price'
      );
    });
  });

  describe('Rendering for additional value', () => {
    beforeEach(() => {
      createComponentWithData('6.2');
    });

    it('should provide input field for alpha numeric value ', () => {
      component.attribute.uiType =
        Configurator.UiType.DROPDOWN_ADDITIONAL_INPUT;
      component.attribute.validationType = Configurator.ValidationType.NONE;
      fixture.detectChanges();
      htmlElem = fixture.nativeElement;
      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-attribute-input-field'
      );
    });

    it('should provide input field for numeric value ', () => {
      component.attribute.uiType =
        Configurator.UiType.DROPDOWN_ADDITIONAL_INPUT;
      component.attribute.validationType = Configurator.ValidationType.NUMERIC;
      fixture.detectChanges();
      htmlElem = fixture.nativeElement;
      CommonConfiguratorTestUtilsService.expectElementPresent(
        expect,
        htmlElem,
        'cx-configurator-attribute-numeric-input-field'
      );
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      createComponentWithData('6.2');
    });

    it("should contain label element with class name 'cx-visually-hidden' that hides label content on the UI", () => {
      CommonConfiguratorTestUtilsService.expectElementContainsA11y(
        expect,
        htmlElem,
        'label',
        'cx-visually-hidden',
        0,
        undefined,
        undefined,
        'configurator.a11y.listbox count:' +
          (component.attribute.values ? component.attribute.values.length : 0)
      );
    });

    it("should contain select element with class name 'form-control' and 'aria-describedby' attribute that indicates the ID of the element that describe the elements", () => {
      CommonConfiguratorTestUtilsService.expectElementContainsA11y(
        expect,
        htmlElem,
        'select',
        'form-control',
        0,
        'aria-describedby',
        'cx-configurator--label--attributeName'
      );
    });

    it("should contain option elements with 'aria-label' attribute for value without price that defines an accessible name to label the current element", () => {
      CommonConfiguratorTestUtilsService.expectElementContainsA11y(
        expect,
        htmlElem,
        'option',
        undefined,
        1,
        'aria-label',
        'configurator.a11y.selectedValueOfAttributeFull attribute:' +
          component.attribute.label +
          ' value:' +
          value2.valueDisplay,
        value2.valueDisplay
      );
    });

    it("should contain option elements with 'aria-label' attribute for value with price that defines an accessible name to label the current element", () => {
      let value = component.attribute.values
        ? component.attribute.values[0]
        : undefined;
      if (value) {
        value.valuePrice = {
          currencyIso: '$',
          formattedValue: '$100.00',
          value: 100,
        };
      } else {
        fail('Value not available');
      }
      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementContainsA11y(
        expect,
        htmlElem,
        'option',
        undefined,
        0,
        'aria-label',
        'configurator.a11y.selectedValueOfAttributeFullWithPrice attribute:' +
          component.attribute.label +
          ' price:' +
          value1.valuePrice?.formattedValue +
          ' value:' +
          value1.valueDisplay,
        value1.valueDisplay
      );
    });

    it("should contain option elements with 'aria-label' attribute for value with total price that defines an accessible name to label the current element", () => {
      let value = component.attribute.values
        ? component.attribute.values[0]
        : undefined;
      if (value) {
        value.valuePriceTotal = {
          currencyIso: '$',
          formattedValue: '$100.00',
          value: 100,
        };
      } else {
        fail('Value not available');
      }
      fixture.detectChanges();

      CommonConfiguratorTestUtilsService.expectElementContainsA11y(
        expect,
        htmlElem,
        'option',
        undefined,
        0,
        'aria-label',
        'configurator.a11y.selectedValueOfAttributeFullWithPrice attribute:' +
          component.attribute.label +
          ' price:' +
          value1.valuePrice?.formattedValue +
          ' value:' +
          value1.valueDisplay,
        value1.valueDisplay
      );
    });
  });
});
