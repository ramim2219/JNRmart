export default function Preloader() {
  return <div className="preloader" role="status" aria-live="polite"><img className="preloader-brand" src="/jnrmart-logo.png" alt="JNRmart" /><div className="loader-spinner"/><span>Loading store...</span></div>;
}
