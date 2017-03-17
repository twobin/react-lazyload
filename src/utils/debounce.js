export default function debounce(func, wait, immediate) {
  let timeout;
  let args;
  let context;
  let timestamp;
  let result;

  const later = function later() {
    const last = +(new Date()) - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        if (!timeout) {
          context = null;
          args = null;
        }
      }
    }
  };

  return function debounced() {
    context = this;
    args = arguments;
    timestamp = +(new Date());

    const callNow = immediate && !timeout;
    if (!timeout) {
      timeout = setTimeout(later, wait);
    }

    if (callNow) {
      result = func.apply(context, args);
      context = null;
      args = null;
    }

    return result;
  };
}
