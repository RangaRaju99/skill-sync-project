/**
 * Common Utility Functions
 */

/**
 * Debounce function
 * Delays function execution until after a specified time has passed
 * Usage: const debouncedSearch = debounce(searchFn, 300);
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle function
 * Ensures function executes at most once during a specified time period
 * Usage: const throttledScroll = throttle(handleScroll, 300);
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Merge objects deeply
 */
export function deepMerge(target, source) {
  const output = Object.assign({}, target);

  Object.keys(source).forEach((key) => {
    if (
      source[key] !== null &&
      source[key] !== undefined &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  });

  return output;
}

/**
 * Clone object deeply
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map((item) => deepClone(item));
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * Check if value is empty
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Get value from nested object safely
 * Usage: getNestedValue(obj, 'user.profile.name')
 */
export function getNestedValue(obj, path, defaultValue = undefined) {
  const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
  return value !== undefined ? value : defaultValue;
}

/**
 * Set value in nested object
 * Usage: setNestedValue(obj, 'user.profile.name', 'John')
 */
export function setNestedValue(obj, path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  const target = keys.reduce((acc, key) => (acc[key] = acc[key] || {}), obj);
  target[lastKey] = value;
  return obj;
}

/**
 * Group array by property
 * Usage: groupBy(users, 'department')
 */
export function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {});
}

/**
 * Flatten nested array
 */
export function flatten(arr) {
  return arr.reduce((flat, item) => {
    return flat.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates(arr, key = null) {
  if (!key) {
    return [...new Set(arr)];
  }

  const seen = new Set();
  return arr.filter((item) => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}
