import { siGoogle } from "simple-icons";

import { SimpleIcon } from "@workspace/ui";
import { Button } from "@workspace/ui";
import { cn } from "@workspace/ui";

export function GoogleButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="secondary" className={cn(className)} {...props}>
      <SimpleIcon icon={siGoogle} className="size-4" />
      Continue with Google
    </Button>
  );
}
