class SubCurrencyModel {
  final String id;
  final String currencyCode;
  final String? currencyName;
  final String? currencySymbol;
  final double? exchangeRate; // 1 [subCurrency] = X [mainCurrency]

  SubCurrencyModel({
    required this.id,
    required this.currencyCode,
    this.currencyName,
    this.currencySymbol,
    this.exchangeRate,
  });

  factory SubCurrencyModel.fromJson(Map<String, dynamic> json) {
    return SubCurrencyModel(
      id: json['id'] as String,
      currencyCode: json['currencyCode'] as String? ?? '',
      currencyName: json['currencyName'] as String?,
      currencySymbol: json['currencySymbol'] as String?,
      exchangeRate: (json['exchangeRate'] as num?)?.toDouble(),
    );
  }
}

/// A plain currency entry from the countries data
class CurrencyEntry {
  final String code;
  final String symbol;
  final String countryName;

  const CurrencyEntry({
    required this.code,
    required this.symbol,
    required this.countryName,
  });

  /// Display label: "IDR - Indonesia (Rp)"
  String get label => '$code - $countryName ($symbol)';
}

/// All supported currencies — built from the countries.json constants
const List<CurrencyEntry> kAllCurrencies = [
  CurrencyEntry(code: 'AED', symbol: 'د.إ', countryName: 'UAE'),
  CurrencyEntry(code: 'AFN', symbol: '؋', countryName: 'Afghanistan'),
  CurrencyEntry(code: 'ALL', symbol: 'L', countryName: 'Albania'),
  CurrencyEntry(code: 'AMD', symbol: '֏', countryName: 'Armenia'),
  CurrencyEntry(code: 'AOA', symbol: 'Kz', countryName: 'Angola'),
  CurrencyEntry(code: 'ARS', symbol: '\$', countryName: 'Argentina'),
  CurrencyEntry(code: 'AUD', symbol: 'A\$', countryName: 'Australia'),
  CurrencyEntry(code: 'AZN', symbol: '₼', countryName: 'Azerbaijan'),
  CurrencyEntry(code: 'BAM', symbol: 'KM', countryName: 'Bosnia'),
  CurrencyEntry(code: 'BDT', symbol: '৳', countryName: 'Bangladesh'),
  CurrencyEntry(code: 'BGN', symbol: 'лв', countryName: 'Bulgaria'),
  CurrencyEntry(code: 'BHD', symbol: '.د.ب', countryName: 'Bahrain'),
  CurrencyEntry(code: 'BND', symbol: '\$', countryName: 'Brunei'),
  CurrencyEntry(code: 'BOB', symbol: 'Bs.', countryName: 'Bolivia'),
  CurrencyEntry(code: 'BRL', symbol: 'R\$', countryName: 'Brazil'),
  CurrencyEntry(code: 'BWP', symbol: 'P', countryName: 'Botswana'),
  CurrencyEntry(code: 'BYN', symbol: 'Br', countryName: 'Belarus'),
  CurrencyEntry(code: 'BZD', symbol: '\$', countryName: 'Belize'),
  CurrencyEntry(code: 'CAD', symbol: 'CA\$', countryName: 'Canada'),
  CurrencyEntry(code: 'CDF', symbol: 'Fr', countryName: 'Congo'),
  CurrencyEntry(code: 'CHF', symbol: 'Fr', countryName: 'Switzerland'),
  CurrencyEntry(code: 'CLP', symbol: '\$', countryName: 'Chile'),
  CurrencyEntry(code: 'CNY', symbol: '¥', countryName: 'China'),
  CurrencyEntry(code: 'COP', symbol: '\$', countryName: 'Colombia'),
  CurrencyEntry(code: 'CRC', symbol: '₡', countryName: 'Costa Rica'),
  CurrencyEntry(code: 'CZK', symbol: 'Kč', countryName: 'Czechia'),
  CurrencyEntry(code: 'DKK', symbol: 'kr', countryName: 'Denmark'),
  CurrencyEntry(code: 'DOP', symbol: '\$', countryName: 'Dominican Republic'),
  CurrencyEntry(code: 'DZD', symbol: 'دج', countryName: 'Algeria'),
  CurrencyEntry(code: 'EGP', symbol: 'E£', countryName: 'Egypt'),
  CurrencyEntry(code: 'ERN', symbol: 'Nfk', countryName: 'Eritrea'),
  CurrencyEntry(code: 'ETB', symbol: 'Br', countryName: 'Ethiopia'),
  CurrencyEntry(code: 'EUR', symbol: '€', countryName: 'Eurozone'),
  CurrencyEntry(code: 'GBP', symbol: '£', countryName: 'United Kingdom'),
  CurrencyEntry(code: 'GEL', symbol: '₾', countryName: 'Georgia'),
  CurrencyEntry(code: 'GHS', symbol: 'GH₵', countryName: 'Ghana'),
  CurrencyEntry(code: 'GTQ', symbol: 'Q', countryName: 'Guatemala'),
  CurrencyEntry(code: 'HKD', symbol: 'HK\$', countryName: 'Hong Kong'),
  CurrencyEntry(code: 'HNL', symbol: 'L', countryName: 'Honduras'),
  CurrencyEntry(code: 'HRK', symbol: 'kn', countryName: 'Croatia'),
  CurrencyEntry(code: 'HUF', symbol: 'Ft', countryName: 'Hungary'),
  CurrencyEntry(code: 'IDR', symbol: 'Rp', countryName: 'Indonesia'),
  CurrencyEntry(code: 'ILS', symbol: '₪', countryName: 'Israel'),
  CurrencyEntry(code: 'INR', symbol: '₹', countryName: 'India'),
  CurrencyEntry(code: 'IQD', symbol: 'ع.د', countryName: 'Iraq'),
  CurrencyEntry(code: 'IRR', symbol: '﷼', countryName: 'Iran'),
  CurrencyEntry(code: 'ISK', symbol: 'Íkr', countryName: 'Iceland'),
  CurrencyEntry(code: 'JMD', symbol: 'J\$', countryName: 'Jamaica'),
  CurrencyEntry(code: 'JOD', symbol: 'JD', countryName: 'Jordan'),
  CurrencyEntry(code: 'JPY', symbol: 'JP¥', countryName: 'Japan'),
  CurrencyEntry(code: 'KES', symbol: 'KSh', countryName: 'Kenya'),
  CurrencyEntry(code: 'KGS', symbol: 'som', countryName: 'Kyrgyzstan'),
  CurrencyEntry(code: 'KHR', symbol: '៛', countryName: 'Cambodia'),
  CurrencyEntry(code: 'KRW', symbol: '₩', countryName: 'Korea'),
  CurrencyEntry(code: 'KWD', symbol: 'د.ك', countryName: 'Kuwait'),
  CurrencyEntry(code: 'KYD', symbol: 'KYD', countryName: 'Cayman Islands'),
  CurrencyEntry(code: 'KZT', symbol: '₸', countryName: 'Kazakhstan'),
  CurrencyEntry(code: 'LAK', symbol: '₭', countryName: 'Laos'),
  CurrencyEntry(code: 'LBP', symbol: 'L£', countryName: 'Lebanon'),
  CurrencyEntry(code: 'LKR', symbol: '₨', countryName: 'Sri Lanka'),
  CurrencyEntry(code: 'LYD', symbol: 'ل.د', countryName: 'Libya'),
  CurrencyEntry(code: 'MAD', symbol: 'MAD', countryName: 'Morocco'),
  CurrencyEntry(code: 'MDL', symbol: 'L', countryName: 'Moldova'),
  CurrencyEntry(code: 'MKD', symbol: 'ден', countryName: 'Macedonia'),
  CurrencyEntry(code: 'MMK', symbol: 'K', countryName: 'Myanmar'),
  CurrencyEntry(code: 'MNT', symbol: '₮', countryName: 'Mongolia'),
  CurrencyEntry(code: 'MOP', symbol: 'P', countryName: 'Macao'),
  CurrencyEntry(code: 'MRU', symbol: 'UM', countryName: 'Mauritania'),
  CurrencyEntry(code: 'MUR', symbol: '₨', countryName: 'Mauritius'),
  CurrencyEntry(code: 'MVR', symbol: 'Rf', countryName: 'Maldives'),
  CurrencyEntry(code: 'MWK', symbol: 'MK', countryName: 'Malawi'),
  CurrencyEntry(code: 'MXN', symbol: '\$', countryName: 'Mexico'),
  CurrencyEntry(code: 'MYR', symbol: 'RM', countryName: 'Malaysia'),
  CurrencyEntry(code: 'MZN', symbol: 'MT', countryName: 'Mozambique'),
  CurrencyEntry(code: 'NAD', symbol: '\$', countryName: 'Namibia'),
  CurrencyEntry(code: 'NGN', symbol: '₦', countryName: 'Nigeria'),
  CurrencyEntry(code: 'NIO', symbol: 'C\$', countryName: 'Nicaragua'),
  CurrencyEntry(code: 'NOK', symbol: 'kr', countryName: 'Norway'),
  CurrencyEntry(code: 'NPR', symbol: '₨', countryName: 'Nepal'),
  CurrencyEntry(code: 'NZD', symbol: 'NZ\$', countryName: 'New Zealand'),
  CurrencyEntry(code: 'OMR', symbol: '﷼', countryName: 'Oman'),
  CurrencyEntry(code: 'PAB', symbol: 'B/.', countryName: 'Panama'),
  CurrencyEntry(code: 'PEN', symbol: 'S/.', countryName: 'Peru'),
  CurrencyEntry(code: 'PHP', symbol: '₱', countryName: 'Philippines'),
  CurrencyEntry(code: 'PKR', symbol: '₨', countryName: 'Pakistan'),
  CurrencyEntry(code: 'PLN', symbol: 'zł', countryName: 'Poland'),
  CurrencyEntry(code: 'PYG', symbol: 'Gs', countryName: 'Paraguay'),
  CurrencyEntry(code: 'QAR', symbol: '﷼', countryName: 'Qatar'),
  CurrencyEntry(code: 'RON', symbol: 'lei', countryName: 'Romania'),
  CurrencyEntry(code: 'RSD', symbol: 'din', countryName: 'Serbia'),
  CurrencyEntry(code: 'RUB', symbol: '₽', countryName: 'Russia'),
  CurrencyEntry(code: 'SAR', symbol: '﷼', countryName: 'Saudi Arabia'),
  CurrencyEntry(code: 'SDG', symbol: 'ج.س.', countryName: 'Sudan'),
  CurrencyEntry(code: 'SEK', symbol: 'kr', countryName: 'Sweden'),
  CurrencyEntry(code: 'SGD', symbol: 'S\$', countryName: 'Singapore'),
  CurrencyEntry(code: 'SOS', symbol: 'Sh', countryName: 'Somalia'),
  CurrencyEntry(code: 'SYP', symbol: '£', countryName: 'Syria'),
  CurrencyEntry(code: 'THB', symbol: '฿', countryName: 'Thailand'),
  CurrencyEntry(code: 'TJS', symbol: 'SM', countryName: 'Tajikistan'),
  CurrencyEntry(code: 'TMT', symbol: 'T', countryName: 'Turkmenistan'),
  CurrencyEntry(code: 'TND', symbol: 'DT', countryName: 'Tunisia'),
  CurrencyEntry(code: 'TRY', symbol: '₺', countryName: 'Turkey'),
  CurrencyEntry(code: 'TTD', symbol: 'TT\$', countryName: 'Trinidad'),
  CurrencyEntry(code: 'TWD', symbol: 'NT\$', countryName: 'Taiwan'),
  CurrencyEntry(code: 'TZS', symbol: 'Sh', countryName: 'Tanzania'),
  CurrencyEntry(code: 'UAH', symbol: '₴', countryName: 'Ukraine'),
  CurrencyEntry(code: 'UGX', symbol: 'Sh', countryName: 'Uganda'),
  CurrencyEntry(code: 'USD', symbol: '\$', countryName: 'USA'),
  CurrencyEntry(code: 'UYU', symbol: '\$', countryName: 'Uruguay'),
  CurrencyEntry(code: 'UZS', symbol: 'so\'m', countryName: 'Uzbekistan'),
  CurrencyEntry(code: 'VES', symbol: 'Bs.S', countryName: 'Venezuela'),
  CurrencyEntry(code: 'VND', symbol: '₫', countryName: 'Vietnam'),
  CurrencyEntry(code: 'XAF', symbol: 'Fr', countryName: 'Central Africa'),
  CurrencyEntry(code: 'XOF', symbol: 'Fr', countryName: 'West Africa'),
  CurrencyEntry(code: 'YER', symbol: '﷼', countryName: 'Yemen'),
  CurrencyEntry(code: 'ZAR', symbol: 'R', countryName: 'South Africa'),
  CurrencyEntry(code: 'ZMW', symbol: 'ZK', countryName: 'Zambia'),
];
