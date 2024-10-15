const path = require('path');

function getRouteNameFromFilePath(filePath) {
    const fileName = path.basename(filePath, '.js');
    return fileName.charAt(0).toUpperCase() + fileName.slice(1);
}