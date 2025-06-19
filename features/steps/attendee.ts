import { DataTable, Given } from "@cucumber/cucumber";
import { sql } from "drizzle-orm";

import World from "../support/World";

Given(
  "there have some attendees",
  async function (this: World, dataTable: DataTable) {
    const conn = await this.getDatabase();

    for (const row of dataTable.hashes()) {
      const insertQuery = sql`
        INSERT INTO attendees (token, display_name, role) 
        VALUES (${row.token}, ${row.display_name}, ${row.role || "audience"})
      `;
      await conn.executeAll(insertQuery);
    }
  },
);
