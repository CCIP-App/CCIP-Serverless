import { DataTable, Given } from "@cucumber/cucumber";
import { sql } from "drizzle-orm";

import World from "../support/World";

// Note: "there have some attendees" step is defined in attendee.ts

Given(
  "there are some announcements",
  async function (this: World, dataTable: DataTable) {
    const conn = await this.getDatabase();

    for (const row of dataTable.hashes()) {
      // Parse the message JSON
      const message = JSON.parse(row.message);
      
      // Parse the roles array
      const roles = JSON.parse(row.roles);
      
      // Convert announced_at to timestamp
      const announcedAt = Math.floor(new Date(row.announced_at).getTime() / 1000);
      
      const insertQuery = sql`
        INSERT INTO announcements (announced_at, message, uri, roles)
        VALUES (
          ${announcedAt},
          ${JSON.stringify(message)},
          ${row.uri},
          ${JSON.stringify(roles)}
        )
      `;
      await conn.executeAll(insertQuery);
    }
  },
);