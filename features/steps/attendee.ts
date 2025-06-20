import { DataTable, Given } from "@cucumber/cucumber";
import { sql } from "drizzle-orm";

import World from "../support/World";

Given(
  "there have some attendees",
  async function (this: World, dataTable: DataTable) {
    const conn = await this.getDatabase();

    for (const row of dataTable.hashes()) {
      // Parse first_used_at from GMT string to Unix timestamp
      let firstUsedAt: number | null = null;
      if (row.first_used_at && row.first_used_at.trim() !== "") {
        const date = new Date(row.first_used_at);
        firstUsedAt = Math.floor(date.getTime() / 1000);
      }

      // Parse metadata from JSON string
      const metadata = row.metadata || "{}";

      const insertQuery = sql`
        INSERT INTO attendees (token, display_name, role, first_used_at, metadata) 
        VALUES (${row.token}, ${row.display_name}, ${row.role || "audience"}, ${firstUsedAt}, ${metadata})
      `;
      await conn.executeAll(insertQuery);
    }
  },
);
