import React from 'react';
import * as Icons from 'lucide-react';

interface FriendlyEmptyStateProps {
  iconName: keyof typeof Icons;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const FriendlyEmptyState: React.FC<FriendlyEmptyStateProps> = ({
  iconName,
  title,
  description,
  actionText,
  onAction,
}) => {
  // Dynamically resolve the Lucide icon from the string name, fallback to Sprout
  const IconComponent = (Icons[iconName] as React.ComponentType<{ className?: string }>) || Icons.Sprout;

  return (
    <div className="flex flex-col items-center justify-center text-center p-6 my-auto max-w-sm mx-auto">
      {/* Icon Frame with premium rural/agricultural styling */}
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-rural-green-100 rounded-full scale-110 animate-pulse opacity-60"></div>
        <div className="relative flex items-center justify-center w-20 h-20 bg-rural-green-500 text-cream-50 rounded-full shadow-lg border-4 border-cream-950">
          <IconComponent className="w-10 h-10 stroke-[2]" />
        </div>
      </div>

      {/* Typography with readability constraints */}
      <h2 className="text-2xl font-bold text-earth-900 leading-tight mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-base text-earth-700 font-normal leading-relaxed mb-8 max-w-xs">
        {description}
      </p>

      {/* Reusable Large Touch Target Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="w-full sm:w-auto px-8 py-3.5 bg-rural-green-800 text-cream-50 font-semibold rounded-2xl hover:bg-rural-green-900 active:scale-95 transition-all duration-150 shadow-md hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-rural-green-300 text-base"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
