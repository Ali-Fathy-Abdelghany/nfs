import React, { useState } from 'react';

const Input = ({ type = "text", placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const isControlled = typeof onChange === 'function';
  const currentValue = isControlled ? (value ?? '') : undefined;
  
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (showPassword ? "text" : "password") : type;
  
  // الحالة: الحقل عليه تركيز أو يوجد به نص مكتوب
  const isActive = isFocused || (isControlled && String(currentValue).length > 0);

  return (
    <div className="relative w-full">
      {/* الـ Label العائم */}
      <label 
        className={`absolute right-6 transition-all duration-300 pointer-events-none px-2 bg-white z-10
          ${isActive 
            ? '-top-2.5 text-xs text-[#316764] font-semibold' 
            : 'top-[18px] text-base text-gray-400'}`}
      >
        {placeholder}
      </label>

      <input
        type={inputType}
        {...(isControlled
          ? { value: currentValue, onChange }
          : {})}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full p-4 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-[#316764] outline-none transition-all pl-4 pr-14 text-right z-0"
      />
      
      {/* أيقونة العين */}
      {isPasswordField && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#316764] p-2 z-20"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#2A5C58" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="#2A5C58" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
        </button>
      )}
    </div>
  );
};

export default Input;
