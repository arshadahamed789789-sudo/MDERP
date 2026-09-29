/**
 * Formats a number into Bangladeshi Taka format (e.g., ৳1,50,000)
 */
export function formatBDT(amount: number | undefined | null, includeSymbol: boolean = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeSymbol ? '৳0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));

  // Convert to Indian/Bangladeshi numbering system (lakhs, crores)
  const str = absAmount.toString();
  let result = '';

  if (str.length <= 3) {
    result = str;
  } else {
    const lastThree = str.substring(str.length - 3);
    const otherNumbers = str.substring(0, str.length - 3);
    const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    result = formattedOther + ',' + lastThree;
  }

  const prefix = isNegative ? '-' : '';
  const symbol = includeSymbol ? '৳' : '';
  return `${prefix}${symbol}${result}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateTimeString: string | undefined): string {
  if (!dateTimeString) return '-';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return dateTimeString;
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return dateTimeString;
  }
}

export function getPriceForCustomer(
  variant: {
    retailPrice: number;
    wholesalePrice: number;
    dealerPrice: number;
    minSellingPrice: number;
  },
  priceLevel: 'retail' | 'wholesale' | 'dealer' | 'special'
): number {
  switch (priceLevel) {
    case 'dealer':
      return variant.dealerPrice;
    case 'wholesale':
      return variant.wholesalePrice;
    case 'special':
      return variant.dealerPrice; // or slightly discounted
    case 'retail':
    default:
      return variant.retailPrice;
  }
}
