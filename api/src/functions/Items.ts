import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import {CosmosClient} from "@azure/cosmos";

const client = new CosmosClient({ endpoint: process.env["COSMOSDB_ENDPOINT"], key: process.env["COSMOSDB_KEY"] });

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const database = client.database("DataStore");
    const container = database.container("PeopleData");

    if(req.method === "GET"){ //return all items
        try {
            const { resources } = await container.items.readAll().fetchAll();
            context.res = {
                status: 200,
                body: resources
            };
        } catch (error) {
            context.res = {
                status: 500,
                body: `Error retrieving items from the database: ${error.message}`
            };
        }
    }
	//[ POST, PUT AND DELETE ENDPOINTS OMITTED FOR SIMPLICITY, AVAILABLE IN SOURCE CODE ]
else {
        context.res = {
            status: 405,
            body: "Method Not Allowed"
        };
    }
}
