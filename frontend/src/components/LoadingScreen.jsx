export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

