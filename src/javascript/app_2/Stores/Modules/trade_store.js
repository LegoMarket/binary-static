import {
    action,
    observable }                          from 'mobx';
import { updateBarrierShade }             from '../../Modules/Trading/actions/helpers/chart';
import ContractType                       from '../../Modules/Trading/actions/helpers/contract_type';
import { allowed_query_string_variables } from '../../Modules/Trading/actions/helpers/query_string';
import { updateStore }                    from '../../Modules/Trading/actions/index';
import { processPurchase }                from '../../Modules/Trading/actions/purchase';
import URLHelper                          from '../../Utils/URL';
import Client                             from '../../../_common/base/client_base';

export default class TradeStore {
    constructor(root_store) {
        this.root_store = root_store;
    }

    @action.bound init() {

        // Update the url's query string by default values of the store
        const queryParams = URLHelper.updateQueryString(this, allowed_query_string_variables);

        // update state values from query string
        const config = {};
        [...queryParams].forEach(param => {
            config[param[0]] = isNaN(param[1]) ? param[1] : +param[1];
        });
        updateStore(this, config);

        if (this.symbol) {
            ContractType.buildContractTypesConfig(this.symbol).then(action(() => {
                updateStore(this, ContractType.getContractCategories());
            }));
        }

    }

    @action.bound onChange(e) {
        const { name, value, type } = e.target;
        if (!(name in this)) {
            throw new Error(`Invalid Argument: ${name}`);
        }

        updateStore(this, { [name]: (type === 'number' ? +value : value) }, true);
    }

    @action.bound onHoverPurchase(is_over, contract_type) {
        if (this.chart_barriers.main) {
            this.chart_barriers.main.shade = updateBarrierShade(this, is_over, contract_type);
        }
    }

    @action.bound onPurchase(proposal_id, price) {
        if (proposal_id) {
            processPurchase(proposal_id, price).then(action((response) => {
                updateStore(this, { purchase_info: response });
            }));
        }
    }

    // Control values
    @observable is_purchase_enabled = false;
    @observable is_trade_enabled    = false;

    // Underlying
    @observable symbol;

    // Contract Type
    @observable contract_expiry_type = '';
    @observable contract_start_type  = '';
    @observable contract_type        = '';
    @observable contract_types_list  = {};
    @observable form_components      = [];
    @observable trade_types          = {};

    // Amount
    @observable amount          = 10;
    @observable basis           = '';
    @observable basis_list      = [];
    @observable currencies_list = {};
    @observable currency        = Client.get('currency');

    // Duration
    @observable duration            = 5;
    @observable duration_unit       = '';
    @observable duration_units_list = [];
    @observable expiry_date         = '';
    @observable expiry_time         = '09:40';
    @observable expiry_type         = 'duration';

    // Barrier
    @observable barrier_1     = '';
    @observable barrier_2     = '';
    @observable barrier_count = 0;

    // Start Time
    @observable start_date       = Number(0); // Number(0) refers to 'now'
    @observable start_dates_list = [];
    @observable start_time       = '12:30';
    @observable sessions         = [];

    // Last Digit
    @observable last_digit = 3;

    // Purchase
    @observable proposal_info = {};
    @observable purchase_info = {};

    // Chart
    @observable chart_barriers = observable.object({});

    // TODO: to remove dummy portfolio value
    @observable portfolios = [
        {
            transaction_id: 32355620467,
            contract_id   : 478981052055,
            payout        : 10,
            expiry_time   : 1522886399,
            longcode      : 'Win payout if AUD/JPY is strictly higher than entry spot at close on 2018-04-04.',
            shortcode     : 'CALL_FRXAUDJPY_10_1520263325_1522886399_S0P_0',
            currency      : 'USD',
            buy_price     : 1.06,
            app_id        : 1,
            symbol        : 'AUD/JPY',
        },
        {
            transaction_id: 47272620508,
            contract_id   : 432523746528,
            payout        : 10,
            expiry_time   : 15234686345,
            longcode      : 'Win payout if AUD/JPY is strictly higher than entry spot at close on 2018-05-04.',
            shortcode     : 'CALL_FRXAUDJPY_10_1520263325_1522886399_S0P_0',
            currency      : 'USD',
            buy_price     : -55.25,
            app_id        : 1,
            symbol        : 'Australian Index',
        },
    ];
};
