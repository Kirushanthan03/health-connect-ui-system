const dateUtils = {
    toBackendFormat: (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    formatDisplayDate: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    },

    formatDisplayTime: (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    parseDateTime: (dateTimeString: string) => {
        const [date, time] = dateTimeString.split(' ');
        return { date, time };
    }
};

export default dateUtils; 