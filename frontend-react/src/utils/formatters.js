/**
 * String Formatting Utilities
 */

export const formatters = {
  /**
   * Format date to readable format
   */
  formatDate: (date, format = 'MMM DD, YYYY') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const formats = {
      'YYYY-MM-DD': `${year}-${month}-${day}`,
      'MM/DD/YYYY': `${month}/${day}/${year}`,
      'MMM DD, YYYY': `${d.toLocaleString('en-US', { month: 'short' })} ${day}, ${year}`,
      'YYYY-MM-DD HH:mm': `${year}-${month}-${day} ${hours}:${minutes}`,
    };

    return formats[format] || d.toLocaleDateString();
  },

  /**
   * Format currency
   */
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  /**
   * Format phone number
   */
  formatPhone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone;
  },

  /**
   * Format name to Title Case
   */
  formatName: (name) => {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Truncate string
   */
  truncate: (str, length = 50) => {
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  /**
   * Format file size
   */
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Format time difference (e.g., "2 hours ago")
   */
  formatTimeAgo: (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [key, value] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / value);
      if (interval >= 1) {
        return `${interval} ${key}${interval > 1 ? 's' : ''} ago`;
      }
    }

    return 'just now';
  },
};
