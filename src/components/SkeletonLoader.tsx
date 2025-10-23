import * as React from 'react';

export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`relative overflow-hidden bg-muted dark:bg-surface-dark rounded-lg ${className}`}
  >
    <div className="absolute inset-0 transform -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-sand dark:via-bg-dark to-transparent" />
  </div>
);

export const ReportCardSkeleton: React.FC = () => (
  <div className="bg-card dark:bg-surface-dark p-4 rounded-2xl shadow-md flex items-start gap-4">
    <Shimmer className="w-24 h-24 rounded-xl flex-shrink-0" />
    <div className="flex-1 space-y-3 pt-1 w-full">
      <Shimmer className="h-4 w-1/3" />
      <Shimmer className="h-5 w-4/5" />
      <Shimmer className="h-4 w-full" />
      <div className="flex items-center justify-between pt-2">
        <Shimmer className="h-4 w-1/4" />
        <Shimmer className="h-4 w-1/3" />
      </div>
    </div>
  </div>
);

export const ReportListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <ReportCardSkeleton key={i} />
    ))}
  </div>
);

export const ProfileSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto">
    <Shimmer className="h-8 w-1/4 mb-6" />
    <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md mb-8 flex flex-col sm:flex-row items-center gap-6">
      <Shimmer className="w-24 h-24 rounded-full flex-shrink-0" />
      <div className="flex-1 w-full space-y-3">
        <Shimmer className="h-7 w-1/2" />
        <Shimmer className="h-5 w-1/3" />
        <div className="flex gap-2 pt-2">
          <Shimmer className="h-6 w-24 rounded-full" />
          <Shimmer className="h-6 w-28 rounded-full" />
        </div>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md space-y-6">
            <Shimmer className="h-6 w-1/3" />
            <Shimmer className="h-8 w-full" />
            <Shimmer className="h-8 w-full" />
            <Shimmer className="h-8 w-full" />
        </div>
        <div className="bg-card dark:bg-surface-dark p-6 rounded-2xl shadow-md space-y-4">
            <Shimmer className="h-6 w-1/3 mb-2" />
            <div className="flex items-center gap-4">
                <Shimmer className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="w-full space-y-2">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-2/3" />
                </div>
            </div>
             <div className="flex items-center gap-4">
                <Shimmer className="w-16 h-16 rounded-lg flex-shrink-0" />
                <div className="w-full space-y-2">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-4 w-2/3" />
                </div>
            </div>
        </div>
    </div>
  </div>
);

export const NotificationsSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-4 rounded-xl flex items-start gap-4 bg-card dark:bg-surface-dark">
                <Shimmer className="w-10 h-10 rounded-full flex-shrink-0" />
                <div className="flex-grow space-y-2 pt-1">
                    <Shimmer className="h-4 w-full" />
                    <Shimmer className="h-3 w-1/3" />
                </div>
            </div>
        ))}
    </div>
);

export const ReportDetailsSkeleton: React.FC = () => (
    <div className="max-w-4xl mx-auto">
        <Shimmer className="h-6 w-24 mb-4" />
        <div className="bg-card dark:bg-surface-dark p-4 sm:p-6 rounded-2xl shadow-md">
            <Shimmer className="w-full h-80 rounded-xl mb-6" />
            <div className="flex justify-between items-start gap-4 mb-4">
                <Shimmer className="h-8 w-1/3" />
                <Shimmer className="h-8 w-24 rounded-full" />
            </div>
            <Shimmer className="h-10 w-4/5 mb-4" />
            <Shimmer className="h-5 w-full mb-2" />
            <Shimmer className="h-5 w-full mb-2" />
            <Shimmer className="h-5 w-2/3 mb-6" />
            <div className="border-t border-border-light dark:border-border-dark my-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <Shimmer className="h-6 w-1/4" />
                    <Shimmer className="h-4 w-1/2" />
                    <Shimmer className="h-64 w-full rounded-xl" />
                </div>
                 <div className="flex flex-col items-center justify-center bg-muted dark:bg-bg-dark p-6 rounded-xl text-center space-y-3">
                    <Shimmer className="h-12 w-12 rounded-full" />
                    <Shimmer className="h-8 w-16" />
                    <Shimmer className="h-5 w-24 mb-2" />
                    <div className="w-full flex gap-2">
                        <Shimmer className="h-12 w-full rounded-full" />
                        <Shimmer className="h-12 w-full rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const LeaderboardSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => (
    <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
             <div key={i} className="flex items-center gap-4 bg-muted dark:bg-bg-dark p-3 rounded-xl">
                <Shimmer className="w-10 h-6" />
                <Shimmer className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                    <Shimmer className="h-5 w-3/4" />
                </div>
                <div className="w-12">
                    <Shimmer className="h-6 w-full" />
                </div>
            </div>
        ))}
    </div>
);