import React, { useRef, useEffect, useState } from 'react';
import { formatAnnouncement } from '../i18n/translations';

const AnnouncementBar = ({ buses = [], sizes = {} }) => {
    const announcedRef = useRef(new Set());
    const [currentAnnouncement, setCurrentAnnouncement] = useState({
        en: 'Waiting for bus arrivals...',
        ml: 'ബസിന്റെ വരവിനായി കാത്തിരിക്കുന്നു...',
        hi: 'बस के आने का इंतजार कर रहे हैं...'
    });

    useEffect(() => {
        const arrivedBuses = buses.filter(b => b.status === 'ARRIVED');

        if (arrivedBuses.length > 0) {
            const bus = arrivedBuses[0];
            const busKey = `${bus.id}-${bus.bus_number}`;
            
            if (!announcedRef.current.has(busKey)) {
                announcedRef.current.add(busKey);

                const enText = formatAnnouncement('busArriving', bus, 'en');
                const mlText = formatAnnouncement('busArriving', bus, 'ml');
                const hiText = formatAnnouncement('busArriving', bus, 'hi');

                setCurrentAnnouncement({
                    en: enText,
                    ml: mlText,
                    hi: hiText
                });
            }
        }
    }, [buses]);

    return (
        <div className="announcement-bar" style={{ fontSize: sizes.body }}>
            <div className="announcement-icon">📢</div>
            <div className="announcement-text">
                <span className="lang-en">{currentAnnouncement.en}</span>
                <span className="lang-ml">{currentAnnouncement.ml}</span>
                <span className="lang-hi">{currentAnnouncement.hi}</span>
            </div>
        </div>
    );
};

export default AnnouncementBar;
