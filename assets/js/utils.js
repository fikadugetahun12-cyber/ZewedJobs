// ============================================
// UTILITY FUNCTIONS
// Reusable helper functions
// ============================================

'use strict';

// Storage Utilities
const Storage = {
  // Local Storage with expiry
  setWithExpiry(key, value, ttl) {
    const item = {
      value: value,
      expiry: Date.now() + ttl
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  getWithExpiry(key) {
    const itemStr = localStorage.getItem(key);
    
    if (!itemStr) {
      return null;
    }
    
    const item = JSON.parse(itemStr);
    
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  },

  // Session Storage wrapper
  session: {
    set(key, value) {
      sessionStorage.setItem(key, JSON.stringify(value));
    },

    get(key) {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    },

    remove(key) {
      sessionStorage.removeItem(key);
    },

    clear() {
      sessionStorage.clear();
    }
  },

  // Cookie Utilities
  cookies: {
    set(name, value, days = 7) {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
    },

    get(name) {
      return document.cookie.split('; ').reduce((r, v) => {
        const parts = v.split('=');
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
      }, '');
    },

    remove(name) {
      this.set(name, '', -1);
    }
  }
};

// Validation Utilities
const Validator = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  isPhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  isURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isStrongPassword(password) {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    return {
      isValid: hasMinLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        length: hasMinLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        numbers: hasNumbers,
        special: hasSpecialChar
      }
    };
  },

  isCreditCard(number) {
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number.charAt(i), 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }
};

// Date Utilities
const DateUtils = {
  format(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    const replacements = {
      YYYY: d.getFullYear(),
      YY: String(d.getFullYear()).slice(-2),
      MM: String(d.getMonth() + 1).padStart(2, '0'),
      M: d.getMonth() + 1,
      DD: String(d.getDate()).padStart(2, '0'),
      D: d.getDate(),
      HH: String(d.getHours()).padStart(2, '0'),
      H: d.getHours(),
      hh: String(d.getHours() % 12 || 12).padStart(2, '0'),
      h: d.getHours() % 12 || 12,
      mm: String(d.getMinutes()).padStart(2, '0'),
      m: d.getMinutes(),
      ss: String(d.getSeconds()).padStart(2, '0'),
      s: d.getSeconds(),
      A: d.getHours() < 12 ? 'AM' : 'PM',
      a: d.getHours() < 12 ? 'am' : 'pm'
    };
    
    return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a/g, match => replacements[match]);
  },

  relativeTime(date) {
    const now = new Date();
    const diffMs = now - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    
    return this.format(date, 'YYYY-MM-DD');
  },

  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },

  addYears(date, years) {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },

  isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },

  isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear()
    );
  },

  getAge(birthDate) {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }
};

// String Utilities
const StringUtils = {
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  camelToKebab(str) {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  },

  kebabToCamel(str) {
    return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  },

  slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  truncate(str, length, suffix = '...') {
    return str.length > length ? str.substring(0, length) + suffix : str;
  },

  pluralize(count, singular, plural) {
    return count === 1 ? singular : (plural || singular + 's');
  },

  generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }
};

// DOM Utilities
const DOMUtils = {
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.keys(attributes).forEach(key => {
      if (key === 'className') {
        element.className = attributes[key];
      } else if (key === 'dataset') {
        Object.keys(attributes[key]).forEach(dataKey => {
          element.dataset[dataKey] = attributes[key][dataKey];
        });
      } else if (key.startsWith('on') && typeof attributes[key] === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), attributes[key]);
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    return element;
  },

  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  addClass(element, className) {
    element.classList.add(className);
  },

  removeClass(element, className) {
    element.classList.remove(className);
  },

  hasClass(element, className) {
    return element.classList.contains(className);
  },

  getScrollPosition() {
    return {
      x: window.pageXOffset || document.documentElement.scrollLeft,
      y: window.pageYOffset || document.documentElement.scrollTop
    };
  },

  isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  scrollTo(element, duration = 300) {
    const start = this.getScrollPosition();
    const target = element.getBoundingClientRect().top + start.y;
    const distance = target - start.y;
    let startTime = null;
    
    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      
      window.scrollTo(0, start.y + distance * easeInOutQuad(progress));
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    }
    
    function easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    requestAnimationFrame(animation);
  },

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  throttle(func, limit) {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

// Network Utilities
const NetworkUtils = {
  async checkConnection() {
    try {
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  getConnectionInfo() {
    if (navigator.connection) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData,
        type: conn.type
      };
    }
    return null;
  },

  async ping(url, timeout = 5000) {
    return new Promise((resolve) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        resolve(false);
      }, timeout);
      
      fetch(url, { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal
      })
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response.ok);
        })
        .catch(() => {
          clearTimeout(timeoutId);
          resolve(false);
        });
    });
  },

  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Math Utilities
const MathUtils = {
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  lerp(start, end, amount) {
    return start + (end - start) * amount;
  },

  round(value, decimals = 0) {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  },

  formatCurrency(amount, currency = 'USD', locale = 'en-US') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  calculatePercentage(value, total) {
    return total === 0 ? 0 : (value / total) * 100;
  },

  interpolate(start, end, progress) {
    return start * (1 - progress) + end * progress;
  }
};

// Color Utilities
const ColorUtils = {
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  lighten(color, percent) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const factor = 1 + (percent / 100);
    rgb.r = Math.min(255, Math.round(rgb.r * factor));
    rgb.g = Math.min(255, Math.round(rgb.g * factor));
    rgb.b = Math.min(255, Math.round(rgb.b * factor));
    
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  },

  darken(color, percent) {
    const rgb = this.hexToRgb(color);
    if (!rgb) return color;
    
    const factor = 1 - (percent / 100);
    rgb.r = Math.max(0, Math.round(rgb.r * factor));
    rgb.g = Math.max(0, Math.round(rgb.g * factor));
    rgb.b = Math.max(0, Math.round(rgb.b * factor));
    
    return this.rgbToHex(rgb.r, rgb.g, rgb.b);
  },

  getContrastColor(hexColor) {
    const rgb = this.hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    // Calculate relative luminance
    const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  },

  generateRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
};

// Array Utilities
const ArrayUtils = {
  chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  unique(array) {
    return [...new Set(array)];
  },

  flatten(array) {
    return array.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item) : item);
    }, []);
  },

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  },

  sortBy(array, key, order = 'asc') {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  findDeep(array, predicate, childrenKey = 'children') {
    for (const item of array) {
      if (predicate(item)) {
        return item;
      }
      if (item[childrenKey] && Array.isArray(item[childrenKey])) {
        const found = this.findDeep(item[childrenKey], predicate, childrenKey);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
};

// Object Utilities
const ObjectUtils = {
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  merge(target, ...sources) {
    sources.forEach(source => {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key]) && this.isObject(target[key])) {
          target[key] = this.merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      });
    });
    return target;
  },

  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  isEmpty(obj) {
    return Object.keys(obj).length === 0;
  },

  pick(obj, keys) {
    return keys.reduce((result, key) => {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
      return result;
    }, {});
  },

  omit(obj, keys) {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  get(obj, path, defaultValue) {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      result = result[key];
      if (result === undefined) {
        return defaultValue;
      }
    }
    
    return result;
  },

  set(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  }
};

// File Utilities
const FileUtils = {
  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  },

  getFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  },

  isValidFileType(file, allowedTypes) {
    return allowedTypes.includes(file.type);
  },

  isValidFileSize(file, maxSizeMB) {
    return file.size <= maxSizeMB * 1024 * 1024;
  },

  downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    NetworkUtils.downloadFile(url, filename);
    URL.revokeObjectURL(url);
  },

  downloadJSON(data, filename) {
    this.downloadText(JSON.stringify(data, null, 2), filename);
  }
};

// Export all utilities
window.Utils = {
  Storage,
  Validator,
  DateUtils,
  StringUtils,
  DOMUtils,
  NetworkUtils,
  MathUtils,
  ColorUtils,
  ArrayUtils,
  ObjectUtils,
  FileUtils
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.Utils;
}
