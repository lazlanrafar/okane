import { Combobox, Spinner, cn } from "@workspace/ui";
import { User } from "lucide-react";
import { getCustomers, createCustomer } from "@workspace/modules/client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface SelectCustomerProps {
  value?: string;
  onChange: (customerId: string) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  headless?: boolean;
  hideLoading?: boolean;
  variant?: React.ComponentProps<typeof Combobox>["variant"];
}

export function SelectCustomer({
  value,
  onChange,
  className,
  disabled,
  placeholder = "Select customer",
  headless,
  hideLoading,
  variant,
}: SelectCustomerProps) {
  const queryClient = useQueryClient();

  // Handle internal fetching
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await getCustomers();
      if (!res.success) throw new Error(res.error);
      return res.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await createCustomer({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      });
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (data) => {
      if (data) {
        onChange(data.id);
        queryClient.invalidateQueries({ queryKey: ["customers"] });
        toast.success(`Customer "${data.name}" created`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create customer");
    },
  });

  const selectedCustomer = customers.find((c) => c.id === value);
  const selectedValue = selectedCustomer
    ? {
        id: selectedCustomer.id,
        label: selectedCustomer.name,
        email: selectedCustomer.email,
      }
    : undefined;

  const items = customers.map((c) => ({
    id: c.id,
    label: c.name,
    email: c.email,
  }));

  if (!selectedValue && isLoading && !hideLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[40px]">
        <Spinner />
      </div>
    );
  }

  return (
    <Combobox
      variant={variant}
      headless={headless}
      disabled={disabled || createMutation.isPending}
      placeholder={placeholder}
      searchPlaceholder="Search customer"
      items={items}
      selectedItem={selectedValue}
      onSelect={(item) => {
        onChange(item.id);
      }}
      className={className}
      onCreate={(value) => {
        createMutation.mutate(value);
      }}
      renderSelectedItem={(item: any) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <span className="text-left truncate max-w-[90%] font-medium">
            {item.label}
          </span>
        </div>
      )}
      renderOnCreate={(value) => (
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <span>{`Create "${value}"`}</span>
        </div>
      )}
      renderListItem={({ item }: { item: any }) => (
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
            <User className="h-3 w-3 text-muted-foreground" />
          </div>
          <div className="flex flex-col truncate">
            <span className="font-medium truncate text-xs">{item.label}</span>
            {item.email && (
              <span className="text-[10px] text-muted-foreground truncate">
                {item.email}
              </span>
            )}
          </div>
        </div>
      )}
    />
  );
}
