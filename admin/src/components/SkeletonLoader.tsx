import '../ski-gk-theme.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'circle' | 'line';
  width?: string;
  height?: string;
  count?: number;
}

function SkeletonLoader({ type = 'card', width = '100%', height = '40px', count = 1 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((index) => (
        <div
          key={index}
          className="skeleton-loader"
          style={{
            width,
            height,
            borderRadius: type === 'circle' ? '50%' : type === 'card' ? '8px' : '4px',
          }}
        />
      ))}
    </>
  );
}

export default SkeletonLoader;
