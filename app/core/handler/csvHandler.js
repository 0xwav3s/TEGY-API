const csv = require('csv-parser');
const fs = require('fs');

const path = require('path');
const pathCSV = './app/core/csv/';
const subPath = '.csv';
const properties = [
    'ENDPOINT_RESOURCE_TABLE',
    'LINKS_RESOURCE_TABLE',
    'OPTIONS_RESOURCE_TABLE',
    'PROPERTIES_RESOURCE_TABLE'
]

var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
var log4js = require('../../helper/logService')
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);
console.log("Start get csv properties");

var csvProcess = (async ()=>{
    return await getAllProperties();
})();

module.exports.csv = csvProcess;

function handle() {
    return new Promise(async (resolve) => {
        let rs = await getAllProperties();
        resolve(rs)
    })
}

async function getAllProperties() {
    let dataProp = {};
    await Promise.all(properties.map(async (property) => {
        let data = await getFileContents(property);
        let strSplit = property.split('_');
        let nameProperties = strSplit[0].toLowerCase();
        dataProp[nameProperties] = data;
    }));
    console.log("Completed load all CSV files");
    // console.log(dataProp);
    return dataProp
}

async function getFileContents(property) {
    var filepath = pathCSV + property + subPath;
    console.log('Loading ' + filepath);
    const data = [];
    return new Promise(function (resolve, reject) {
        fs.createReadStream(filepath)
            .pipe(csv())
            .on('error', error => reject(error))
            .on('data', row => data.push(row))
            .on('end', () => {
                resolve(data);
            });
    });
}