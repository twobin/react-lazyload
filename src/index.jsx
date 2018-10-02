import LazyLoad, { lazyLoadHandler } from './lazyload';
import decorator from './decorator';
export const lazyload = decorator;
export default LazyLoad;
export { lazyLoadHandler as forceCheck };
