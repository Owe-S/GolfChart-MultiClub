import { useState } from 'react';
import '../ski-gk-theme.css';

interface CalendarProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    minDate?: string;
    maxDate?: string;
}

function Calendar({ selectedDate, onDateChange, minDate, maxDate }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const date = new Date(selectedDate);
        return new Date(date.getFullYear(), date.getMonth(), 1);
    });

    const selected = new Date(selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthNames = [
        'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
    ];

    const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

    // Get days in month
    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        // Convert to Monday = 0
        let firstDayOfWeek = firstDay.getDay() - 1;
        if (firstDayOfWeek === -1) firstDayOfWeek = 6;

        const days: (number | null)[] = [];

        // Add empty cells for days before month starts
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        // Add days of month
        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(i);
        }

        return days;
    };

    const days = getDaysInMonth(currentMonth);

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDayClick = (day: number) => {
        // Create date string manually using local time components
        const year = currentMonth.getFullYear();
        const month = (currentMonth.getMonth() + 1).toString().padStart(2, '0');
        const dayStr = day.toString().padStart(2, '0');
        const dateString = `${year}-${month}-${dayStr}`;

        // Check if date is within allowed range
        if (minDate && dateString < minDate) return;
        if (maxDate && dateString > maxDate) return;

        onDateChange(dateString);
    };

    const isDateDisabled = (day: number) => {
        if (!day) return false;

        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dateString = date.toISOString().split('T')[0];

        if (minDate && dateString < minDate) return true;
        if (maxDate && dateString > maxDate) return true;

        return false;
    };

    const isDateSelected = (day: number) => {
        if (!day) return false;

        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return (
            date.getFullYear() === selected.getFullYear() &&
            date.getMonth() === selected.getMonth() &&
            date.getDate() === selected.getDate()
        );
    };

    const isToday = (day: number) => {
        if (!day) return false;

        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
        );
    };

    return (
        <div className="ski-calendar">
            {/* Month navigation */}
            <div className="ski-calendar-header">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="ski-calendar-nav-btn"
                    aria-label="Forrige måned"
                >
                    ‹
                </button>
                <h2 className="ski-calendar-month">
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="ski-calendar-nav-btn"
                    aria-label="Neste måned"
                >
                    ›
                </button>
            </div>

            {/* Day names */}
            <div className="ski-calendar-grid">
                {dayNames.map(day => (
                    <div key={day} className="ski-calendar-day-name">
                        {day}
                    </div>
                ))}

                {/* Days */}
                {days.map((day, index) => (
                    <div
                        key={index}
                        className={`ski-calendar-day ${day ? '' : 'empty'} ${isDateSelected(day!) ? 'selected' : ''} ${isToday(day!) ? 'today' : ''} ${isDateDisabled(day!) ? 'disabled' : ''}`}
                        onClick={() => day && !isDateDisabled(day) && handleDayClick(day)}
                    >
                        {day}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar;
