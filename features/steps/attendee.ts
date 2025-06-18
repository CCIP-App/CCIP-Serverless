import { DataTable, Given } from "@cucumber/cucumber";
import World from "../support/World";

Given(
  "there have some attendees",
  async function (this: World, dataTable: DataTable) {
    const database = await this.getDatabase();
    const id = database.idFromName("ccip-serverless");
    const stub = database.get(id);

    dataTable.hashes().forEach(async (row) => {
      // Assuming the DoAttendeeRepository has a method to create an attendee
      const repository = stub.getAttendeeRepository();
      await repository.save({
        token: row.token,
        displayName: row.display_name,
      });
    });
  },
);
