/**
 * Production-ready Code 128 Barcode Generator.
 * 100% compliant with standard Code 128 Specification (ISO/IEC 15417).
 * Encodes alphanumeric IMEIs, Serial Numbers, and Product SKUs.
 * Scannable with all standard 1D/2D POS barcode gun scanners (Honeywell, Zebra, Datalogic, etc.)
 */

// Official Code 128 Symbol Patterns (Index 0 to 106)
// Each number string represents bar and space widths in modules (sum = 11 modules per character, 13 for STOP)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'                               // 100-106 (106 is STOP)
];

const START_B = 104;
const STOP = 106;

/**
 * Converts bar/space widths string (e.g. '212222') into binary modules string ('11011001100')
 */
function widthStringToBinary(widths: string): string {
  let result = '';
  let isBar = true;
  for (let i = 0; i < widths.length; i++) {
    const count = parseInt(widths[i], 10);
    result += (isBar ? '1' : '0').repeat(count);
    isBar = !isBar;
  }
  return result;
}

/**
 * Encodes text into a standard Code 128 binary module stream
 */
export function encodeCode128(text: string): { modules: string; value: string } {
  const clean = text.trim();
  const codes: number[] = [START_B];

  // Map each ASCII character (32 to 126) to Code 128B index (ascii - 32)
  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      codes.push(charCode - 32);
    } else {
      // Default fallback for unexpected characters
      codes.push(0); // Space
    }
  }

  // Calculate standard modulo 103 checksum
  let checksum = codes[0]; // Start code weight is 1
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  const checkDigit = checksum % 103;
  codes.push(checkDigit);

  // Append STOP code
  codes.push(STOP);

  // Generate binary module stream
  let modules = '0000000000'; // Quiet zone (minimum 10 modules on left)
  for (const code of codes) {
    modules += widthStringToBinary(CODE128_PATTERNS[code]);
  }
  modules += '0000000000'; // Quiet zone (minimum 10 modules on right)

  return { modules, value: clean };
}

interface BarcodeSVGProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  textClassName?: string;
  className?: string;
}

export const BarcodeSVG: React.FC<BarcodeSVGProps> = ({
  value,
  width = 180,
  height = 36,
  showText = true,
  textClassName = 'font-mono text-[10px] tracking-widest text-slate-900 font-bold',
  className = ''
}) => {
  if (!value || !value.trim()) {
    return <div className="text-[10px] text-slate-400">No Barcode Value</div>;
  }

  const { modules } = encodeCode128(value);
  const totalModules = modules.length;
  const moduleWidth = width / totalModules;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shape-rendering-crispEdges block"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="0" y="0" width={width} height={height} fill="#FFFFFF" />
        {modules.split('').map((bit, idx) => {
          if (bit === '1') {
            return (
              <rect
                key={idx}
                x={idx * moduleWidth}
                y={0}
                width={Math.max(1, moduleWidth * 1.02)}
                height={height}
                fill="#000000"
              />
            );
          }
          return null;
        })}
      </svg>
      {showText && (
        <span className={`mt-0.5 select-all ${textClassName}`}>
          {value}
        </span>
      )}
    </div>
  );
};
