import { DataTable, Given } from "@cucumber/cucumber";
import { sql } from "drizzle-orm";

import World from "../support/World";

Given(
  "there have some attendees",
  async function (this: World, dataTable: DataTable) {
    const conn = await this.getDatabase();

    dataTable.hashes().forEach(async (row) => {
      const insertQuery = sql`INSERT INTO attendees (token, display_name) VALUES (${row.token}, ${row.display_name})`;
      await conn.executeAll(insertQuery);
    });
  },
);
