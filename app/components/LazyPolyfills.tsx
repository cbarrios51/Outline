import * as React from "react";
import { loadPolyfills } from "~/utils/polyfills";

/**
 * Asyncronously load required polyfills. Should wrap the React tree.
 */
export const LazyPolyfill: React.FC = ({ children }) => {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoaded(true), 2000);
    loadPolyfills()
      .then(() => setIsLoaded(true))
      .catch(() => setIsLoaded(true))
      .finally(() => window.clearTimeout(timeout));
    return () => window.clearTimeout(timeout);
  }, []);

  if (!isLoaded) {
    return null;
  }

  return <>{children}</>;
};

export default LazyPolyfill;
