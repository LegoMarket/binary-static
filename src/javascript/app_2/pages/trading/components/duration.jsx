import moment       from 'moment';
import React        from 'react';
import Datepicker   from '../../../components/form/date_picker.jsx';
import Dropdown     from '../../../components/form/dropdown.jsx';
import Fieldset     from '../../../components/form/fieldset.jsx';
import InputField   from '../../../components/form/input_field.jsx';
import TimePicker   from '../../../components/form/time_picker.jsx';
import { connect }  from '../../../store/connect';
import { localize } from '../../../../_common/localize';

const expiry_list = [
    { text: localize('Duration'), value: 'duration' },
    { text: localize('End Time'), value: 'endtime' },
];

let now_date,
    min_date_duration,
    max_date_duration,
    min_date_expiry;

const Duration = ({
    expiry_type,
    expiry_date,
    expiry_time,
    duration,
    duration_unit,
    duration_units_list,
    server_time,
    onChange,
    is_nativepicker,
    is_minimized,
}) => {
    const moment_now = moment(server_time);
    if (!now_date || moment_now.date() !== now_date.date()) {
        now_date          = moment_now.clone();
        min_date_duration = moment_now.clone().add(1, 'd');
        max_date_duration = moment_now.clone().add(365, 'd');
        min_date_expiry   = moment_now.clone();
    }
    const is_same_day = moment.utc(expiry_date).isSame(moment_now, 'day');
    if (is_minimized) {
        const duration_unit_text = (duration_units_list.find(o => o.value === duration_unit) || {}).text;
        return (
            <div className='fieldset-minimized duration'>
                <span className='icon trade-duration' />
                {expiry_type === 'duration'
                    ? `${duration} ${duration_unit_text}`
                    : `${moment(expiry_date).format('ddd - DD MMM, YYYY')}\n${expiry_time}`
                }
            </div>
        );
    }

    return (
        <Fieldset
            time={server_time}
            header={localize('Trade Duration')}
            icon='trade-duration'
            tooltip={localize('Text for Duration goes here.')}
        >
            <Dropdown
                list={expiry_list}
                value={expiry_type}
                name='expiry_type'
                onChange={onChange}
                is_nativepicker={is_nativepicker}
            />

            {expiry_type === 'duration' ?
                <React.Fragment>
                    <div className='duration-container'>
                        {duration_unit === 'd' && !is_nativepicker ?
                            <Datepicker
                                name='duration'
                                minDate={min_date_duration}
                                maxDate={max_date_duration}
                                mode='duration'
                                onChange={onChange}
                                is_nativepicker={is_nativepicker}
                                footer={localize('The minimum duration is 1 day')}
                            /> :
                            <InputField
                                type='number'
                                name='duration'
                                value={duration}
                                onChange={onChange}
                                is_nativepicker={is_nativepicker}
                            />
                        }
                        <Dropdown
                            list={duration_units_list}
                            value={duration_unit}
                            name='duration_unit'
                            onChange={onChange}
                            is_nativepicker={is_nativepicker}
                        />
                    </div>
                </React.Fragment> :
                <React.Fragment>
                    <Datepicker
                        name='expiry_date'
                        showTodayBtn
                        minDate={min_date_expiry}
                        onChange={onChange}
                        is_nativepicker={is_nativepicker}
                    />
                    {is_same_day &&
                        <TimePicker
                            onChange={onChange}
                            name='expiry_time'
                            value={expiry_time}
                            placeholder='12:00 pm'
                            is_nativepicker={is_nativepicker}
                        />
                    }
                </React.Fragment>
            }
        </Fieldset>
    );
};

export default connect(
    ({ main, trade }) => ({
        server_time        : main.server_time,
        expiry_type        : trade.proposal.expiry_type,
        expiry_date        : trade.proposal.expiry_date,
        expiry_time        : trade.proposal.expiry_time,
        duration           : trade.proposal.duration,
        duration_unit      : trade.proposal.duration_unit,
        duration_units_list: trade.duration_units_list,
        onChange           : trade.handleChange,
    })
)(Duration);
