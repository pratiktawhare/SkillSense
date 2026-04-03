import Breadcrumb from '../components/Breadcrumb';
import MatchingView from './MatchingView';

const MatchingPage = () => {
    return (
        <div>
            <Breadcrumb />
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Matching</h1>
            <MatchingView />
        </div>
    );
};

export default MatchingPage;
