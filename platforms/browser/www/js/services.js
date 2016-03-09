angular.module('starter.services', [])

.factory('SearchService', function($q, $timeout) {

    var places;

    // places = places.sort(function(a, b) {
    //     // c(a.description);
    //     var placeA = a.description.toLowerCase();
    //     var placeB = b.description.toLowerCase();

    //     if (placeA > placeB) return 1;
    //     if (placeA < placeB) return -1;
    //     return 0;
    // });

    function searchPlaces(searchFilter) {
        console.log('Searching places for ' + searchFilter);

        var deferred = $q.defer();

        var matches = places.filter(function(place) {
            if (place.description.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1) return true;
        });

        $timeout(function() {

            deferred.resolve(matches);

        }, 100);

        return deferred.promise;

    };

    return {

        searchPlaces: searchPlaces,

        setGraph: function(graph) {
            places = graph.getStates();
        }

    }
})

/**
 * XML map service which is responsible to all validations and operations on 'map.xml' file.
 * Some of them are check if xml exist and is valid, read file and parse map data.
 */
.factory('XmlMapFileService', function($q) {

    /**
     * serviceDeferred The promise of 'XmlMapFileService' verification.
     * @type {Object}
     */
    var serviceDeferred = $q.defer();
    /**
     * isXmlValid The XML map flag for map validation.
     * @type {Boolean}
     */
    var isXmlValid = false;
    /**
     * xmlString The XML plaintext map.
     * @type {String}
     */
    var xmlString = null;
    /**
     * map The xml string parsed to javascript object.
     * @type {Object}
     */
    var map = null;
    /**
     * mapVersion The version of the XML map.
     * @type {Double}
     */
    var mapVersion = null;
    /**
     * xmlHash The XML file MD5 hash to optimize "app" boot time.
     * @type {String}
     */
    var xmlHash = null;
    /**
     * duplexPaths The list of inserted nodes Ids neighbours.
     * If one node have one way path then must have the inverse path too.
     * @type {String}
     */
    var duplexPaths = [];

    /**
     * @constructor
     * @property {Integer} id          The map id.
     * @property {Double}  version     The map version.
     * @property {String}  description The map description.
     */
    function MapXml(id, version, description) {
        this.id = id;
        this.version = version;
        this.description = description;
        this.buildings = [];
    }

    MapXml.prototype.getId = function() {
        return this.id;
    };
    MapXml.prototype.getVersion = function() {
        return this.version;
    };
    MapXml.prototype.getDescription = function() {
        return this.description;
    };
    MapXml.prototype.getBuildings = function() {
        return this.buildings;
    };

    /**
     * @constructor
     * @property {Integer} id          The building id.
     * @property {Double}  description     The building description.
     */
    function BuildingXml(id, description) {
        this.id = id;
        this.description = description;
        this.floors = [];
    }

    BuildingXml.prototype.getId = function() {
        return this.id;
    };
    BuildingXml.prototype.getDescription = function() {
        return this.description;
    };
    BuildingXml.prototype.getFloors = function() {
        return this.floors;
    };

    /**
     * @constructor
     * @property {Integer} id          The floor id.
     * @property {Integer}  level       The floor level, [-...+].
     * @property {String}  description The floor description.
     * @property {Integer}  length      The floor length. (not used)
     * @property {Integer}  width       The floor width. (not used)
     */
    function FloorXml(id, level, description, length, width) {
        this.id = id;
        this.description = description;
        this.level = level;
        this.length = length;
        this.width = width;
        this.nodes = [];
    }

    FloorXml.prototype.getId = function() {
        return this.id;
    };
    FloorXml.prototype.getDescription = function() {
        return this.description;
    };
    FloorXml.prototype.getLevel = function() {
        return this.level;
    };
    FloorXml.prototype.getLength = function() {
        return this.length;
    };
    FloorXml.prototype.getWidth = function() {
        return this.width;
    };
    FloorXml.prototype.getNodes = function() {
        return this.nodes;
    };

    /**
     * @constructor
     * @property {Integer} id          The node id.
     * @property {String}  description The node description.
     * @property {Integer} x           The node position on x. (Not used)
     * @property {Integer} y           The node position on y. (not used)
     * @property {String}  type        The node type enumeration. ("node", "stairs", "qr_code", "elevator", "entrance")
     */
    function NodeXml(id, description, x, y, type) {
        this.id = id;
        this.description = description;
        this.x = x;
        this.y = y;
        this.type = type;
        this.neighbours = [];
    }

    NodeXml.prototype.getId = function() {
        return this.id;
    };
    NodeXml.prototype.getDescription = function() {
        return this.description;
    };
    NodeXml.prototype.getX = function() {
        return this.x;
    };
    NodeXml.prototype.getY = function() {
        return this.y;
    };
    NodeXml.prototype.getType = function() {
        return this.type;
    };
    NodeXml.prototype.getNeighbours = function() {
        return this.neighbours;
    };

    /**
     * @constructor
     * @property {Integer} id          The neighbour node id.
     * @property {Object}  path        The path to the neighbour.
     */
    function NeighbourXml(id, path) {
        this.id = id;
        this.path = path;
    }

    NeighbourXml.prototype.getId = function() {
        return this.id;
    };
    NeighbourXml.prototype.getPath = function() {
        return this.path;
    };

    /**
     * @constructor
     * @property {Integer} path_cost       The path path_cost between nodes.
     */
    function PathXml(path_cost) {
        this.path_cost = path_cost;
        this.steps = [];
    }

    PathXml.prototype.getPathCost = function() {
        return this.path_cost;
    };
    PathXml.prototype.getSteps = function() {
        return this.steps;
    };

    /**
     * @constructor
     * @property {Integer} order          The postion number of this step compared to others.
     * @property {String}  image          The encoded image.
     * @property {String}  description    The description of the step which all steps describe the path.
     */
    function StepXml(order, image, description) {
        this.order = order;
        this.image = image;
        this.description = description;
    }

    StepXml.prototype.getOrder = function() {
        return this.order;
    };
    StepXml.prototype.getDescription = function() {
        return this.description;
    };
    StepXml.prototype.getImage = function() {
        return this.image;
    };

    /**
     * @constructor
     * @property {Integer} id          The map id.
     * @property {Double}  version     The map version.
     * @property {String}  description The map description.
     */
    function NodeToNodePath(nodeId, neighbourId) {
        this.nodeId = nodeId;
        this.neighbourId = neighbourId;
        this.count = 1;
    }

    NodeToNodePath.prototype.getNodeId = function() {
        return this.nodeId;
    };
    NodeToNodePath.prototype.getNeighbourId = function() {
        return this.neighbourId;
    };
    NodeToNodePath.prototype.count = function() {
        return this.count;
    };

    /**
     * Add pair of nodes to duplexPaths array and set count +1 if pair found found.
     * @param {Integer} nodeId      Node Id.
     * @param {Integer} neighbourId Node neighbour Id.
     */
    function addPairNodesIds(nodeId, neighbourId) {

        var isNewPath = true;

        for (var key in duplexPaths) {
            if ((duplexPaths[key].getNodeId() == nodeId && duplexPaths[key].getNeighbourId() == neighbourId)
                || (duplexPaths[key].getNodeId() == neighbourId && duplexPaths[key].getNeighbourId() == nodeId)) {

                duplexPaths[key].count += 1;
                isNewPath = false;
            }
        }
        
        if (isNewPath) {
            duplexPaths.push(new NodeToNodePath(nodeId, neighbourId));
        }
    }

    /**
     * Check duplexPaths array for any path without return.
     * @return {Boolean} true ok and false to path without return or repeated.
     */
    function isMapDuplexPaths() {
        for (var key in duplexPaths) {
            if (duplexPaths[key].count != 2) {
                return false;
            }
        }
        return true;
    }

    /**
     * Parse XML string to map object.
     * @param  {String} xml The 'map.xml' string map.
     * @return none
     */
    function parseXML(xml) {

        if (isValidXmlFile(xml)) {

            var xmlDoc = $.parseXML(xml);
            $(xmlDoc).find("map").each(function() {

                map = new MapXml($(this).attr("id"), $(this).attr("version"), $(this).attr("description"));
                mapVersion = parseFloat(map.getVersion());

                $(this).find("building").each(function() {

                    var buildingTmp = new BuildingXml($(this).attr("id"), $(this).attr("description"));

                    $(this).find("floor").each(function() {

                        var floorTmp = new FloorXml(
                            $(this).attr("id"),
                            $(this).attr("level"),
                            $(this).attr("description"),
                            $(this).attr("length"),
                            $(this).attr("width")
                        );

                        $(this).find("node").each(function() {

                            var nodeId = $(this).attr("id");
                            var nodeTmp = new NodeXml(
                                nodeId,
                                $(this).attr("description"),
                                $(this).attr("x"),
                                $(this).attr("y"),
                                $(this).attr("type")
                            );

                            $(this).find("neighbour").each(function() {

                                var neighbourId = $(this).attr("id");
                                var neighbourTmp = new NeighbourXml(neighbourId, new PathXml($(this).find("path").attr("cost")));

                                /** Add path ids to pool. */
                                addPairNodesIds(nodeId, neighbourId);

                                $(this).find("path").find("step").each(function() {
                                    neighbourTmp.getPath().steps.push(new StepXml($(this).attr("order"), $(this).attr("image"), $(this).text()));
                                });
                                nodeTmp.neighbours.push(neighbourTmp);
                            });
                            floorTmp.nodes.push(nodeTmp);
                        });
                        buildingTmp.floors.push(floorTmp);
                    });
                    map.buildings.push(buildingTmp);
                });
            });

            /** Without pair paths between nodes map is invalid. */
            isXmlValid = isMapDuplexPaths();
        }
    }

    /**
     * Check if xml map folder is accessible.
     * @param  fileSystem
     * @return promise
     */
    function checkMapFolder(fileSystem) {
        var deferred = $q.defer();

        fileSystem.root.getDirectory("qrmaps", {
            create: true,
            exclusive: false
        }, function() {
            deferred.resolve();
        }, function() {
            deferred.reject();
        });

        return deferred.promise;
    }

    /**
     * Read xml map file.
     * @param  fileSystem
     * @return none
     */
    function readMapFile(fileSystem) {

        // Read xml map file
        function readAsText(file) {
            var reader = new FileReader();
            reader.onloadend = function(evt) {
                xmlString = evt.target.result;
                xmlHash = getXmlHash(xmlString);
                /** Resolve service promise */
                serviceDone();
            };
            reader.readAsText(file);
        }

        // Try to access xml map
        fileSystem.root.getFile("qrmaps/map.xml", {},
            function(fileEntry) {
                fileEntry.file(function(file) {
                    readAsText(file);
                }, onError);
            }, onError);
    }

    /**
     * Validate XML file with XSD
     * @param  xml
     * @return boolean
     */
    function isValidXmlFile(xml) {

        // 'xsdFile' is an imported js file variable
        var result = validateXML(encodeToUtf8(xml), xsdFile);
  
        if (result.trim() == "test.xml validates") {
            isXmlValid = true;
            return true;
        }
        return false;
    }

    /**
     * Encode string to UTF-8
     * @param  {String} xml XML file string.
     * @return {String}     XML file string encoded.
     */
    function encodeToUtf8(xml) {
        return unescape(encodeURIComponent(xml));
    }

    /**
     * Make hash from xml string map
     * @param  {String} xmlString   The string to hash.
     * @return {String}             The input string MD5 hash.
     */
    function getXmlHash(xmlString) {
        return SparkMD5.hash(xmlString);
    }

    /** @ignore */
    function serviceDone() {
        serviceDeferred.resolve();
    }

    /**
     * On error
     * @param  {Object} evt
     * @return none
     */
    function onError(evt) {
        /** Resolve service promise */
        serviceDone();
    }

    /**
     * When device is ready begin XML check
     */
    document.addEventListener("deviceready", function() {
        // Request file system access and begin XML service checks.
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function(fileSystem) {
                // Check if map folder exist and create it
                checkMapFolder(fileSystem)
                    .then(
                        function() {
                            // Try to read map file
                            readMapFile(fileSystem);
                        }, onError);
            }, onError);
    }, false);

    return {
        ready: function() {
            return serviceDeferred.promise;
        },
        isXmlValid: function() {
            return isXmlValid;
        },
        isXmlFilePresent: function() {
            return (xmlString != null);
        },
        getXmlFileHash: function() {
            return xmlHash;
        },
        getMapVersion: function() {
            return mapVersion;
        },
        getXmlMap: function() {
            return map;
        },
        parseXml: function() {
            if (xmlString != null) {
                parseXML(xmlString);
            }
        },
        free: function() {

            isXmlValid = false;
            xmlString = null;
            map = null;
            mapVersion = null;
            xmlHash = null;
            duplexPaths = null;
        }
    }

})

/**
 * Database map service
 * All DB methods and verifications.
 */
/**
 * Database map service which is responsible to all data validations and operations on application.
 * Some of them are update, save and charge application map.
 */
.factory('DBService', function($q) {

    /**
     * serviceDeferred The promise of 'DBService' verification.
     * @type {Object}
     */
    var serviceDeferred = $q.defer();
    var db;
    // Database version
    var VERSION = 1.0;
    // Database name
    var DB_NAME = "qroutesdb";
    // Database display name
    var DB_DISPLAY_NAME = "qroutes_db";
    // Database size setting
    var DB_SIZE = 2 * 1024 * 1024;
    // DB table names
    var TABLE_XML_INFO = "xml_info";
    var TABLE_NODE = "node";
    var TABLE_STEP = "step";
    // Common column names
    var KEY_ID = "id";

    // XML Info Table column names
    var KEY_MAP_VERSION = "version";
    var KEY_MAP_DESCRIPTION = "map_description";
    var KEY_XML_HASH = "xml_file_hash";
    var KEY_CREATED_AT = "created_at";

    // NODE Table column names
    // Map
    var KEY_XML_INFO_ID = "xml_info_id";
    // Building
    var KEY_BUILDING_DESCRIPTION = "building_description";
    // Floor
    var KEY_FLOOR_LEVEL = "floor_level";
    var KEY_FLOOR_DESCRIPTION = "floor_description";
    var KEY_FLOOR_LENGTH = "floor_length";
    var KEY_FLOOR_WIDTH = "floor_width";
    // Node
    var KEY_NODE_DESCRIPTION = "node_description";
    var KEY_NODE_X_POSITION = "node_x_position";
    var KEY_NODE_Y_POSITION = "node_y_position";
    var KEY_NODE_TYPE = "node_type";

    // STEP Table column names
    // Neighbour
    var KEY_NODE_ID = "node_id";
    var KEY_NEIGHBOUR_ID = "neighbour_id";
    var KEY_PATH_COST = "path_cost";
    var KEY_STEP_ORDER = "step_order";
    var KEY_STEP_IMAGE = "step_image";
    var KEY_STEP_DESCRIPTION = "step_description";

    // Create Tables
    var CREATE_TABLE_XML_INFO = "CREATE TABLE IF NOT EXISTS " + TABLE_XML_INFO + " (" +
        KEY_ID + " SMALLINT UNSIGNED PRIMARY KEY, " +
        KEY_MAP_VERSION + " DECIMAL(5,2) NOT NULL, " +
        KEY_MAP_DESCRIPTION + " TEXT NOT NULL, " +
        KEY_XML_HASH + " TEXT NOT NULL, " +
        KEY_CREATED_AT + " DATETIME NOT NULL)";

    var CREATE_TABLE_NODE = "CREATE TABLE IF NOT EXISTS " + TABLE_NODE + " (" +
        KEY_ID + " BIGINT UNSIGNED PRIMARY KEY, " +
        KEY_NODE_ID + " BIGINT UNSIGNED NOT NULL, " +
        KEY_XML_INFO_ID + " SMALLINT UNSIGNED, " +
        KEY_BUILDING_DESCRIPTION + " TEXT NOT NULL, " +
        KEY_FLOOR_LEVEL + " SMALLINT NOT NULL, " +
        KEY_FLOOR_DESCRIPTION + " TEXT NOT NULL, " +
        KEY_FLOOR_LENGTH + " INTEGER UNSIGNED NOT NULL, " +
        KEY_FLOOR_WIDTH + " INTEGER UNSIGNED NOT NULL, " +
        KEY_NODE_DESCRIPTION + " TEXT NOT NULL, " +
        KEY_NODE_X_POSITION + " INTEGER UNSIGNED NOT NULL, " +
        KEY_NODE_Y_POSITION + " INTEGER UNSIGNED NOT NULL, " +
        KEY_NODE_TYPE + " TEXT NOT NULL)";

    var CREATE_TABLE_STEP = "CREATE TABLE IF NOT EXISTS " + TABLE_STEP + " (" +
        KEY_ID + " BIGINT UNSIGNED PRIMARY KEY, " +
        KEY_NODE_ID + " BIGINT UNSIGNED NOT NULL, " +
        KEY_NEIGHBOUR_ID + " BIGINT UNSIGNED NOT NULL, " +
        KEY_PATH_COST + " SMALLINT UNSIGNED NOT NULL, " +
        KEY_STEP_ORDER + " SMALLINT UNSIGNED NOT NULL, " +
        KEY_STEP_IMAGE + " TEXT, " +
        KEY_STEP_DESCRIPTION + " TEXT NOT NULL)";

    // DB is not supported on this device
    var isDBSupported = false;
    // DB need to import XML map
    var isDbEmpty = true;
    // XML Info object saved on DB
    var xmlInfo = null;
    // Data variables
    var dbMapVersion = null;
    var dbXmlHash = null;

    // XML Info Class object
    /**
     * @constructor
     * @property {Integer} id            The id form XML_INFO table.
     * @property {String}  hash          The MD5 hash from the XML file that was used to make the DB.
     * @property {Double}  version       The version of the map.
     * * @property {Date}  last_changed  The date when the row from the DB was changed.
     */
    function XmlInfo(id, hash, version, last_changed) {
        this.id = id;
        this.hash = hash;
        this.version = version;
        this.last_changed = last_changed;
    }

    XmlInfo.prototype.getId = function() {
        return this.id;
    };
    XmlInfo.prototype.getHash = function() {
        return this.hash;
    };
    XmlInfo.prototype.getVersion = function() {
        return this.version;
    };
    XmlInfo.prototype.getLastChanged = function() {
        return this.last_changed;
    };

    /**
     * Insert a XML map information on XML_INFO table.
     * @param  {[type]} tx          [description]
     * @param  {[type]} mapVersion  [description]
     * @param  {[type]} description [description]
     * @param  {[type]} fileHash    [description]
     * @return {[type]}             [description]
     */
    function insertXmlInfo(tx, mapVersion, description, fileHash) {

        var day = new Date();
        tx.executeSql('INSERT INTO ' + TABLE_XML_INFO + ' (' +
            KEY_MAP_VERSION + ', ' + KEY_MAP_DESCRIPTION + ', ' +
            KEY_XML_HASH + ', ' + KEY_CREATED_AT + ') VALUES (?, ?, ?, ?)', [mapVersion, description, fileHash, day]);
    }

    /**
     * Insert a Node on NODE table.
     * @param  {Object} tx                   
     * @param  {Integer} nodeId              
     * @param  {Integer} xml_info_id         
     * @param  {String} buildingDescription  
     * @param  {Integer} floorLevel          
     * @param  {String} floorDescription     
     * @param  {Integer} floorLength         
     * @param  {Integer} floorWidth          
     * @param  {String} nodeDescription      
     * @param  {Integer} nodeXPosition       
     * @param  {Integer} nodeYPosition       
     * @param  {String} nodeType             
     * @return none
     */
    function insertNodeX(tx, nodeId, xml_info_id, buildingDescription, floorLevel, floorDescription,
        floorLength, floorWidth, nodeDescription, nodeXPosition, nodeYPosition, nodeType) {
        tx.executeSql("INSERT INTO " + TABLE_NODE + " (" +
            KEY_NODE_ID + ", " + KEY_XML_INFO_ID + ", " + KEY_BUILDING_DESCRIPTION + ", " + 
            KEY_FLOOR_LEVEL + ", " + KEY_FLOOR_DESCRIPTION + ", " + KEY_FLOOR_LENGTH + ", " + 
            KEY_FLOOR_WIDTH + ", " + KEY_NODE_DESCRIPTION + ", " + KEY_NODE_X_POSITION + ", " + 
            KEY_NODE_Y_POSITION + ", " + KEY_NODE_TYPE +
            ") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [nodeId, xml_info_id, buildingDescription, 
            floorLevel, floorDescription, floorLength, floorWidth, nodeDescription, nodeXPosition, 
            nodeYPosition, nodeType]);
    }

    /**
     * Insert a Step on STEP table.
     * @param  {Object} tx              
     * @param  {Integer} nodeId          
     * @param  {Integer} neighbourId     
     * @param  {Integer} pathCost        
     * @param  {Integer} stepOrder       
     * @param  {String} stepImage       
     * @param  {String} stepDescription 
     * @return none                 
     */
    function insertStep(tx, nodeId, neighbourId, pathCost, stepOrder, stepImage, stepDescription) {
        tx.executeSql("INSERT INTO " + TABLE_STEP + " (" +
            KEY_NODE_ID + ", " + KEY_NEIGHBOUR_ID + ", " + KEY_PATH_COST + ", " +
            KEY_STEP_ORDER + ", " + KEY_STEP_IMAGE + ", " + KEY_STEP_DESCRIPTION +
            ") VALUES (?, ?, ?, ?, ?, ?)", [nodeId, neighbourId, pathCost, stepOrder, stepImage, 
            stepDescription]);
    }

    /**
     * Verify if DB have map.
     * @param  {Object} tx
     * @return none
     */
    function checkDB(tx) {

        tx.executeSql(CREATE_TABLE_XML_INFO);
        tx.executeSql(CREATE_TABLE_NODE);
        tx.executeSql("SELECT * FROM " + TABLE_XML_INFO, [], function(tx, result) {

            if (result.rows != null && result.rows.length > 0) {
                dbMapVersion = result.rows.item(0)[KEY_MAP_VERSION];
                dbXmlHash = result.rows.item(0)[KEY_XML_HASH];
            }
        });

        tx.executeSql("SELECT * FROM " + TABLE_NODE, [], function(tx, results) {
            // In case of less then 3 rows in table DB is empty
            if (results.rows.length > 2) {
                isDbEmpty = false;
            }
        });
    }

    /**
     * Setup DB tables
     * @param  {Object} tx transaction
     * @return none
     */
    function populateDB(tx) {
        tx.executeSql("DROP TABLE IF EXISTS " + TABLE_XML_INFO);
        tx.executeSql("DROP TABLE IF EXISTS " + TABLE_NODE);
        tx.executeSql("DROP TABLE IF EXISTS " + TABLE_STEP);
        tx.executeSql(CREATE_TABLE_XML_INFO);
        tx.executeSql(CREATE_TABLE_NODE);
        tx.executeSql(CREATE_TABLE_STEP);
    }

    /**
     * Inser Map on DB.
     * @param  {Object} tx      
     * @param  {Object} xmlMap  
     * @param  {String} xmlHash 
     * @return none
     */
    function insertXmlMap(tx, xmlMap, xmlHash) {

        insertXmlInfo(tx, xmlMap.getVersion(), xmlMap.getDescription(), xmlHash);
        var buildings = xmlMap.getBuildings();

        for (building in buildings) {
            var floors = buildings[building].getFloors();

            for (floor in floors) {
                var nodes = floors[floor].getNodes();

                for (node in nodes) {
                    var neighbours = nodes[node].getNeighbours();
                    // xml_info_id not used so id 1 for default.
                    insertNodeX(tx, 
                        nodes[node].getId(), 
                        1, 
                        buildings[building].getDescription(), 
                        floors[floor].getLevel(), 
                        floors[floor].getDescription(),
                        floors[floor].getLength(), 
                        floors[floor].getWidth(), 
                        nodes[node].getDescription(), 
                        nodes[node].getX(), 
                        nodes[node].getY(), 
                        nodes[node].getType());

                    for (neighbour in neighbours) {
                        var path = neighbours[neighbour].getPath();
                        var steps = path.getSteps();

                        for (step in steps) {
                            insertStep(tx, nodes[node].getId(), 
                                neighbours[neighbour].getId(), 
                                path.getPathCost(), 
                                steps[step].getOrder(), 
                                steps[step].getImage(), 
                                steps[step].getDescription());
                        }
                    }
                }
            }
        }

    }

    /** @ignore */
    function onSuccess() {
        /** Resolve service promise */
        serviceDone();
    }

    /** @ignore */
    function onError(err) {
        /** alert("Error: " + err.code + " - " + err.msg); */
    }

    /** @ignore */
    function serviceDone() {
        serviceDeferred.resolve();
    }

    /**
     * Run when device is ready.
     * @return none
     */
    document.addEventListener("deviceready", function() {
        if (window.openDatabase) {
            isDBSupported = true;

            db = openDatabase(DB_NAME, VERSION, DB_DISPLAY_NAME, DB_SIZE);
            db.transaction(checkDB, onError, function() {
                if (isDbEmpty) {
                    db.transaction(populateDB, onError, onSuccess);
                } else {
                    /** Resolve service promise */
                    serviceDone();
                }
            });

        } else {
            isDBSupported = false;
            /** Resolve service promise */
            serviceDone();
        }
    }, false);

    return {
        isSupported: function() {
            return isDBSupported;
        },
        ready: function() {
            return serviceDeferred.promise;
        },
        isMapPresent: function() {
            return (!isDbEmpty);
        },
        getMapVersion: function() {
            return dbMapVersion;
        },
        getXmlHash: function() {
            return dbXmlHash;
        },
        updateDBMap: function(xmlMap, xmlHash) {

            var deferred = $q.defer();
            db.transaction(function(tx) {

                populateDB(tx);
                insertXmlMap(tx, xmlMap, xmlHash);
            }, onError, function() {
                deferred.resolve();
            });

            return deferred.promise;
        },
        getNodes: function() {
            var deferred = $q.defer();

            db.readTransaction(function(tx) {
                tx.executeSql("SELECT DISTINCT " + KEY_NODE_ID + ", " + 
                    KEY_NODE_DESCRIPTION + ", " + KEY_FLOOR_LEVEL + ", " + KEY_NODE_TYPE +
                    " FROM " + TABLE_NODE, [], function(tx, result) {

                        var rowsArray = [];
                        if (result != null && result.rows != null) {
                            // For each row add associative array column -> value
                            for (var row = 0; row < result.rows.length; row++) {
                                var rowColumns = [];
                                for (column in result.rows.item(row)) {
                                    rowColumns[column] = result.rows.item(row)[column];
                                }
                                rowsArray.push(rowColumns);
                            }
                        }
                        deferred.resolve(rowsArray);
                    }, onError, onSuccess);
            });

            // Return the promise to the controller
            return deferred.promise;
        },
        getNeighbours: function(nodeId, floorLevel) {
            var deferred = $q.defer();

            db.readTransaction(function(tx) {
                tx.executeSql("SELECT " + KEY_NODE_ID + ", " + KEY_NEIGHBOUR_ID + ", " + KEY_PATH_COST + ", " + 
                    KEY_STEP_ORDER + ", " + KEY_STEP_IMAGE + ", " + 
                    KEY_STEP_DESCRIPTION +
                    " FROM " + TABLE_STEP +
                    " WHERE " + KEY_NODE_ID + "=" + nodeId +
                    " ORDER BY " + KEY_STEP_ORDER + " ASC", [], function(tx, result) {

                        var neighbours = [];
    
                        if (result != null && result.rows != null) {
                            // For each row add associative array column -> value
                            for (var row = 0; row < result.rows.length; row++) {

                                var rowColumns = [];
                                rowColumns[KEY_FLOOR_LEVEL] = floorLevel;
                                for (column in result.rows.item(row)) {
                                    rowColumns[column] = result.rows.item(row)[column];
                                }

                                if (typeof neighbours[result.rows.item(row)[KEY_NEIGHBOUR_ID]] == 'undefined') {
                                    neighbours[result.rows.item(row)[KEY_NEIGHBOUR_ID]] = [];
                                }

                                neighbours[result.rows.item(row)[KEY_NEIGHBOUR_ID]].push(rowColumns);
                            }
                        }
                        deferred.resolve(neighbours);
                    }, onError, onSuccess);
            });

            // Return the promise to the controller
            return deferred.promise;
        },
        getStepImage: function(nodeId, neighbourId, stepOrder) {

            /**
             * Step images implementation (ONLY FOR JPG IMAGES).
             *
             * On controller:
             * $scope.imageTest = "";
             * DBService.getStepImage(nodeId, neighbourId, stepOrder).then(function(image) {
             *      $scope.imageTest = image;
             *      $scope.apply();
             * });
             *
             * On view:
             * <img ng-src="{{ imageTest }}" width="50" height="50">
             */
            
            var deferred = $q.defer();

            db.readTransaction(function(tx) {
                tx.executeSql("SELECT " + KEY_STEP_IMAGE + 
                    " FROM " + TABLE_STEP +
                    " WHERE " + KEY_NODE_ID + "=" + nodeId + 
                    " AND " + KEY_NEIGHBOUR_ID + "=" + neighbourId + 
                    " AND " + KEY_STEP_ORDER + "=" + stepOrder, [], function(tx, result) {

                        if (result != null && result.rows != null) {
                            var imageStr = 'data:image/jpeg;base64,' + result.rows.item(0)[KEY_STEP_IMAGE];
                            deferred.resolve(imageStr);
                        } else {
                            deferred.reject();
                        }
                        
                    }, onError, onSuccess);
            });

            // Return the promise to the controller
            return deferred.promise;
        }
    }

})

/**
 * Search Algorithm Graph service
 */
.factory('GraphService', function($q, DBService) {

    var graph = new Graph(1);
    var stepsToDestination = [];

    //path is a Node list that is the path to run
    function getStepsLocal(path) {
        for (var i = 0; i < path.length; i++) {
            for (var j = 0; j < path[i].getState().getNeighbours().length; j++) {
                if (i < path.length - 1) {
                    if (path[i].getState().getNeighbours()[j].getId() == path[i + 1].getState().getId()) {
                        stepsToDestination = stepsToDestination.concat(path[i].getState().getStepsFromNeighbourById(path[i + 1].getState().getId()));
                    }
                }
            }
        }
    }

    return {
        createMap: function() {

            var deferred = $q.defer();
            var graphStates = [];
            // nodes[node ID] = floor level;
            var nodes = [];

            DBService.getNodes().then(function(states) {

                if (states.length > 0) {

                    /** Insert all nodes (states) in graph and get level floors by node ID */
                    for (var index in states) {
                        var st = states[index];
                        graphStates[st['node_id']] = new State(st['node_id'], st['node_description'], st['node_type']);
                        nodes[st['node_id']] = st['floor_level'];
                    }

                    /** To control last nodes ID */
                    var nodesCounter = 1;
                    /** Then get neighbours steps by node ID and floor level*/
                    for (var id in nodes) {

                        DBService.getNeighbours(id, nodes[id]).then(function(neighbours) {

                            var nhSteps = [];
                            for (var nhId in neighbours) {
                                var neighbour = neighbours[nhId];
                                var nodeId;
                                var steps = [];
                                var path_cost;

                                for (var index in neighbour) {
                                    var step = neighbour[index];
                                    nodeId = step['node_id'];
                                    path_cost = step['path_cost'];
                                    steps.push(new Step(step['floor_level'], step['step_description']));
                                }

                                var isStairsNode = (graphStates[nhId].getType() == 'stairs') ? "true" : "false";
                                graphStates[nodeId].addNeighbour(graphStates[nhId], path_cost, isStairsNode, steps);
                            }

                            // Add States to Graph on the las neighbour added
                            if (nodes.length - 1 == nodesCounter) {
                                for (var id in nodes) {
                                    graph.addState(graphStates[id]);
                                }
                                deferred.resolve();
                            }
                            nodesCounter++;
                        });
                    }
                }

            });

            return deferred.promise;
        },
        getGraph: function() {
            return graph;
        },
        getStateById: function(id) {
            return graph.getStateById(id);
        },
        getSteps: function(path) {
            getStepsLocal(path);
            return stepsToDestination;
        }
    }

});
