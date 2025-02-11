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

app.http('blunders', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        try {
            const container = await initializeCosmosClient();

            if (request.method === 'GET') {
                // Query all items and calculate the sum of blunders
                const name = request.query.get("name");
                const querySpec = name!==null ?  {
                    query: "SELECT SUM(c.blunders) AS totalBlunders FROM c WHERE c.name = @name",
                    parameters: [
                        { name: "@name", value: name ? name.toLowerCase() : null }
                    ]
                }: {query: "SELECT SUM(c.blunders) AS totalBlunders FROM c"};

                const { resources: items } = await container.items
                    .query(querySpec)
                    .fetchAll();

                console.log(items)

                const totalBlunders = items[0] ? items[0].totalBlunders : 0;

                if (isNaN(totalBlunders)) {
                    return {
                        status: 400,
                        jsonBody: { message: "Invalid or missing 'blunders' parameter" }
                    };
                }
                return {
                    status: 200,
                    jsonBody: [{ "totalBlunders": totalBlunders }]
                };
            }
            else if (request.method === 'POST') {
                // Handle item creation
                let name = request.query.get("name");
                const blunders = parseInt(request.query.get("blunders"));
                console.log("Request", name, blunders);
                name = name === null ? "default" : name.toLowerCase();
                const hash = crypto.createHash("md5").update(name).digest("hex");

                if (typeof blunders !== "number") {
                    return {
                        status: 400,
                    }
                }
                const newPerson = {
                    id: hash,
                    name: name,
                    blunders: blunders,
                    Type: "person"
                };

                const { resource: createdPerson } = await container.items.upsert(newPerson);

                return {
                    status: 201,
                    body: createdPerson
                };
            }
        } catch (error) {
            console.error('Error processing request:', error);
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
