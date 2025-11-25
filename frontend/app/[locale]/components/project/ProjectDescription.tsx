'use client';

import { motion } from 'framer-motion';

interface ProjectDescriptionProps {
  fullDescription: string;
  isInView: boolean;
}

export default function ProjectDescription({
  fullDescription,
  isInView
}: ProjectDescriptionProps) {
  return (
    <motion.div
      className="relative bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-16 sm:w-24 md:w-32 h-16 sm:h-24 md:h-32 bg-gradient-to-br from-gray-50 to-transparent rounded-bl-full opacity-50"></div>
      
      <div className="relative p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-black to-gray-400 rounded-full"></div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-black">О проекте</h2>
        </div>
        
        <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm sm:text-base md:text-lg">
            {fullDescription}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

