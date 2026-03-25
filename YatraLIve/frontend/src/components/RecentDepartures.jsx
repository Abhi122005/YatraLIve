import React, { memo } from 'react';
import { t, translateField } from '../i18n/translations';

const RecentDepartures = memo(({ buses = [], sizes = {} }) => {
    return (
        <div className="board-panel departures-board" style={{ fontSize: sizes.body }}>
            <div className="board-title">
                <span className="lang-en">{t('display', 'recentDepartures', 'en')}</span>
                <span className="lang-ml">{t('display', 'recentDepartures', 'ml')}</span>
                <span className="lang-hi">{t('display', 'recentDepartures', 'hi')}</span>
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
                                <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'route', 'en')}</span><span className="lang-ml">{t('display', 'route', 'ml')}</span><span className="lang-hi">{t('display', 'route', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {buses.map((bus, idx) => (
                                <tr key={`${bus.id}-${idx}`} className="status-row-DEPARTED">
                                    <td><strong>{bus.bus_number}</strong></td>
                                    <td>
                                        <span className="lang-en">{bus.bus_type}</span>
                                        <span className="lang-ml">{translateField('busTypes', bus.bus_type, 'ml')}</span>
                                        <span className="lang-hi">{translateField('busTypes', bus.bus_type, 'hi')}</span>
                                    </td>
                                    <td>
                                        <span className="lang-en">{bus.destination}</span>
                                        <span className="lang-ml">{translateField('destinations', bus.destination, 'ml')}</span>
                                        <span className="lang-hi">{translateField('destinations', bus.destination, 'hi')}</span>
                                    </td>
                                    <td>
                                        <span className="lang-en">{bus.route}</span>
                                        <span className="lang-ml">{translateField('routes', bus.route, 'ml')}</span>
                                        <span className="lang-hi">{translateField('routes', bus.route, 'hi')}</span>
                                    </td>
                                    <td className="status-DEPARTED">
                                        <span className="lang-en">{t('display', 'statusLabels.DEPARTED', 'en')}</span>
                                        <span className="lang-ml">{t('display', 'statusLabels.DEPARTED', 'ml')}</span>
                                        <span className="lang-hi">{t('display', 'statusLabels.DEPARTED', 'hi')}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
});

RecentDepartures.displayName = 'RecentDepartures';
export default RecentDepartures;
