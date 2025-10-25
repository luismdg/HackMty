export function Select({ value, onValueChange, defaultValue, children, ...props }) {
    return (
        <select
            value={value}
            onChange={(e) => onValueChange?.(e.target.value)}
            defaultValue={defaultValue}
            className="w-full bg-[#09111E] border border-[#1E293B] px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#3B82F6]"
            {...props}
        >
            {children}
        </select>
    )
}

export function SelectTrigger({ children, className = "", ...props }) {
    return (
        <div
            className={`w-full bg-[#09111E] border border-[#1E293B] px-3 py-2 text-sm text-white ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export function SelectValue({ placeholder, ...props }) {
    return (
        <span className="text-white/80" {...props}>
            {placeholder}
        </span>
    )
}

export function SelectContent({ children, ...props }) {
    return (
        <div
            className="absolute z-50 w-full mt-1 bg-[#0C1526] border border-[#1E293B] shadow-lg"
            {...props}
        >
            {children}
        </div>
    )
}

export function SelectItem({ value, children, ...props }) {
    return (
        <option
            value={value}
            className="px-3 py-2 text-sm text-white hover:bg-[#1E293B] cursor-pointer"
            {...props}
        >
            {children}
        </option>
    )
}
