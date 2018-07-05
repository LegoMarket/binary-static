import { SmartChart }    from '@binary-com/smartcharts';
import { toJS }          from 'mobx';
import PropTypes         from 'prop-types';
import React             from 'react';
import { WS }            from '../../Services';
import { connect }       from '../../Stores/connect';
import { isEmptyObject } from '../../../_common/utility';

const subscribe = (request_object, callback) => {
    if (request_object.subscribe !== 1) return;
    WS.subscribeTicksHistory(request_object, callback);
};

const forget = (match_values, callback) => (
    WS.forget('ticks_history', callback, match_values)
);

const SmartCharts = ({
    chart_barriers,
    initial_symbol,
    is_mobile,
    onSymbolChange,
}) =>  {
    const barriers = Object.keys(chart_barriers || {})
        .map(key => toJS(chart_barriers[key]))
        .filter(item => !isEmptyObject(item));

    return (
        <React.Fragment>
            <SmartChart
                requestSubscribe={subscribe}
                requestForget={forget}
                requestAPI={WS.sendRequest.bind(WS)}
                onSymbolChange={(symbol_obj) => {
                    onSymbolChange({
                        target: {
                            name : 'symbol',
                            value: symbol_obj.symbol,
                        },
                    });
                }}
                barriers={barriers}
                initialSymbol={initial_symbol}
                isMobile={is_mobile}
            />
        </React.Fragment>
    );
};

SmartCharts.propTypes = {
    chart_barriers: PropTypes.object,
    initial_symbol: PropTypes.string,
    is_mobile     : PropTypes.bool,
    onSymbolChange: PropTypes.func,
};

export default connect(
    ({ modules, ui }) => ({
        chart_barriers: modules.trade.chart_barriers,
        initial_symbol: modules.trade.symbol,
        onSymbolChange: modules.trade.onChange,
        is_mobile     : ui.is_mobile,
    })
)(SmartCharts);
