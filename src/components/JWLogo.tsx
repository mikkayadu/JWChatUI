import { useLocale } from '../i18n/locale'

interface JWLogoProps {
  className?: string
  size?: number
}

export default function JWLogo({ className = '', size = 40 }: JWLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="120" height="120" rx="24" fill="currentColor" />
      <text
        x="60"
        y="52"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="'Inter', Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        letterSpacing="-1"
      >
        JW
      </text>
      <text
        x="60"
        y="88"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontFamily="'Inter', Arial, sans-serif"
        fontWeight="600"
        fontSize="20"
        letterSpacing="3"
        opacity="0.85"
      >
        .ORG
      </text>
    </svg>
  )
}

export function JWWatermark({ className = '' }: { className?: string }) {
  const { strings: t } = useLocale()
  return (
    <div className={`flex flex-col items-center gap-3 select-none pointer-events-none ${className}`}>
      <JWLogo size={72} className="text-primary/[0.06]" />
      <p className="text-sm font-medium text-text-primary/[0.08] tracking-wide">
        {t.tagline}
      </p>
    </div>
  )
}
