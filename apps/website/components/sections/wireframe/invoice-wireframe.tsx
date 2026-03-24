export function InvoiceWireframe() {
  return (
    <div className="border border-border overflow-hidden">
      {/* Invoice content */}
      <div className="p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="w-24 h-6 rounded bg-muted-foreground/20 mb-2" />
            <div className="w-32 h-3 rounded bg-muted-foreground/10" />
          </div>
          <div className="text-right">
            <div className="w-16 h-8 rounded bg-muted-foreground/10 mb-2" />
            <div className="w-24 h-3 rounded bg-muted-foreground/10" />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-border" />

        {/* From/To */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="w-12 h-2 rounded bg-muted-foreground/10 mb-2" />
            <div className="w-full h-3 rounded bg-muted-foreground/10 mb-1" />
            <div className="w-3/4 h-3 rounded bg-muted-foreground/10" />
          </div>
          <div>
            <div className="w-8 h-2 rounded bg-muted-foreground/10 mb-2" />
            <div className="w-full h-3 rounded bg-muted-foreground/10 mb-1" />
            <div className="w-3/4 h-3 rounded bg-muted-foreground/10" />
          </div>
        </div>

        {/* Table */}
        <div className="border border-border">
          <div className="grid grid-cols-4 gap-4 p-3 border-b border-border bg-muted/20">
            <div className="w-12 h-2 rounded bg-muted-foreground/20" />
            <div className="w-8 h-2 rounded bg-muted-foreground/20" />
            <div className="w-8 h-2 rounded bg-muted-foreground/20" />
            <div className="w-12 h-2 rounded bg-muted-foreground/20" />
          </div>
          <div className="grid grid-cols-4 gap-4 p-3">
            <div className="w-full h-3 rounded bg-muted-foreground/10" />
            <div className="w-full h-3 rounded bg-muted-foreground/10" />
            <div className="w-full h-3 rounded bg-muted-foreground/10" />
            <div className="w-full h-3 rounded bg-muted-foreground/10" />
          </div>
        </div>

        {/* Total */}
        <div className="flex justify-end">
          <div className="w-40">
            <div className="flex justify-between mb-1">
              <div className="w-16 h-3 rounded bg-muted-foreground/10" />
              <div className="w-16 h-3 rounded bg-muted-foreground/10" />
            </div>
            <div className="flex justify-between">
              <div className="w-16 h-4 rounded bg-muted-foreground/20" />
              <div className="w-16 h-4 rounded bg-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
