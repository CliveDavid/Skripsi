const swaggerAutogen = require('swagger-autogen')();
const path = require('path');
const fs = require('fs');

function getRouteNameFromPath(path) {
    const parts = path.split('/');
    if (parts.length > 1) {
        return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    return 'General';
}

const doc = {
  info: {
    title: 'SJM API',
    description: 'All APIs used in SJM Program',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js']; // Keep this as is if it's working for you

swaggerAutogen(outputFile, endpointsFiles, doc)
  .then(() => {
    console.log('Swagger documentation generated successfully');
    groupApisUnderTags();
  })
  .catch((error) => {
    console.error('Error generating Swagger documentation:', error);
    process.exit(1);
  });

function groupApisUnderTags() {
  const swaggerOutput = require('./swagger-output.json');
  const tags = new Set();

  // First pass: collect all unique tags
  Object.keys(swaggerOutput.paths).forEach(path => {
    const tag = getRouteNameFromPath(path);
    tags.add(tag);
  });

  // Add tags to the Swagger output
  swaggerOutput.tags = Array.from(tags).map(tag => ({ name: tag }));

  // Second pass: add tags to each path
  Object.keys(swaggerOutput.paths).forEach(path => {
    const tag = getRouteNameFromPath(path);
    Object.keys(swaggerOutput.paths[path]).forEach(method => {
      swaggerOutput.paths[path][method].tags = [tag];
    });
  });

  fs.writeFileSync('./swagger-output.json', JSON.stringify(swaggerOutput, null, 2));
  console.log('APIs grouped under tags successfully');
}