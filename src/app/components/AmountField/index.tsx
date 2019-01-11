import React from 'react';
import BN from 'bn.js';
import { connect } from 'react-redux';
import { Form, Input, Select } from 'antd';
import { Denomination, denominationSymbols, fiatSymbols } from 'utils/constants';
import { typedKeys } from 'utils/ts';
import {
  fromBaseToUnit,
  fromUnitToBase,
  fromUnitToBitcoin,
  fromBitcoinToUnit,
} from 'utils/units';
import { createInvoice } from 'modules/payment/actions';
import { AppState } from 'store/reducers';
import './index.less';

interface OwnProps {
  amount: string;
  label?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  size?: 'large' | 'default' | 'small';
  help?: React.ReactNode;
  required?: boolean;
  showFiat?: boolean;
  minimumSats?: string;
  maximumSats?: string;
  onChangeAmount(amount: string): void;
}

interface StateProps {
  denomination: AppState['settings']['denomination'];
  fiat: AppState['settings']['fiat'];
  isNoFiat: AppState['settings']['isNoFiat'];
  rates: AppState['rates']['rates'];
}

type Props = OwnProps & StateProps;

interface State {
  value: string;
  valueFiat: string;
  denomination: Denomination;
}

class AmountField extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      value: '',
      valueFiat: '',
      denomination: props.denomination,
    };
  }

  componentDidMount() {
    const { amount, denomination } = this.props;
    if (amount) {
      // Set valueFiat and value based on amount prop
      const value = fromBaseToUnit(amount.toString(), denomination).toString();
      this.updateBothValues('value', value);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { rates, amount } = this.props;
    const { value, denomination } = this.state;

    let newValue = value;
    if (amount !== prevProps.amount) {
      newValue = fromBaseToUnit(amount.toString(), denomination).toString();;
    }

    if (rates !== prevProps.rates || newValue !== value) {
      // Update both values if we just got rates, or amount prop changed
      this.updateBothValues('value', value);
    }
  }

  render() {
    const {
      label,
      size,
      disabled,
      autoFocus,
      showFiat,
      isNoFiat,
      fiat,
      rates,
      required,
      help,
    } = this.props;
    const { value, valueFiat, denomination } = this.state;
    const amountError = this.getValueError();

    return (
      <Form.Item
        label={label}
        help={amountError || help}
        validateStatus={value && amountError ? 'error' : undefined}
        className="AmountField"
        required={required}
      >
        <div className="AmountField-inner">
          <Input.Group size={size} compact>
            <Input
              name="value"
              size={size}
              value={value}
              onChange={this.handleChangeValue}
              placeholder="Enter an amount"
              step="any"
              disabled={disabled}
              autoFocus={autoFocus}
            />
            <Select
              size={size}
              onChange={this.handleChangeDenomination}
              value={denomination}
              dropdownMatchSelectWidth={false}
            >
              {typedKeys(Denomination).map(d => (
                <Select.Option key={d} value={d}>
                  {denominationSymbols[d]}
                </Select.Option>
              ))}
            </Select>
          </Input.Group>
          {!isNoFiat && showFiat && (
            <>
              <div className="AmountField-divider">
                or
              </div>
              <Input
                size={size}
                type="number"
                name="valueFiat"
                value={valueFiat}
                onChange={this.handleChangeValue}
                addonBefore={fiatSymbols[fiat]}
                placeholder="1.00"
                disabled={!rates || disabled}
                step="any"
              />
            </>
          )}
        </div>
      </Form.Item>
    );
  }

  private getValueError = () => {
    const { minimumSats, maximumSats } = this.props;
    const { value, denomination } = this.state;
    const valueBN = new BN(fromUnitToBase(value, denomination));
    if (maximumSats) {
      const max = new BN(maximumSats);
      if (max.lt(valueBN)) {
        return 'Amount exceeds maximum';
      }
    }
    if (minimumSats) {
      const min = new BN(minimumSats);
      if (min.gte(valueBN)) {
        return 'Amount is less than minimum';
      }
    }
  };

  private handleChangeValue = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = ev.currentTarget;
    this.updateBothValues(name, value);
  };

  private updateBothValues = (name: string, val: string) => {
    const { fiat, rates } = this.props;
    const { denomination } = this.state;
    let { value, valueFiat } = this.state;
  
    if (name === 'value') {
      value = val;
      if (rates) {
        const btc = fromUnitToBitcoin(value, denomination);
        valueFiat = (rates[fiat] * parseFloat(btc)).toFixed(2);
      }
    }
    else {
      valueFiat = val;
      if (rates) {
        const btc = (parseFloat(valueFiat) / rates[fiat]).toFixed(8);
        value = fromBitcoinToUnit(btc, denomination);
      }
    }

    this.setState({ value, valueFiat }, () => {
      const sats = fromUnitToBase(value, denomination);
      this.props.onChangeAmount(sats);
    });
  };

  private handleChangeDenomination = (value: any) => {
    this.setState({ denomination: value as Denomination }, () => {
      this.updateBothValues('value', this.state.value);
    });
  };
}

export default connect<StateProps, {}, {}, AppState>(
  state => ({
    denomination: state.settings.denomination,
    fiat: state.settings.fiat,
    isNoFiat: state.settings.isNoFiat,
    rates: state.rates.rates,
  }),
  { createInvoice },
)(AmountField);