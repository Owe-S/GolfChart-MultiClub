import '../ski-gk-theme.css';
import SkeletonLoader from './SkeletonLoader';

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="skeleton-table-row">
          <SkeletonLoader type="text" width="80px" height="16px" />
          <SkeletonLoader type="text" width="100px" height="16px" />
          <SkeletonLoader type="text" width="120px" height="16px" />
          <SkeletonLoader type="text" width="90px" height="16px" />
          <SkeletonLoader type="text" width="60px" height="16px" />
        </div>
      ))}
    </div>
  );
}

export default SkeletonTable;
