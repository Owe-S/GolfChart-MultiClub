import '../ski-gk-theme.css';

interface SkeletonLoaderProps {
  type?: 'card' | 'text' | 'circle' | 'line';
  width?: string;
  height?: string;
  count?: number;
}

function SkeletonLoader({ type = 'card', width = '100%', height = '40px', count = 1 }: SkeletonLoaderProps) {
  const items = Array.from({ length: count }, (_, i) => i);
  
  const getBorderRadius = () => {
    if (type === 'circle') return '50%';
    if (type === 'card') return '8px';
    return '4px';
  };

  return (
    <>
      {items.map((index) => (
        <div
          key={index}
          className="skeleton-loader skeleton-loader-dynamic"
          data-width={width}
          data-height={height}
          data-radius={getBorderRadius()}
        />
      ))}
    </>
  );
}

export default SkeletonLoader;
