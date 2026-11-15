'use client';

import React, { useEffect, useRef } from 'react';
import { Delete, RotateCcw } from 'lucide-react';

interface PinPadProps {
  pin: string;
  onChange: (pin: string) => void;
  maxLength?: number;
}

export function PinPad({ pin, onChange, maxLength = 6 }: PinPadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDigit = (digit: string) => {
    if (pin.length < maxLength) {
      onChange(pin + digit);
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      onChange(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    onChange('');
  };

  // Keyboard support: allows typing directly from physical keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in another text input (like email)
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT' && target !== inputRef.current) {
        return;
      }

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, maxLength]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Physical Keyboard Input Box */}
      <div className="w-full max-w-[280px] mb-4">
        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={maxLength}
          value={pin}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '').slice(0, maxLength);
            onChange(val);
          }}
          placeholder="Type 6-digit PIN"
          className="w-full px-4 py-3 text-center tracking-widest text-2xl font-mono font-bold border-2 border-gray-300 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition shadow-inner bg-gray-50/50"
        />
      </div>

      {/* Visual PIN Dots */}
      <div className="flex gap-2.5 mb-5">
        {Array.from({ length: maxLength }).map((_, i) => (
          <div
            key={i}
            className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border-2 ${
              i < pin.length
                ? 'bg-emerald-600 border-emerald-600 scale-110 shadow-sm'
                : 'bg-gray-100 border-gray-300'
            }`}
          />
        ))}
      </div>

      {/* On-Screen Touch Numpad */}
      <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <button
            type="button"
            key={digit}
            onClick={() => handleDigit(digit)}
            className="h-12 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-lg font-bold text-gray-800 border border-gray-200 hover:border-emerald-300 shadow-sm transition flex items-center justify-center focus:outline-none"
          >
            {digit}
          </button>
        ))}

        <button
          type="button"
          onClick={handleClear}
          title="Clear"
          className="h-12 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 border border-gray-200 transition flex items-center justify-center focus:outline-none"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="h-12 rounded-2xl bg-white hover:bg-emerald-50 active:scale-95 text-lg font-bold text-gray-800 border border-gray-200 hover:border-emerald-300 shadow-sm transition flex items-center justify-center focus:outline-none"
        >
          0
        </button>

        <button
          type="button"
          onClick={handleDelete}
          title="Backspace"
          className="h-12 rounded-2xl bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-500 border border-gray-200 transition flex items-center justify-center focus:outline-none"
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-2">
        Type on your keyboard or tap the buttons above
      </p>
    </div>
  );
}
