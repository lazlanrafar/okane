import * as React from "react";
import { Input } from "@workspace/ui";
import { cn } from "@workspace/ui";

interface CurrencyInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  value: number;
  onChange: (value: number) => void;
  currencySymbol?: string;
  decimalPlaces?: number;
}

export const CurrencyInput = React.forwardRef<
  HTMLInputElement,
  CurrencyInputProps
>(
  (
    {
      value,
      onChange,
      currencySymbol = "$",
      decimalPlaces = 2,
      className,
      ...props
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // Format the initial value or when value changes externally
    React.useEffect(() => {
      // If the user is typing (displayValue is not empty) and the value prop matches the parsed display value,
      // we might not want to overwrite it to avoid cursor jumping or reformatting while typing decimals.
      // However, for simplicity, let's just format it if it's different.

      // Simple logic: always format on clean render.
      // But to support realtime typing like "1000.", we need to be careful.
      // If we strictly sync displayValue to value, "1000." becomes "1000" (number) -> "1,000" (string). The dot is lost.

      // Better approach: Only sync from props if the prop value is significantly different from current parsed display value.
      // Or if the component just mounted.

      const currentParsed = parseFloat(displayValue.replace(/[^0-9.-]/g, ""));
      if (value !== currentParsed && !isNaN(value)) {
        setDisplayValue(formatNumber(value));
      } else if (value === 0 && displayValue === "") {
        // Handle initial 0 case if needed, or leave empty
        setDisplayValue("0");
      }
    }, [value]);

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
      }).format(num);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow valid characters only: digits, decimal point, minus sign, commas
      if (!/^[0-9.,-]*$/.test(inputValue)) return;

      // Strip commas for parsing
      const rawValue = inputValue.replace(/,/g, "");

      // Handle empty or just minus/dot
      if (rawValue === "" || rawValue === "-" || rawValue === ".") {
        setDisplayValue(inputValue);
        onChange(0); // or undefined?
        return;
      }

      const numericValue = parseFloat(rawValue);

      if (!isNaN(numericValue)) {
        onChange(numericValue);

        // Realtime formatting logic:
        // Identify if user is typing a decimal part.
        // If userInput ends with ".", keep it.
        // If userInput has decimals, keep them.

        const parts = rawValue.split(".");
        const integerPart = parts[0];
        const decimalPart = parts[1];

        const formattedInteger = integerPart
          ? parseInt(integerPart).toLocaleString("en-US")
          : "0"; // handle 001 -> 1

        let newDisplay = formattedInteger;

        if (inputValue.includes(".")) {
          newDisplay += "." + (decimalPart || "");
        }

        // Special case: if user typed a minus
        if (rawValue.startsWith("-")) {
          newDisplay = "-" + newDisplay;
        }

        setDisplayValue(newDisplay);
      } else {
        setDisplayValue(inputValue);
      }
    };

    // On blur, force strict formatting
    const handleBlur = () => {
      const rawValue = displayValue.replace(/,/g, "");
      const numericValue = parseFloat(rawValue);
      if (!isNaN(numericValue)) {
        setDisplayValue(
          new Intl.NumberFormat("en-US", {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
          }).format(numericValue),
        );
      }
    };

    return (
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        ref={ref}
        className={cn("text-right font-mono", className)}
      />
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
