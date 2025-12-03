import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const shimmer = {
    hidden: { x: '-100%' },
    visible: {
      x: '100%',
      transition: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'linear',
      },
    },
  };

  const SkeletonCard = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card relative overflow-hidden"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={shimmer}
        initial="hidden"
        animate="visible"
      />

      {/* Icon skeleton */}
      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-xl mx-auto mb-4 animate-pulse" />

      {/* Title skeleton */}
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded-lg mb-3 w-3/4 mx-auto animate-pulse" />

      {/* Description skeleton */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full animate-pulse" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mx-auto animate-pulse" />
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-4/6 mx-auto animate-pulse" />
      </div>

      {/* Button skeleton */}
      <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
    </motion.div>
  );

  const SkeletonRow = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        variants={shimmer}
        initial="hidden"
        animate="visible"
      />

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );

  const SkeletonList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            variants={shimmer}
            initial="hidden"
            animate="visible"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
          <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </motion.div>
  );

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(count)].map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (type === 'row') {
    return (
      <div className="space-y-4">
        {[...Array(count)].map((_, index) => (
          <SkeletonRow key={index} />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return <SkeletonList />;
  }

  return null;
};

export default LoadingSkeleton;
