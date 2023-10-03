const SECOND = 1000; // Milliseconds
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatTime(duration: number): string {
    if (duration < 5 * SECOND) {
        return 'now';
    } else if (duration < MINUTE) {
        return `${Math.floor(duration / SECOND)}s`;
    } else if (duration < 20 * MINUTE) {
        const minutes = Math.floor(duration / MINUTE);
        const seconds = Math.floor((duration % MINUTE) / SECOND);
        return `${minutes}min ${seconds}s`;
    } else if (duration < HOUR) {
        return `${Math.floor(duration / MINUTE)}min`;
    } else if (duration < 72 * HOUR) {
        return `${Math.floor(duration / HOUR)}h`;
    } else {
        const days = Math.floor(duration / DAY);
        const hours = Math.floor((duration % DAY) / HOUR);
        return `${days}d ${hours}h`;
    }
}

export function calculateUptime(startDate: Date): string {
    const duration = new Date().getTime() - startDate.getTime();
    return formatTime(duration);
}
