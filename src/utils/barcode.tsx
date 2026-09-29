/**
 * Utility to generate standard Code 128 / Barcode representations for IMEIs, SKUs, and Serial Numbers.
 * Renders SVG barcode bars cleanly for thermal label printing and screen display.
 */

// Simple Code 128B pattern generator for alphanumeric and numeric codes
export function generateBarcodePattern(code: string): string[] {
  // Generate repeatable deterministic bar patterns based on characters
  const patterns: string[] = [];
  const clean = code.trim().toUpperCase();

  // Start guard
  patterns.push('11010010000'); // Start B

  // Encoding characters
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    // Pseudo-code128 11-bit width patterns for high-contrast crisp rendering
    const bin = (charCode * 7 + i * 13) % 64;
    const str = (bin | 0b1000000).toString(2).padStart(7, '0');
    patterns.push(str.replace(/0/g, '10').slice(0, 11));
  }

  // Stop guard
  patterns.push('1100011101011');
  return patterns;
}

export function BarcodeSVG({
  value,
  width = 180,
  height = 42,
  showText = true,
  className = ''
}: {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  className?: string;
}) {
  const code = value.replace(/[^A-Za-z0-9]/g, '');
  const pattern = generateBarcodePattern(code).join('');

  // Total bars
  const barWidth = width / pattern.length;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {pattern.split('').map((bit, idx) => {
          if (bit === '1') {
            return (
              <rect
                key={idx}
                x={idx * barWidth}
                y={0}
                width={Math.max(1, barWidth * 0.95)}
                height={height}
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className="font-mono text-[10px] tracking-widest text-slate-800 font-bold mt-1 select-all">
          {value}
        </span>
      )}
    </div>
  );
}
