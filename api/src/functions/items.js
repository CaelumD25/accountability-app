const { app } = require('@azure/functions');
const { CosmosClient } = require('@azure/cosmos');

// Initialize Cosmos client outside the function for connection reuse
let cosmosClient = null;
let container = null;

const initializeCosmosClient = async () => {
    if (!cosmosClient) {
        cosmosClient = new CosmosClient({
            endpoint: process.env.COSMOS_DB_ENDPOINT,
            key: process.env.COSMOS_DB_KEY
        });

        const database = cosmosClient.database(process.env.COSMOS_DATABASE_ID);
        container = database.container(process.env.COSMOS_CONTAINER_ID);
    }
    return container;
};

app.http('items', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const container = await initializeCosmosClient();

            if (request.method === 'GET') {
                // Query all items
                const querySpec = {
                    query: "SELECT * FROM c"
                };

                const { resources: items } = await container.items
                    .query(querySpec)
                    .fetchAll();

                return {
                    jsonBody: items
                };
            }
            else if (request.method === 'POST') {
                // Handle item creation
                const newItem = await request.json();
                const { resource: createdItem } = await container.items.create(newItem);

                return {
                    status: 201,
                    jsonBody: createdItem
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