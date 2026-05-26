'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faq: FAQItem[];
}

export default function FAQAccordion({ faq }: FAQAccordionProps) {
  // Store an array of opened indices to allow expanding multiple questions independently
  const [openedIndices, setOpenedIndices] = useState<number[]>([]);

  const toggleIndex = (index: number) => {
    if (openedIndices.includes(index)) {
      setOpenedIndices(openedIndices.filter((i) => i !== index));
    } else {
      setOpenedIndices([...openedIndices, index]);
    }
  };

  if (!faq || faq.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
        <HelpCircle className="text-brown-700" size={20} />
        <h2 className="text-lg font-bold text-gray-900">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-3">
        {faq.map((item, idx) => {
          const isOpen = openedIndices.includes(idx);
          return (
            <div
              key={idx}
              className="border border-gray-100 rounded-xl overflow-hidden hover:border-brown-200 transition-colors"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-brown-50/20 text-left font-bold text-sm md:text-base text-gray-800 transition-colors cursor-pointer"
              >
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  size={18}
                  className={`text-gray-400 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-brown-600' : ''
                  }`}
                />
              </button>
              
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 text-sm md:text-base text-gray-600 leading-relaxed border-t border-gray-50 bg-white">
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
