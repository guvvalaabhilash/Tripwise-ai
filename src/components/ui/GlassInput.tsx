import React from 'react'

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...rest }) => {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className}`}>
      {label && <span className="text-[12px] text-[#A8B2D1]">{label}</span>}
      <input
        {...rest}
        className="glass p-3 rounded-xl bg-transparent border border-transparent focus:border-cyan/40 outline-none transition-all"
      />
    </label>
  )
}

export default GlassInput
