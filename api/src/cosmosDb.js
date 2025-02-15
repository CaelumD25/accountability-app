const { CosmosClient } = require('@azure/cosmos');
let cosmosClient = null;
let container = null;

// Initializes the cosmos client for database operations within API
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

module.exports = { initializeCosmosClient };