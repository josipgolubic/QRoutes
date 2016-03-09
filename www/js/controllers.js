angular.module('starter.controllers', [])

.controller('MainCtrl', function($rootScope, $scope, $state, $stateParams, $ionicPopup, $location,
    $ionicLoading, $q, $ionicSlideBoxDelegate, $timeout, $ionicBackdrop, $ionicNavBarDelegate,
    SearchService, XmlMapFileService, DBService, GraphService) {

    /**
     * graph The map graph object.
     * @type {Object}
     */
    $scope.graph;
    $scope.origin;
    $scope.destination;
    $scope.steps = [];
    $scope.separator = ":";
    $scope.pos = 0;
    $scope.slideContentAux = 0;
    $scope.previousFloor = -100;
    $scope.floors;
    $scope.isOrigin = true;
    $scope.stairsSelected = {
        checked: false
    };

    $scope.dataOrigins = {
        "places": [],
        "search": ''
    };

    $scope.dataDestinations = {
        "places": [],
        "search": ''
    };

    $scope.change = function() {
        $ionicSlideBoxDelegate.slide(1);
    };

    $scope.goBack = function() {
        $ionicSlideBoxDelegate.slide(0);
    };

    $scope.stepCheck = function(step, floor) {
        if (step == floor[floor.length - 1]) {
            for (var i = 0; i < $scope.floors.length; i++) {
                if ($scope.floors[i] == floor) {
                    if ($scope.floors[i + 1] != null) {
                        $scope.toggleGroup($scope.floors[i + 1]);
                    }
                }
            }
        }
    };

    $scope.doRefresh = function(floors) {
        $timeout(function() {
            $scope.floors = floors;
        }, 1000);

    };

    $scope.isStairsChange = function() {
        G_STAIRS_SELECTED = !$scope.stairsSelected.checked;
        $scope.navigate("true");
        $ionicSlideBoxDelegate.slide(0);
    };

    /*
     * if given group is the selected group, deselect it
     * else, select the given group
     */
    $scope.toggleGroup = function(group) {
        if ($scope.isGroupShown(group)) {
            $scope.shownGroup = null;
        } else {
            $scope.shownGroup = group;
        }
    };
    $scope.isGroupShown = function(group) {
        return $scope.shownGroup === group;
    };

    $scope.slideChanged = function(index) {
        $timeout(function() {
            $ionicSlideBoxDelegate.update();
        }, 300);
    };

    $scope.loadCss = function() {
        var oldlink = document.getElementsByTagName("link").item(1);
        var newlink = document.createElement("link");
        newlink.setAttribute("rel", "stylesheet");
        newlink.setAttribute("type", "text/css");
        newlink.setAttribute("href", "css/banana.css");
        document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
    }

    $scope.switchOriginToDestination = function() {
        var aux;
        var aux2;
        aux2 = document.getElementById('input-destination').value;
        document.getElementById('input-destination').value = document.getElementById('input-origin').value;
        document.getElementById('input-origin').value = aux2;

        aux = $scope.origin;
        $scope.origin = $scope.destination;
        $scope.destination = aux;
        $scope.$apply();
    }

    $scope.clickAutoComplete = function(place) {
        if ($scope.isOrigin) {
            $scope.dataOrigins.search = '';
            $scope.setOrigin(place);
        } else {
            $scope.dataDestinations.search = '';
            $scope.setDestination(place);
        }

        $scope.dataOrigins.places = [];
        $scope.dataDestinations.places = [];

    };

    $scope.setIsOrigin = function(value) {
        $scope.isOrigin = value;
    };

    $scope.slideContent = function() {
        var navigate = document.getElementById('view');
        var content = document.getElementById('content');

        if ($scope.slideContentAux == 0) {
            $scope.slideContentAux = 1;
            navigate.classList.remove('downTranslate');
            content.classList.remove('downTranslate');

            navigate.classList.add('upTranslate');
            content.classList.add('upTranslate');
            document.getElementById("navigate-button").disabled = true;
        } else {

            $scope.slideContentAux = 0;
            navigate.classList.remove('upTranslate');
            content.classList.remove('upTranslate');

            navigate.classList.add('downTranslate');
            content.classList.add('downTranslate');
            document.getElementById("navigate-button").disabled = false;
        }

    };

    $scope.search = function() {
        if ($scope.isOrigin && $scope.dataOrigins.search != '') {
            SearchService.searchPlaces($scope.dataOrigins.search).then(
                function(matches) {
                    $scope.dataOrigins.places = matches;
                }
            );
        }

        if (!$scope.isOrigin && $scope.dataDestinations.search != '') {
            SearchService.searchPlaces($scope.dataDestinations.search).then(
                function(matches) {
                    $scope.dataDestinations.places = matches;
                }
            );
        }

        if ($scope.dataOrigins.search == '') {
            $scope.dataOrigins.places = [];
        }

        if ($scope.dataDestinations.search == '') {
            $scope.dataDestinations.places = [];
        }

        if ($scope.dataOrigins.search == '' && $scope.dataDestinations.search == '') {
            $scope.dataOrigins.places = [];
            $scope.dataDestinations.places = [];
        }

    };

    $scope.showHide = function(card, piso) {
        if (document.getElementById(card + piso).style.display != 'none') {
            document.getElementById(card + piso).style.display = 'none';
            document.getElementById('button-collapse' + piso).className = "icon ion-chevron-down";
        } else {
            document.getElementById(card + piso).style.display = 'block';
            document.getElementById('button-collapse' + piso).className = "icon ion-chevron-up";
        }
    };

    $scope.scan = function(choice) {
        var scanner = cordova.require("com.phonegap.plugins.barcodescanner.BarcodeScanner");
        scanner.scan(
            function(result) {
                if (choice == "origin") {
                    var result_origin = GraphService.getStateById(result.text);
                    if (result_origin != null) {
                        $scope.origin = result_origin;
                        $scope.$apply();
                    } else {
                        $scope.loadingIndicator = $ionicLoading.show({
                            content: "QRCode inválido!",
                            animation: 'fade-in',
                            showBackdrop: false,
                            duration: 2000,
                            maxWidth: 200,
                            showDelay: 500
                        });
                    }
                }
                if (choice == "destination") {
                    var result_destination = GraphService.getStateById(result.text);
                    if (result_destination != null) {
                        $scope.destination = result_destination;
                        $scope.$apply();
                    } else {
                        $scope.loadingIndicator = $ionicLoading.show({
                            content: "QRCode inválido!",
                            animation: 'fade-in',
                            showBackdrop: false,
                            duration: 2000,
                            maxWidth: 200,
                            showDelay: 500
                        });
                    }
                }
            },
            function(error) {
                alert("Erro: " + error);
            });
    };

    $scope.openSettings = function() {

        $location.path('/template/settings');
    };

    $scope.setOrigin = function(pos) {
        $scope.origin = pos;
    };

    $scope.setDestination = function(pos) {
        $scope.destination = pos;
    };

    $scope.slideUp = function() {
        if ($scope.pos == 0) {
            $scope.pos = 1;
            document.getElementById("navigate").style.margin = "-140px 0 0 0";
            document.getElementById("div-directions-card").style.margin = "-140px 1% 1% 1%";
            return;
        }
        if ($scope.pos == 1) {
            $scope.pos = 0;
            document.getElementById("navigate").style.margin = "0px 0 0 0";
            document.getElementById("div-directions-card").style.margin = "0px 1% 1% 1%";
        }

    }

    $scope.navigate = function(fromToggle) {
        if ($scope.origin != null && $scope.destination != null) {

            $ionicBackdrop.retain();
            $scope.loadingIndicator = $ionicLoading.show({
                content: "A calcular rota...",
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 500
            });

            $timeout(function() {
                $ionicBackdrop.release();
                $scope.loadingIndicator.hide();
                //correr o algoritmo
                $scope.steps.length = 0;
                $scope.floors = [];

                var problem = new Problem($scope.graph, $scope.origin, $scope.destination);
                var algorithm = new UniformCostSearch();
                var solution = algorithm.search(problem);
                $scope.steps = GraphService.getSteps(solution.getPath());
                var currentFloor = $scope.steps[0].getFloor();

                var auxFloor = 0;
                var auxStep = 0;

                $scope.floors[auxFloor] = [];

                for (var i = 0; i < $scope.steps.length; i++) {
                    if ($scope.steps[i].getFloor() == currentFloor) {
                        $scope.floors[auxFloor][auxStep] = $scope.steps[i];
                        auxStep++;
                    } else {
                        auxStep = 0;
                        currentFloor = $scope.steps[i].getFloor();
                        auxFloor++;
                        $scope.floors[auxFloor] = [];
                        $scope.floors[auxFloor][auxStep] = $scope.steps[i];
                        auxStep++;
                    }
                }

                $scope.toggleGroup($scope.floors[0]);
            }, 2000);
            if (!fromToggle) {
                $scope.slideContent();
            }

            document.getElementById("no-directions").style.display = "none";
            document.getElementById("help-bar").style.display = "block";
        } else {
            $scope.err = $ionicLoading.show({
                content: "A origem e/ou o destino não estão preenchidos !",
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 400,
                showDelay: 500
            });

            $timeout(function() {
                $scope.err.hide();
            }, 2000);
            document.getElementById("no-directions").style.display = "block";
            document.getElementById("help-bar").style.display = "none";
        }


    };

    function onDeviceReady() {

        /** Only start application verifications after resources loaded */
        waitLoadResources().then(function(result) {

            /** XML file hash to optimize application boot time */
            var dbXmlHash = null;
            var xmlHash = null;
            /** Database and XML map version */
            var dbMapVersion = null;
            var xmlMapVersion = null;

            // Exit if database is not supported by device
            if (!DBService.isSupported()) {
                showErrorMsg("A aplicação não é suportada neste dispositivo.");
            }

            // Get xml and map information from DB
            if (DBService.isMapPresent()) {
                dbMapVersion = DBService.getMapVersion();
                dbXmlHash = DBService.getXmlHash();
            } 

            // Get XML file hash
            if (XmlMapFileService.isXmlFilePresent()) {
                xmlHash = XmlMapFileService.getXmlFileHash();
            }

            // Exit application if no map is present
            if (dbXmlHash == null && xmlHash == null) {
                showErrorMsg("Não foi encontrado mapa. Ficheiro 'xml.map' não foi encontrado na pasta 'qrmaps'.");

            // Update DB if empty
            } else if (dbXmlHash == null && xmlHash != null) {
                XmlMapFileService.parseXml();
                if (XmlMapFileService.isXmlValid()) {
    
                    DBService.updateDBMap(XmlMapFileService.getXmlMap(), xmlHash).then(function(result) {
                        loadAppData();
                    });
                } else {
                    showErrorMsg("O mapa a importar é inválido.");
                }
                
            // Update DB if hashs different and XML map version is new
            } else if (dbXmlHash != null && xmlHash != null && dbXmlHash != xmlHash) {
                XmlMapFileService.parseXml();

                if (XmlMapFileService.isXmlValid()) {
                    xmlMapVersion = XmlMapFileService.getMapVersion();

                    // Update DB if db map version is older then xml map
                    if (xmlMapVersion > dbMapVersion) {
                        DBService.updateDBMap(XmlMapFileService.getXmlMap(), xmlHash).then(function(result) {
                            loadAppData();
                        });
                    }
                } else {
                    showWarningMsg("O mapa é inválido.");
                }

            } else {
                loadAppData();
            }

            // Hide loading Map
            $scope.loading.hide();

        });

        $ionicSlideBoxDelegate.enableSlide(false);
        document.getElementById("help-bar").style.display = "none";
        var element = document.getElementById('navigate');

        if (device.platform == 'iOS') {
            Hammer(element).on("swipeup", function(event) {
                $scope.slideContent();
            });

            Hammer(element).on("swipedown", function(event) {
                $scope.slideContent();
            });
        } else {
            Hammer(element).on("dragup", function(event) {
                $scope.slideContent();
            });

            Hammer(element).on("dragdown", function(event) {
                $scope.slideContent();
            });
        }

        // var pattern = new RexExp("^(.*?[.].*?)[.].*");
        // if (pattern.match("2.3"))
        //     alert("2.3");
        // else
        //     alert("outro");
        // $scope.loadCss();
    }

    /**
     * Wait for both 'XmlMapFileService' and 'DBService' to be ready for application verifications.
     * @return {Object} promise
     */
    function waitLoadResources() {

        var deferred = $q.defer();

        /** Wait for 'DBService' and 'XmlMapFileService' end verification tasks. */
        DBService.ready().then(function() {
            XmlMapFileService.ready().then(function() {
                deferred.resolve();
            });
        });

        return deferred.promise;
    }

    /**
     * Get Map from DB and load application map
     * @return none
     */
    function loadAppData() {

        /** Free 'XmlMapFileService' temporary data */
        XmlMapFileService.free();
        /** Load application graph map. */
        GraphService.createMap().then(function() {
            $scope.graph = GraphService.getGraph();
            SearchService.setGraph($scope.graph);
        });
    }

    /**
     * Output warning popup messages to user
     * @param  {String} message Message description to the popup
     * @return none
     */
    function showWarningMsg(message) {

        var alertPopup = $ionicPopup.alert({
            title: 'Erro',
            template: message + ""
        });

        alertPopup.then(function(res) {

        });
    }

    /**
     * Output error popup messages to user
     * @param  {String} message Message description to the popup
     * @return none
     */
    function showErrorMsg(message) {

        var alertPopup = $ionicPopup.alert({
            title: 'Erro',
            template: message + ""
        });

        alertPopup.then(function(res) {
            navigator.app.exitApp();
        });
    }

    /** Run devicerady() on app boot. */
    document.addEventListener("deviceready", onDeviceReady, false);

    /** Begin loading... */
    $scope.loading = $ionicLoading.show({
        content: 'A verificar mapas, aguarde...',
    });

});
