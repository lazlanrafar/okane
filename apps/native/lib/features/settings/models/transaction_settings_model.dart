class TransactionSettingsModel {
  final int? monthlyStartDate;
  final String? monthlyStartDateWeekendHandling;
  final String? weeklyStartDay;
  final bool? carryOver;
  final String? period;
  final String? incomeExpensesColor;
  final bool? autocomplete;
  final String? timeInput;
  final String? startScreen;
  final String? swipeAction;
  final bool? showDescription;
  final String? inputOrder;
  final bool? noteButton;
  final String? mainCurrencyCode;
  final String? mainCurrencySymbol;
  final String? mainCurrencySymbolPosition;
  final int? mainCurrencyDecimalPlaces;

  TransactionSettingsModel({
    this.monthlyStartDate,
    this.monthlyStartDateWeekendHandling,
    this.weeklyStartDay,
    this.carryOver,
    this.period,
    this.incomeExpensesColor,
    this.autocomplete,
    this.timeInput,
    this.startScreen,
    this.swipeAction,
    this.showDescription,
    this.inputOrder,
    this.noteButton,
    this.mainCurrencyCode,
    this.mainCurrencySymbol,
    this.mainCurrencySymbolPosition,
    this.mainCurrencyDecimalPlaces,
  });

  factory TransactionSettingsModel.fromJson(Map<String, dynamic> json) {
    return TransactionSettingsModel(
      monthlyStartDate: json['monthlyStartDate'] as int?,
      monthlyStartDateWeekendHandling:
          json['monthlyStartDateWeekendHandling'] as String?,
      weeklyStartDay: json['weeklyStartDay'] as String?,
      carryOver: json['carryOver'] as bool?,
      period: json['period'] as String?,
      incomeExpensesColor: json['incomeExpensesColor'] as String?,
      autocomplete: json['autocomplete'] as bool?,
      timeInput: json['timeInput'] as String?,
      startScreen: json['startScreen'] as String?,
      swipeAction: json['swipeAction'] as String?,
      showDescription: json['showDescription'] as bool?,
      inputOrder: json['inputOrder'] as String?,
      noteButton: json['noteButton'] as bool?,
      mainCurrencyCode: json['mainCurrencyCode'] as String?,
      mainCurrencySymbol: json['mainCurrencySymbol'] as String?,
      mainCurrencySymbolPosition: json['mainCurrencySymbolPosition'] as String?,
      mainCurrencyDecimalPlaces: json['mainCurrencyDecimalPlaces'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (monthlyStartDate != null) 'monthlyStartDate': monthlyStartDate,
      if (monthlyStartDateWeekendHandling != null)
        'monthlyStartDateWeekendHandling': monthlyStartDateWeekendHandling,
      if (weeklyStartDay != null) 'weeklyStartDay': weeklyStartDay,
      if (carryOver != null) 'carryOver': carryOver,
      if (period != null) 'period': period,
      if (incomeExpensesColor != null)
        'incomeExpensesColor': incomeExpensesColor,
      if (autocomplete != null) 'autocomplete': autocomplete,
      if (timeInput != null) 'timeInput': timeInput,
      if (startScreen != null) 'startScreen': startScreen,
      if (swipeAction != null) 'swipeAction': swipeAction,
      if (showDescription != null) 'showDescription': showDescription,
      if (inputOrder != null) 'inputOrder': inputOrder,
      if (noteButton != null) 'noteButton': noteButton,
    };
  }

  TransactionSettingsModel copyWith({
    int? monthlyStartDate,
    String? monthlyStartDateWeekendHandling,
    String? weeklyStartDay,
    bool? carryOver,
    String? period,
    String? incomeExpensesColor,
    bool? autocomplete,
    String? timeInput,
    String? startScreen,
    String? swipeAction,
    bool? showDescription,
    String? inputOrder,
    bool? noteButton,
  }) {
    return TransactionSettingsModel(
      monthlyStartDate: monthlyStartDate ?? this.monthlyStartDate,
      monthlyStartDateWeekendHandling:
          monthlyStartDateWeekendHandling ??
          this.monthlyStartDateWeekendHandling,
      weeklyStartDay: weeklyStartDay ?? this.weeklyStartDay,
      carryOver: carryOver ?? this.carryOver,
      period: period ?? this.period,
      incomeExpensesColor: incomeExpensesColor ?? this.incomeExpensesColor,
      autocomplete: autocomplete ?? this.autocomplete,
      timeInput: timeInput ?? this.timeInput,
      startScreen: startScreen ?? this.startScreen,
      swipeAction: swipeAction ?? this.swipeAction,
      showDescription: showDescription ?? this.showDescription,
      inputOrder: inputOrder ?? this.inputOrder,
      noteButton: noteButton ?? this.noteButton,
      mainCurrencyCode: mainCurrencyCode,
      mainCurrencySymbol: mainCurrencySymbol,
      mainCurrencySymbolPosition: mainCurrencySymbolPosition,
      mainCurrencyDecimalPlaces: mainCurrencyDecimalPlaces,
    );
  }
}
