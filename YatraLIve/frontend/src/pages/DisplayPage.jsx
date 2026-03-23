import React, { useState, useCallback, useEffect } from 'react';
import ArrivalBoard from '../components/ArrivalBoard';
import DelayAlerts from '../components/DelayAlerts';
import RecentDepartures from '../components/RecentDepartures';
import AnnouncementBar from '../components/AnnouncementBar';
import { usePoll } from '../hooks/usePoll';
import { getArrivalBoard, getDelayAlerts, getRecentDepartures } from '../api';
import { useBusStore } from '../store/busStore';
import { t, formatAnnouncement } from '../i18n/translations';
import { useResponsiveText } from '../utils/responsiveText';
import { ttsService } from '../services/ttsService';

const BOARDS = ['arrival', 'delays', 'departures'];
const BOARD_LABELS = ['ARRIVALS', 'DELAYS', 'DEPARTURES'];

const DisplayPage = () => {
    const {
        arrivalBoard, delayAlerts, recentDepartures,
        setArrivalBoard, setDelayAlerts, setRecentDepartures,
        connectionLost, incrementFailures, resetFailures
    } = useBusStore();

    const [currentTime, setCurrentTime] = useState(new Date());
    const [announcedBuses, setAnnouncedBuses] = useState(new Set());
    const [ttsEnabled, setTtsEnabled] = useState(true);
    const { screenSize, sizes } = useResponsiveText();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Network connectivity monitoring
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setTimeout(() => {
                window.location.reload();
            }, 500);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Carousel rotation - always active (60 seconds per table)
    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % 3);
        }, 40000);
        return () => clearInterval(interval);
    }, []);

    // TTS for announcements - only when online
    useEffect(() => {
        if (ttsEnabled && isOnline && arrivalBoard && arrivalBoard.length > 0) {
            arrivalBoard.slice(0, 2).forEach(bus => {
                if (!announcedBuses.has(bus.id)) {
                    const isApproaching = bus.status === 'APPROACHING';
                    const isNear = bus.status === 'NEAR';

                    if (isApproaching || isNear) {
                        const text = formatAnnouncement(
                            isApproaching ? 'busApproaching' : 'busArriving',
                            bus,
                            'ml'
                        );

                        ttsService.speakAnnouncement(text, 'ml').catch(err => {
                            console.error('TTS Error:', err);
                        });

                        setAnnouncedBuses(prev => new Set([...prev, bus.id]));
                    }
                }
            });
        }
    }, [arrivalBoard, ttsEnabled, announcedBuses, isOnline]);

    // Update time
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll all boards every 3 seconds - only when online
    usePoll(useCallback(async () => {
        if (!isOnline) return;

        try {
            const [arrival, delays, departures] = await Promise.all([
                getArrivalBoard(),
                getDelayAlerts(),
                getRecentDepartures(),
            ]);
            setArrivalBoard(arrival);
            setDelayAlerts(delays);
            setRecentDepartures(departures);
            setCurrentTime(new Date());
            resetFailures();
        } catch (err) {
            incrementFailures();
            throw err;
        }
    }, [isOnline]), 3000);

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    // Offline: only show the no-internet banner, nothing else
    if (!isOnline) {
        return (
            <div className="display-page" style={{ fontSize: sizes.body, lineHeight: sizes.lineHeight, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="connection-lost-banner offline-mode" style={{ fontSize: sizes.h2, width: '100%', textAlign: 'center' }}>
                    <div className="banner-content">
                        <span className="banner-icon">📵</span>
                        <span className="lang-en">NO INTERNET CONNECTION</span>
                        <span className="lang-ml">ഇന്റർനെറ്റ് കണക്ഷൻ ഇല്ല</span>
                        <span className="lang-hi">इंटरनेट कनेक्शन नहीं</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="display-page" style={{ fontSize: sizes.body, lineHeight: sizes.lineHeight }}>
            {/* Header */}
            <header className="display-header">
                <div className="header-left">
                    <div className="ksrtc-logo">
                        <span className="logo-icon" style={{ fontSize: sizes.h1 }}>🚌</span>
                        <div className="logo-text">
                            <h1 style={{ fontSize: sizes.h1 }}>
                                <span className="lang-en">{t('display', 'title', 'en')}</span>
                                <span className="lang-ml">{t('display', 'title', 'ml')}</span>
                                <span className="lang-hi">{t('display', 'title', 'hi')}</span>
                            </h1>
                            <p style={{ fontSize: sizes.body }}>
                                <span className="lang-en">{t('display', 'subtitle', 'en')}</span>
                                <span className="lang-ml">{t('display', 'subtitle', 'ml')}</span>
                                <span className="lang-hi">{t('display', 'subtitle', 'hi')}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-time">
                        <div className="time-display" style={{ fontSize: sizes.h2 }}>
                            {formatTime(currentTime)}
                        </div>
                        <div className="date-display" style={{ fontSize: sizes.body }}>
                            {formatDate(currentTime)}
                        </div>
                    </div>
                    <button
                        className="tts-toggle"
                        onClick={() => setTtsEnabled(!ttsEnabled)}
                        title={ttsEnabled ? 'TTS On' : 'TTS Off'}
                        style={{ fontSize: sizes.body }}
                    >
                        {ttsEnabled ? '🔊' : '🔇'}
                    </button>
                </div>
            </header>

            {/* Connection Lost Banner (server unreachable but internet up) */}
            {connectionLost && (
                <div className="connection-lost-banner" style={{ fontSize: sizes.body }}>
                    <span className="lang-en">{t('display', 'connectionLost', 'en')}</span>
                    <span className="lang-ml">{t('display', 'connectionLost', 'ml')}</span>
                    <span className="lang-hi">{t('display', 'connectionLost', 'hi')}</span>
                </div>
            )}

            {/* Announcement Bar */}
            <AnnouncementBar buses={arrivalBoard} sizes={sizes} />

            {/* Carousel indicator */}
            <div className="carousel-tab-bar" style={{ fontSize: sizes.small }}>
                {BOARD_LABELS.map((label, i) => (
                    <span
                        key={i}
                        className={`carousel-tab ${carouselIndex === i ? 'active' : ''}`}
                        onClick={() => setCarouselIndex(i)}
                    >
                        {label}
                    </span>
                ))}
            </div>

            {/* Boards - always carousel */}
            <main className="display-boards carousel-mode" style={{ flexDirection: 'column' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
                    {carouselIndex === 0 && <ArrivalBoard buses={arrivalBoard} sizes={sizes} />}
                    {carouselIndex === 1 && <DelayAlerts buses={delayAlerts} sizes={sizes} />}
                    {carouselIndex === 2 && <RecentDepartures buses={recentDepartures} sizes={sizes} />}
                </div>
            </main>

            {/* Footer */}
            <footer className="display-footer" style={{ fontSize: sizes.body }}>
                <p style={{ fontSize: sizes.small }}>
                    <span className="lang-en">{t('display', 'footer', 'en')}</span>
                    <span className="lang-ml">{t('display', 'footer', 'ml')}</span>
                    <span className="lang-hi">{t('display', 'footer', 'hi')}</span>
                </p>
            </footer>
        </div>
    );
};

export default DisplayPage;
