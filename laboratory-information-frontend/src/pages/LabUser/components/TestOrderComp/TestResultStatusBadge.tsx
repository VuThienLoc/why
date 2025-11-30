import React from 'react';
import { CheckCircle, FileText } from 'lucide-react';

interface TestResultStatusBadgeProps {
  status: string;
}

const TestResultStatusBadge: React.FC<TestResultStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    Completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
    Reviewed: { color: 'bg-gray-100 text-gray-800', icon: FileText }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Completed;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1 flex-shrink-0" />
      <span className="truncate max-w-[100px] sm:max-w-none">{status}</span>
    </span>
  );
};

export default TestResultStatusBadge;

