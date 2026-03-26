import { Activity, AlertTriangle, Box, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'no-apis' | 'no-incidents' | 'no-results' | 'error' | 'loading';
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState = ({ 
  type = 'no-apis',
  title,
  description,
  action
}: EmptyStateProps) => {
  const configs = {
    'no-apis': {
      icon: <Box className="w-16 h-16 text-gray-400" />,
      title: title || 'No APIs Added Yet',
      description: description || 'Start monitoring your APIs by adding your first endpoint.',
      color: 'text-gray-500'
    },
    'no-incidents': {
      icon: <Activity className="w-16 h-16 text-emerald-400" />,
      title: title || 'All Systems Operational',
      description: description || 'No incidents reported. Your APIs are running smoothly.',
      color: 'text-emerald-500'
    },
    'no-results': {
      icon: <Search className="w-16 h-16 text-gray-400" />,
      title: title || 'No Results Found',
      description: description || 'Try adjusting your search or filters.',
      color: 'text-gray-500'
    },
    'error': {
      icon: <AlertTriangle className="w-16 h-16 text-red-400" />,
      title: title || 'Something Went Wrong',
      description: description || 'We couldn\'t load your data. Please try again.',
      color: 'text-red-500'
    },
    'loading': {
      icon: <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />,
      title: title || 'Loading...',
      description: description || 'Please wait while we fetch your data.',
      color: 'text-blue-500'
    }
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        {config.icon}
      </div>
      <h3 className={`text-xl font-semibold mb-2 ${config.color}`}>
        {config.title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        {config.description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors duration-200 shadow-lg shadow-blue-500/30"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
