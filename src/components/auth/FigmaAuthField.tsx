interface FigmaAuthFieldProps {
  autoComplete: string;
  disabled: boolean;
  id: string;
  inputComponentFrameSrc: string;
  inputInnerFrameSrc: string;
  label: string;
  onChange: (value: string) => void;
  placeholder: string;
  type: string;
  value: string;
}

export function FigmaAuthField({
  autoComplete,
  disabled,
  id,
  inputComponentFrameSrc,
  inputInnerFrameSrc,
  label,
  onChange,
  placeholder,
  type,
  value,
}: FigmaAuthFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-0 block px-6 font-['Bahianita',sans-serif] text-[28px] leading-none text-[#a02317]"
      >
        {label}
      </label>
      <div className="relative h-[68px] w-full">
        <img
          src={inputComponentFrameSrc}
          alt=""
          className="absolute inset-0 block h-full w-full"
          draggable={false}
        />
        <img
          src={inputInnerFrameSrc}
          alt=""
          className="absolute left-[12px] top-[8px] h-[42.5px] w-[282px] max-w-none"
          draggable={false}
        />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="absolute left-[12px] top-[10px] h-[41px] w-[282px] appearance-none border-none bg-transparent px-[17px] py-0 font-['Bahianita',sans-serif] text-[26px] leading-[41px] text-black outline-none placeholder:text-[#b8b8b8] disabled:opacity-60"
        />
      </div>
    </div>
  );
}
