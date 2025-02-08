const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const crypto = require('crypto');

// Initialize Cosmos client outside the function for connection reuse
let cosmosClient = null;
let container = null;

const initializeCosmosClient = async () => {
    if (!cosmosClient) {
        cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_DB_ENDPOINT,
            key: process.env.COSMOS_DB_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE);
        container = database.container(process.env.COSMOS_DB_CONTAINER);
    }
    return container;
};

async function generateNumericHash(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = new Uint8Array(hashBuffer);

    // Convert first 8 bytes to a 64-bit integer
    let hashNum = 0n; // BigInt to avoid overflow
    for (let i = 0; i < 8; i++) {
        hashNum = (hashNum << 8n) | BigInt(hashArray[i]);
    }

    return Number(hashNum % BigInt(Number.MAX_SAFE_INTEGER)); // Ensure it's within JS safe number range
}

app.http('blunders', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const container = await initializeCosmosClient();

            if (request.method === 'GET') {
                // Query all items and calculate the sum of blunders
                const querySpec = {
                    query: "SELECT SUM(c.blunders) AS totalBlunders FROM c"
                };

                const { resources: items } = await container.items
                    .query(querySpec)
                    .fetchAll();

                const totalBlunders = items[0] ? items[0].totalBlunders : 0;

                // Return sum in the desired format
                return {
                    status: 200,
                    jsonBody: [{ "$1": totalBlunders }]
                };
            }
            else if (request.method === 'POST') {
                // Handle item creation
                const { name, blunders } = await request.json();

                // Generate a unique id using uuidv4
                const newItem = {
                    id: await generateNumericHash(name.toLowerCase()), // Generate a unique ID for the new item
                    name: name || "Default", // Default name if not provided
                    blunders: blunders || 1 // Default value if not provided
                };
                console.log("New items: ", newItem);

                // Upsert the item into CosmosDB
                const { resource: createdItem } = await container.items.upsert(newItem);

                return {
                    status: 201, // HTTP status for created resource
                    jsonBody: createdItem // Return the created item
                };
            }
        } catch (error) {
            context.error('Error processing request:', error);
            return {
                status: 500,
                jsonBody: {
                    message: "Internal server error",
                    error: error.message
                }
            };
        }
    }
});
