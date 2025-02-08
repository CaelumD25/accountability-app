const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs for new items

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
                const { name, value } = await request.json();

                // Generate a unique id using uuidv4
                const newItem = {
                    id: uuidv4(), // Generate a unique ID for the new item
                    name: name || "Default", // Default name if not provided
                    blunders: value || 1 // Default value if not provided
                };

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
