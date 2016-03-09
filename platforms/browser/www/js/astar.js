var G_STAIRS_SELECTED;
//CLASSES

//Class AStarSearch-----------------------------------
function UniformCostSearch() {
    this.frontier = new Array();
    this.explored = new Array();
}

var problem1;

UniformCostSearch.prototype.search = function(problem) {
    this.frontier = [];
    this.explored = [];

    problem1 = problem;

    this.frontier.push(new Node(problem.getInitialState()));

    while (this.frontier.length > 0) {

        sortFrontierBySmallerCost(this.frontier);
        var n = this.frontier.shift();

        if (problem.isGoal(n.getState())) {
            var solution = new Solution(n);
            solution.init_1();
            return solution;
        }

        this.explored.push(n.getState());

        var successors = n.getState().getNeighbours();
        var idStateParent = n.getState().getId();

        for (var i = 0; i < successors.length; i++) {
            var g = n.getG() + successors[i].getCostFromNeighbourById(idStateParent);
            if (!containsState(this.frontier, successors[i])) {
                if (!containsState(this.explored, successors[i])) {
                    var tempNode = new Node(successors[i]);
                    if (G_STAIRS_SELECTED) {
                        if (n.getState().getIsStairsFromNeighbourById(tempNode.getState().getId()) == "true") {
                            tempNode.init_2(n, g * 3);
                        } else {
                            tempNode.init_2(n, g);
                        }
                    } else {
                        tempNode.init_2(n, g);
                    }
                    this.frontier.push(tempNode);
                }
            } else if (this.frontier[this.frontier.indexOf(successors[i])].getG() > g) {
                this.frontier.splice(this.frontier.indexOf(successors[i]), 1);
                var tempNode = new Node(successors[i]);
                if (G_STAIRS_SELECTED) {
                    if (n.getState().getIsStairsFromNeighbourById(tempNode.getState().getId()) == "true") {
                        tempNode.init_2(n, g * 3);
                    } else {
                        tempNode.init_2(n, g);
                    }
                } else {
                    tempNode.init_2(n, g);
                }
                this.frontier.push(tempNode);
            }
        }
    }
    return null;
};

function sortFrontierBySmallerCost(frontier) {
    frontier.sort(function(a, b) {
        return a.getG() - b.getG();
    });
}

function containsState(list, state) {
    var i = list.length;
    while (i--) {
        if (list[i] == state) {
            return true;
        }
    }
    return false;
}

//Class Problem---------------------------------
function Problem(graph, initialState, goalState) {
    this.graph = graph;
    this.initialState = initialState;
    this.goalState = goalState;
}
Problem.prototype.getGraph = function() {
    return this.graph;
};
Problem.prototype.getInitialState = function() {
    return this.initialState;
};
Problem.prototype.getGoalState = function() {
    return this.goalState;
};
Problem.prototype.isGoal = function(state) {
    return state == this.goalState;
};

//Class Graph----------------------------------
function Graph(id) {
    this.id = id;
    this.states = new Array();
}
Graph.prototype.getId = function() {
    return this.id;
};
Graph.prototype.getStates = function() {
    return this.states;
};
Graph.prototype.getStateById = function(id) {
    for (var i = 0; i < this.states.length; i++) {
        if (this.states[i].getId() == id) {
            return this.states[i];
        }
    }
    return null;
};
Graph.prototype.addState = function(state) {
    return this.states.push(state);
};

//Class State
function State(id, description, type) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.neighbours = new Array();
}
State.prototype.getId = function() {
    return this.id;
};
State.prototype.getDescription = function() {
    return this.description;
};
State.prototype.getType = function() {
    return this.type;
};
State.prototype.getNeighbours = function() {
    var neighbourStates = new Array();
    for (var i in this.neighbours) {
        var state = getStateById(i);
        if (state != null)
            neighbourStates.push(state);
    }
    return neighbourStates;
};
State.prototype.getNeighbourById = function(id) {
    //Return the path to that neighbour
    for (var i in this.neighbours) {
        if (i == id)
            return this.neighbours[i];
    }
    return null;
};
State.prototype.getCostFromNeighbourById = function(id) {
    for (var i in this.neighbours) {
        if (i == id)
            return this.neighbours[i].getCost();
    }
    return null;
};
State.prototype.getStepsFromNeighbourById = function(id) {
    for (var i in this.neighbours) {
        if (i == id)
            return this.neighbours[i].getSteps();
    }
    return null;
};
State.prototype.getIsStairsFromNeighbourById = function(id) {
    for (var i in this.neighbours) {
        if (i == id) {
            return this.neighbours[i].isStairs();
        }
    }
    return null;
};
State.prototype.addNeighbour = function(state, cost, stairs, steps) {
    this.neighbours[state.getId().toString()] = new Path(cost, stairs, steps);
};

function getStateById(id) {
    return problem1.getGraph().getStateById(id);
}

//Class Path
function Path(cost, stairs, steps) {
    this.cost = cost;
    this.stairs = stairs;
    this.steps = steps;
}
Path.prototype.getCost = function() {
    return this.cost;
};
Path.prototype.isStairs = function() {
    return this.stairs;
};
Path.prototype.getSteps = function() {
    return this.steps;
};
Path.prototype.addStep = function(step) {
    this.steps.push(step);
};

//Class Node
function Node(state) {
    this.state = state;
    this.cost = 0;
}
Node.prototype.init_1 = function(parent) {
    this.parent = parent;
    this.cost = 0;
};
Node.prototype.init_2 = function(parent, cost) {
    this.parent = parent;
    this.cost = cost;
};
Node.prototype.getState = function() {
    return this.state;
};
Node.prototype.getG = function() {
    return this.cost;
};
Node.prototype.getParent = function() {
    return this.parent;
};

//Class Solution
function Solution(goalNode) {
    this.goalNode = goalNode;
    this.node = goalNode;
    this.path = new Array();
}
Solution.prototype.init_1 = function() {
    var it = 1;
    while (this.node.getParent() != null) {
        this.node = this.node.getParent();
        it++;
    }
    this.node = this.goalNode;

    for (var i = 0; i < it; i++) {
        this.path.unshift(this.node);
        this.node = this.node.getParent();

    }
};
Solution.prototype.getCost = function() {
    return this.goalNode.getG();
};
Solution.prototype.getPath = function() {
    return this.path;
};

//Class Step------------------------------------
function Step(floor, description) {
    this.floor = floor;
    this.description = description;
}

Step.prototype.getFloor = function() {
    return this.floor;
};
Step.prototype.getDescription = function() {
    return this.description;
};
