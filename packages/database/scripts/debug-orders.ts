import { db } from "../client";
import { orders } from "../schema/orders";

async function main() {
  const result = await db.select().from(orders);
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch(console.error);
