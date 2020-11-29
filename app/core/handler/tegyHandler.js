const log4js = require('../../helper/logService');
const path = require('path');
const db = require('../../helper/loadModels');
const helper = require('../../helper/utils');
var scriptName = path.basename(__filename).split(".");
const name = scriptName[0];
var log = log4js.getLog(name);
log4js.setConsoleToLogger(log);

var csv

module.exports = {
    init,
    getToken,
    buildResponse,
    filterEndpointToProperties
}

function init() {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("Initiate " + name);
            csv = await require('./csvHandler').csv;
            module.exports.csv = csv
            resolve();
        } catch (err) {
            console.err(err);
            reject(err);
        }
    })
}

function getTitleLink(links, method, endpoint) {
    return links.filter((item) => {
        if (item.href === endpoint && item.method === method) {
            return item.title;
        } else {
            return 'No find'
        }
    })
}

function buildResource(responseModel, req) {
    return new Promise((resolve, reject) => {
        let endpoint = req.baseUrl + req.route.path;
        console.log('Building Resource method ' + req.method + ' with endpoint: ' + endpoint)
        filterEndpointToProperties(req).then(async (prop) => {
            // responseModel.title = prop.links[0].title;
            responseModel.title = getTitleLink(prop.links, req.method, endpoint)[0].title;
            responseModel.seftHref.href = helper.getFullUrl(req, req.originalUrl);
            responseModel.seftHref.method = prop.endpoint[0].method;
            if (prop.endpoint[0].isCollection === 'Y') responseModel.seftHref.collection = true;
            responseModel._links = await buildLinks(prop.links, req);
            responseModel._options = await buildOptionsAndProperties(prop.options, prop.properties, req);
            // console.log(prop)
            console.log('Complete build Response Model with endpoint ' + endpoint + ' : ');
            console.log(responseModel);
            resolve(responseModel);
        })
    })
}

function buildResponse(req, res, items, message, status) {
    if (!items || items === {}) {
        items = {};
        message = 'No matching items found';
        status = false;
    }
    return new Promise(async (resolve, reject) => {
        console.log('Building response with endpoint: ' + req.originalUrl)
        let responseModel = new db.Response();
        responseModel.seftHref.item = items;
        responseModel.seftHref.message = message;
        // responseModel.seftHref.status = (items.length > 0) ? 'SUCCESS' : 'FAILED';
        responseModel.seftHref.status = (status) ? 'SUCCESS' : 'FAILED';
        buildResource(responseModel, req).then((result) => {
            result.validate((err) => {
                if (err) {
                    responseModel.seftHref.message = err;
                    res.json(err);
                    reject(err);
                } else {
                    res.json(result);
                    resolve(result);
                }
            })
        })
    })
}

async function buildLinks(links, req) {
    let endpoint = req.baseUrl + req.route.path;
    console.log('Start build links for endpoint: ' + endpoint);
    let arrLinks = [];
    await Promise.all(links.map((item) => {
        if (!(item.href === endpoint && item.method === req.method)) {
            let template = {};
            item.href = checkExistsParamsAndUpdateEndpoint(req, item.href);
            template[item.linkName] = {
                'title': item.title,
                'href': helper.getFullUrl(req, item.href),
                'method': item.method
            }
            // console.log(template);
            arrLinks.push(template);
        }
    }))
    console.log('Complete build links for endpoint: ' + endpoint);
    return arrLinks;
}


async function buildOptionsAndProperties(options, properties, req) {
    let endpoint = req.baseUrl + req.route.path;
    console.log('Start build Options from Options and Properties for endpoint: ' + endpoint);
    let object = {
        methods: [],
        properties: []
    };
    object.properties = await buildProperties(properties);
    await Promise.all(options.map((item) => {
        let obOp = {};
        item.href = checkExistsParamsAndUpdateEndpoint(req, item.href);
        obOp[item.method] = {
            href: helper.getFullUrl(req, item.href),
            type: item.media_type
        }
        object.methods.push(obOp);
    }))
    // console.log(object);
    console.log('Complete build Options from Options and Properties for endpoint: ' + endpoint);
    return object
}

async function buildProperties(properties) {
    let obProperties = [];
    await Promise.all(properties.map(async (item) => {
        let obProp = {};
        if (item.type != 'model') {
            obProp[item.properties] = {
                path: item.paths,
                instance: item.type,
                options: {},
            }
            if (item.type.enumValue) obProp[item.properties].options['enum'] = item.enumValue.split('_');
            if (item.require) obProp[item.properties].options['required'] = (item.require.toLowerCase() === 'y') ? true : false;
            if (item.unique) obProp[item.properties].options['unique'] = (item.require.toLowerCase() === 'y') ? true : false;
            if (Array.isArray(obProperties)) obProperties.push(obProp);
        } else {
            console.log('Get properties from model: ' + item.properties);
            obProperties = getPropertiesFromModel(db[item.properties].schema.paths)
            return;
        }
        // console.log(obProp)
    }))
    return obProperties;
}

function getPropertiesFromModel(paths) {
    let ob = {};
    const allowed = [
        'path',
        'instance',
        'options'
    ];
    for (let k in paths) {
        let raw = paths[k];
        const filtered = Object.keys(raw)
            .filter(key => allowed.includes(key))
            .reduce((obj, key) => {
                obj[key] = raw[key];
                return obj;
            }, {});
        ob[k] = filtered;
    }
    delete ob.__v
    return ob;
}

function filterEndpointToProperties(req) {
    // console.log(csv);
    let endpoint = req.baseUrl + req.route.path;
    return new Promise(async (resolve, reject) => {
        console.log('Get all properties from filter Endpoint function')
        let propFilter = {
            endpoint: {},
            links: {},
            options: {},
            properties: {}
        }

        let endpoints = await csv.endpoint.filter((item) =>
            (endpoint === item.href)
            &&
            (req.method === item.method)
        );
        let resourceREF = endpoints[0].resourceREF;
        let methodREF = endpoints[0].methodREF;
        let links = await csv.links.filter((item) => (
            (resourceREF === item.resourceREF)
            &&
            (endpoint != item.href)
            // &&
            // ((endpoint != item.href)||(req.method != item.method))
        ));
        let options = await csv.options.filter((item) => (
            (methodREF === item.methodREF)
            &&
            (endpoint === item.href)
        ));
        let schemaREF = options[0].schemaREF;
        let properties = await csv.properties.filter((item) =>
            (resourceREF === item.resourceREF)
            &&
            (schemaREF === item.schemaREF)
        );

        propFilter.endpoint = endpoints;
        propFilter.links = links;
        propFilter.options = options;
        propFilter.properties = properties;
        // console.log(propFilter);
        resolve(propFilter);
    })

}

function checkExistsParamsAndUpdateEndpoint(req, endpoint) {
    let params = req.params;
    if (!helper.isEmptyObject(params) && endpoint.includes(':')) {
        let split = endpoint.split(':');
        let new_path = split[0].concat(params[split[1]]);
        return new_path;
    } else {
        return endpoint;
    }
}

function getToken(headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};