import '../ski-gk-theme.css';
import SkeletonLoader from './SkeletonLoader';

function SkeletonChart() {
  return (
    <div className="skeleton-chart">
      <div className="skeleton-chart-title">
        <SkeletonLoader type="text" width="200px" height="20px" />
      </div>
      <div className="skeleton-chart-content">
        <SkeletonLoader type="card" width="100%" height="300px" />
      </div>
    </div>
  );
}

export default SkeletonChart;
