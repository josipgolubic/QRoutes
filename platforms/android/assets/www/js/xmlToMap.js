//Class Map
function Map(id, version, description) {
    this.id = id;
    this.version = version;
    this.description = description;
    this.buildings = new Array();
}

Map.prototype.getId = function() {
    return this.id;
};
Map.prototype.getVersion = function() {
    return this.version;
};
Map.prototype.getDescription = function() {
    return this.description;
};
Map.prototype.getBuildings = function() {
    return this.buildings;
};

//Class Building
function Building(id, description) {
    this.id = id;
    this.description = description;
    this.floors = new Array();
}

Building.prototype.getId = function() {
    return this.id;
};
Building.prototype.getDescription = function() {
    return this.description;
};
Building.prototype.getFloors = function() {
    return this.floors;
};

//Class Floor
function Floor(id, description, level, length, width) {
    this.id = id;
    this.description = description;
    this.level = level;
    this.length = length;
    this.width = width;
    this.positions = new Array();
}

Floor.prototype.getId = function() {
    return this.id;
};
Floor.prototype.getDescription = function() {
    return this.description;
};
Floor.prototype.getLevel = function() {
    return this.level;
};
Floor.prototype.getLength = function() {
    return this.length;
};
Floor.prototype.getWidth = function() {
    return this.width;
};
Floor.prototype.getPositions = function() {
    return this.positions;
};

//Class Position
function Position(x, y, item) {
    this.x = x;
    this.y = y;
    this.item = item;
}

Position.prototype.getX = function() {
    return this.x;
};
Position.prototype.getY = function() {
    return this.y;
};
Position.prototype.getItem = function() {
    return this.item;
};
Position.prototype.getItemByType = function(type) {
    if (this.item.getType() == type) return this.item;
    else return null;
};


//Class Item
function Item(id, description, type) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.neighbours = new Array();
}

Item.prototype.getId = function() {
    return this.id;
};
Item.prototype.getDescription = function() {
    return this.description;
};
Item.prototype.getType = function() {
    return this.type;
};
Item.prototype.getNeighbours = function() {
    return this.neighbours;
};

//Class Neighbour
function Neighbour(id, path) {
    this.id = id;
    this.path = path;
}

Neighbour.prototype.getId = function() {
    return this.id;
};
Neighbour.prototype.getPath = function() {
    return this.path;
};


//Class Path
function Path() {
    this.steps = new Array();
}

Path.prototype.getSteps = function() {
    return this.steps;
};

//Class Step
function Step(order, description) {
    this.order = order;
    this.description = description;
}

Step.prototype.getOrder = function() {
    return this.order;
};
Step.prototype.getDescription = function() {
    return this.description;
};

//Import Map

var map = null;

function importXML(xml) {
    $.ajax({
        type: "GET",
        url: xml,
        dataType: "xml",
        success: parseXML,
        error: errorMessage
    });
}

function errorMessage() {
    console.log("Error: AJAX parse XML fail!");
}

function loadXMLDoc(filename) {
    if (window.XMLHttpRequest) {
        xhttp = new XMLHttpRequest();
    } else // code for IE5 and IE6
    {
        xhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET", filename, false);
    xhttp.send();
    return xhttp.responseXML;
}

function parseXML(xml) {
    console.log("Ok: Parse XML success!");

    $(xml).find("map").each(function() {
        if (map == null) {
            map = new Map($(this).attr("id"), $(this).attr("version"), $(this).attr("description"));
        }

        $(this).find("building").each(function() {
            var buildingTmp = new Building($(this).attr("id"), $(this).attr("description"));

            $(this).find("floor").each(function() {
                var floorTmp = new Floor(
                    $(this).attr("id"),
                    $(this).attr("level"),
                    $(this).attr("description"),
                    $(this).attr("length"),
                    $(this).attr("width")
                );

                $(this).find("position").each(function() {
                    var positionTmp = new Position(
                        $(this).attr("x"),
                        $(this).attr("y"),
                        new Item(
                            $(this).find("item").attr("id"),
                            $(this).find("item").attr("description"),
                            $(this).find("item").attr("type")
                        ));

                    $(this).find("neighbour").each(function() {
                        var neighbourTmp = new Neighbour($(this).attr("id"), new Path());

                        $(this).find("path").find("step").each(function() {
                            neighbourTmp.path.steps.push(new Step($(this).attr("order"), $(this).text()));
                        });
                        positionTmp.item.neighbours.push(neighbourTmp);
                    });
                    floorTmp.positions.push(positionTmp);
                });
                buildingTmp.floors.push(floorTmp);
            });
            map.buildings.push(buildingTmp);
        });
    });
    console.log("Ok: Objects created success!");
}
