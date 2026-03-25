import React, { memo } from 'react';
import { t, translateField } from '../i18n/translations';

const ArrivalBoard = memo(({ buses = [], sizes = {} }) => {
    const formatETA = (status, distance) => {
        if (status === 'ARRIVED') return '< 1 min';
        if (!distance) return 'â€”';
        const eta = Math.ceil(distance / 5.56 / 60);
        return eta > 0 ? `${eta} min` : '< 1 min';
    };

    return (
        <div className="board-panel arrival-board" style={{ fontSize: sizes.body }}>
            <div className="board-title">
                <span className="lang-en">{t('display', 'arrivalBoard', 'en')}</span>
                <span className="lang-ml">{t('display', 'arrivalBoard', 'ml')}</span>
                <span className="lang-hi">{t('display', 'arrivalBoard', 'hi')}</span>
            </div>

            {buses.length === 0 ? (
                <div className="empty-row">
                    <span className="lang-en">{t('display', 'noData', 'en')}</span>
                    <span className="lang-ml">{t('display', 'noData', 'ml')}</span>
                    <span className="lang-hi">{t('display', 'noData', 'hi')}</span>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="board-table">
                        <thead>
                            <tr>
                                <th><span className="lang-en">{t('display', 'busNumber', 'en')}</span><span className="lang-ml">{t('display', 'busNumber', 'ml')}</span><span className="lang-hi">{t('display', 'busNumber', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'type', 'en')}</span><span className="lang-ml">{t('display', 'type', 'ml')}</span><span className="lang-hi">{t('display', 'type', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'route', 'en')}</span><span className="lang-ml">{t('display', 'route', 'ml')}</span><span className="lang-hi">{t('display', 'route', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'platform', 'en')}</span><span className="lang-ml">{t('display', 'platform', 'ml')}</span><span className="lang-hi">{t('display', 'platform', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'eta', 'en')}</span><span className="lang-ml">{t('display', 'eta', 'ml')}</span><span className="lang-hi">{t('display', 'eta', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {buses.map((bus, idx) => {
                                return (
                                    <tr key={bus.id || idx} className={`status-row-${bus.status}`}>
                                        <td className="bus-number-cell"><strong>{bus.bus_number}</strong></td>
                                        <td>
                                            <span className="lang-en">{bus.bus_type}</span>
                                            <span className="lang-ml">{translateField('busTypes', bus.bus_type, 'ml')}</span>
                                            <span className="lang-hi">{translateField('busTypes', bus.bus_type, 'hi')}</span>
                                        </td>
                                        <td>
                                            <span className="lang-en">{bus.route}</span>
                                            <span className="lang-ml">{translateField('routes', bus.route, 'ml')}</span>
                                            <span className="lang-hi">{translateField('routes', bus.route, 'hi')}</span>
                                        </td>
                                        <td>
                                            <span className="lang-en">{bus.destination}</span>
                                            <span className="lang-ml">{translateField('destinations', bus.destination, 'ml')}</span>
                                            <span className="lang-hi">{translateField('destinations', bus.destination, 'hi')}</span>
                                        </td>
                                        <td>{bus.platform || 'â€”'}</td>
                                        <td>{formatETA(bus.status, bus.distance_from_depot)}</td>
                                        <td className={`status-${bus.status}`}>
                                            <span className="lang-en">{t('display', `statusLabels.${bus.status}`, 'en')}</span>
                                            <span className="lang-ml">{t('display', `statusLabels.${bus.status}`, 'ml')}</span>
                                            <span className="lang-hi">{t('display', `statusLabels.${bus.status}`, 'hi')}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

ArrivalBoard.displayName = 'ArrivalBoard';
export default ArrivalBoard;
