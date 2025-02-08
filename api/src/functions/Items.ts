import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

// Environment variables for Cosmos DB
const client = new CosmosClient({
    endpoint: process.env.COSMOS_DB_ENDPOINT || "",
    key: process.env.COSMOS_DB_KEY || ""
});

const databaseId = process.env.COSMOS_DB_DATABASE || "my-database";
const containerId = process.env.COSMOS_DB_CONTAINER || "my-container";

export async function items(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log("Fetching items from Cosmos DB...");

    try {
        const { resources: items } = await client.database(databaseId).container(containerId).items.readAll().fetchAll();
        return { status: 200, body: JSON.stringify(items), headers: { "Content-Type": "application/json" } };
    } catch (error) {
        return { status: 500, body: `Error: ${error.message}` };
    }
}

app.http('items', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: items
});
