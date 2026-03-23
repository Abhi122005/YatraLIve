import React, { memo } from 'react';
import { t, translateField } from '../i18n/translations';

const DelayAlerts = memo(({ buses = [], sizes = {} }) => {
    return (
        <div className="board-panel delay-board" style={{ fontSize: sizes.body }}>
            <div className="board-title">
                <span className="lang-en">{t('display', 'delayAlerts', 'en')}</span>
                <span className="lang-ml">{t('display', 'delayAlerts', 'ml')}</span>
                <span className="lang-hi">{t('display', 'delayAlerts', 'hi')}</span>
                {buses.length > 0 && (
                    <span className="delay-count">{buses.length}</span>
                )}
            </div>

            {buses.length === 0 ? (
                <div className="empty-row">
                    <span className="lang-en">✅ No delays reported</span>
                    <span className="lang-ml">✅ കാലതാമസം റിപോർട്ട് ചെയ്യപ്പെട്ടില്ല</span>
                    <span className="lang-hi">✅ कोई विलंब सूचित नहीं</span>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="board-table">
                        <thead>
                            <tr>
                                <th><span className="lang-en">{t('display', 'busNumber', 'en')}</span><span className="lang-ml">{t('display', 'busNumber', 'ml')}</span><span className="lang-hi">{t('display', 'busNumber', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'type', 'en')}</span><span className="lang-ml">{t('display', 'type', 'ml')}</span><span className="lang-hi">{t('display', 'type', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'destination', 'en')}</span><span className="lang-ml">{t('display', 'destination', 'ml')}</span><span className="lang-hi">{t('display', 'destination', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'platform', 'en')}</span><span className="lang-ml">{t('display', 'platform', 'ml')}</span><span className="lang-hi">{t('display', 'platform', 'hi')}</span></th>
                                <th><span className="lang-en">{t('display', 'status', 'en')}</span><span className="lang-ml">{t('display', 'status', 'ml')}</span><span className="lang-hi">{t('display', 'status', 'hi')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {buses.map((bus, idx) => (
                                <tr key={bus.id || idx} className="status-row-DELAYED">
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
                                    <td>{bus.platform || '—'}</td>
                                    <td className="status-DELAYED">
                                        <span className="lang-en">{t('display', 'statusLabels.DELAYED', 'en')}</span>
                                        <span className="lang-ml">{t('display', 'statusLabels.DELAYED', 'ml')}</span>
                                        <span className="lang-hi">{t('display', 'statusLabels.DELAYED', 'hi')}</span>
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

DelayAlerts.displayName = 'DelayAlerts';
export default DelayAlerts;
