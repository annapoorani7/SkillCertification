import React, { useState, useEffect } from 'react';

const RealTimeClock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timerId);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString(undefined, { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
    };

    return (
        <div className="real-time-clock">
            <div className="clock-time">{formatTime(time)}</div>
            <div className="clock-date">{formatDate(time)}</div>
        </div>
    );
};

export default RealTimeClock;
