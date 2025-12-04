import '../ski-gk-theme.css';
import SkeletonLoader from './SkeletonLoader';

function SkeletonCard() {
  return (
    <div className="stat-card skeleton-card">
      <div className="stat-icon">
        <SkeletonLoader type="circle" width="40px" height="40px" />
      </div>
      <div className="stat-content">
        <SkeletonLoader type="text" width="60px" height="28px" />
        <SkeletonLoader type="text" width="100px" height="16px" />
      </div>
    </div>
  );
}

export default SkeletonCard;
