const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Library Management API",
            version: "1.0.0",
            description:
                "Complete Library Management REST API using Node.js, Express, JWT and Firebase Firestore"
        },

        servers: [
            {
                url: "http://localhost:4000",
                description: "Local development server"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: ["./docs/swagger.yaml"]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;