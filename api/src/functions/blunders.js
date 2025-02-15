const { app } = require('@azure/functions');
const crypto = require('crypto');
const initializeCosmosClient = require("../cosmosDb");

app.http('blunders', {
    methods: ['GET', 'POST', 'PATCH'],
    authLevel: 'anonymous',
    handler: async (request) => {
        try {
            const container = await initializeCosmosClient();

            if (request.method === 'GET') {
                // Query all items and calculate the sum of blunders
                const querySpec = {query: "SELECT SUM(c.blunders) AS totalBlunders FROM c"};

                const { resources: items } = await container.items
                    .query(querySpec)
                    .fetchAll();

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
            else if (request.method === 'PATCH'){
                const add = parseInt(request.query.get("add"));

                const querySpec = {query: "SELECT SUM(c.blunders) AS totalBlunders FROM c"};

                const { resources: items } = await container.items
                    .query(querySpec)
                    .fetchAll();

                const totalBlunders = items[0] ? items[0].totalBlunders : 0;

                const newBlunders = add + totalBlunders;

                const hash = crypto.createHash("md5").update("default").digest("hex");

                const newPerson = {
                    id: hash,
                    name: "default",
                    blunders: newBlunders,
                    Type: "person"
                };

                const { resource: createdPerson } = await container.items.upsert(newPerson);

                return {
                    status: 201,
                    jsonBody: {blunders: createdPerson["blunders"]}
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
