'use client';

import React from 'react';
import { Calendar, TrendingUp, CheckCircle2 } from 'lucide-react';
import { WeeklyAdherenceHistory } from '../../lib/types';
import { useLanguage } from '../../context/LanguageContext';

interface WeeklyStreakCardProps {
  history: WeeklyAdherenceHistory | null;
  loading: boolean;
}

export function WeeklyStreakCard({ history, loading }: WeeklyStreakCardProps) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || !history.days || history.days.length === 0) {
    return null;
  }

  const avg = history.average_compliance;
  const isHigh = avg >= 80;
  const isMedium = avg >= 50 && avg < 80;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
              {t('weekly_streak_title', '7-Day Adherence Trend')}
            </h3>
            <p className="text-xs text-gray-500">
              {t('weekly_streak_desc', 'Daily medication consistency & streak tracking')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isHigh
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isMedium
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {avg}% 7-Day Average
          </span>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {history.days.map((day, idx) => {
          const isToday = idx === history.days.length - 1;
          const isPerfect = day.percentage === 100;
          const isZero = day.percentage === 0;

          return (
            <div
              key={day.date}
              className={`p-3 rounded-2xl flex flex-col items-center justify-between transition border ${
                isToday
                  ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-gray-50/70 border-gray-200/70'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {isToday ? 'Today' : day.day_name}
              </span>

              {/* Progress visual */}
              <div className="my-2 flex flex-col items-center">
                <span
                  className={`text-sm sm:text-base font-black ${
                    isPerfect
                      ? 'text-emerald-700'
                      : isZero
                      ? 'text-gray-400'
                      : 'text-amber-600'
                  }`}
                >
                  {day.percentage}%
                </span>
                <span className="text-[10px] text-gray-400 font-medium">
                  {day.taken}/{day.total}
                </span>
              </div>

              {/* Status pill dot */}
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isPerfect
                    ? 'bg-emerald-500'
                    : isZero
                    ? 'bg-gray-300'
                    : 'bg-amber-500'
                }`}
                title={`${day.taken} taken, ${day.skipped} skipped out of ${day.total}`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
