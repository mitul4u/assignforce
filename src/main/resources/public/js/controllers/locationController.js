
var assignforce = angular.module("batchApp");

assignforce.controller("locationCtrl", function($scope, $filter, $mdDialog,
		locationService, buildingService, roomService) {
	var lc = this;

	// functions
	// calls showToast method of aCtrl
	lc.showToast = function(message) {
		$scope.$parent.aCtrl.showToast(message);
	};

	// opens building list for locations
	lc.openLocation = function(location) {
		if ($filter("activeItem")(location.buildings).length > 0) {
			var id = "#loc" + location.id;
			$(id).slideToggle();
		}
	};
	// opens room list for buildings
	lc.openBuilding = function(building) {
		if ($filter("activeItem")(building.rooms).length > 0) {
			var id = "#bldg" + building.id;
			$(id).slideToggle();
		}
	};

	// adds location
	lc.addLocation = function() {
		$mdDialog.show({
			templateUrl : "html/templates/locationTemplate.html",
			controller : "locationDialogCtrl", //locationDialogController.js
			controllerAs : "ldCtrl",
			locals : {
				location : locationService.getEmptyLocation(),
				state : "create"
			},
			bindToController : true,
			clickOutsideToClose : true
		}).then(function() {
			lc.showToast("Location created.");
			lc.repull();
		}, function() {
			lc.showToast("Failed to create location.");
		});
	};

	// add building
	lc.addBuilding = function() {
		if (lc.selectedList.length > 1) {
			lc.showToast("Please select only one location.");
		}
		// indicates that the list item is actually a location and not something
		// else
		else if (!(Array.isArray(lc.selectedList[0].buildings))) {
			lc.showToast("Please select a location.");
		} else {
			$mdDialog.show({
				templateUrl : "html/templates/buildingTemplate.html",
				controller : "bldgDialogCtrl", //bldgDialogController.js
				controllerAs : "bldgCtrl",
				locals : {
					location : lc.selectedList[0],
					building : buildingService.getAlmostEmptyBuilding(lc.selectedList[0].id), 
					/**two ways: use a different method than getEmptyBuilding(where the hell 
					  is that, btw?), or reference the location on the buildingTemplate form*/
					//TODO FIND WAY TO ADD lc.selectedList[0].id TO BUILDING'S LOCATION FIELD
					state : "create"
				},
				bindToController : true,
				clickOutsideToClose : true
			}).then(function() {
				lc.showToast("Building added.");
				lc.repull();
			}, function() {
				lc.showToast("Failed to add building.");
			});
		}
	};

	// add room to location
	lc.addRoom = function() {
		if (lc.selectedList.length > 1) {
			lc.showToast("Please select only one building.");
		}
		// indicates that the list item is actually a building and not a location
		else if (!Array.isArray(lc.selectedList[0].rooms)) {
			lc.showToast("Please select a building.");
		} else {
			$mdDialog.show({
				templateUrl : "html/templates/roomTemplate.html",
				controller : "roomDialogCtrl", //roomDialogController.js
				controllerAs : "rdCtrl",
				locals : {
					building : lc.selectedList[0], //TODO - scrap getAlmostEmptyRoom and replace with getEmptyRoom when finished with testing.
					room : roomService.getAlmostEmptyRoom(lc.selectedList[0].id),
					state : "create"
				},
				bindToController : true,
				clickOutsideToClose : true
			}).then(function() {
				lc.showToast("Room added.");
				lc.repull();
			}, function() {
				lc.showToast("Failed to add room.");
			});
		}
	};

	// removes buildings from selectedList on location menu close
	lc.removeBuildings = function(location) {
		if (location.buildings.length > 0) {
			location.buildings.forEach(function(building) {
				var idx = lc.selectedList.indexOf(building);
				if (idx > -1) {
					lc.selectedList.splice(idx, 1);
				}
			});
		}
	};
	
	
	//TODO implement this? Only after finished.
	
	// removes rooms from selectedList on location menu close
	// lc.removeRooms = function(location) {
	// if (location.rooms.length > 0) {
	// location.rooms.forEach(function(room) {
	// var idx = lc.selectedList.indexOf(room);
	// if (idx > -1) {
	// lc.selectedList.splice(idx, 1);
	// }
	// });
	// }
	// };

	// edit location
	lc.editSelected = function() {

		if (lc.selectedList.length > 1) {
			lc.showToast("Please select only one item.");
		} else if (lc.selectedList.length == 0) {
			lc.showToast("Please select an item.");
		} else {
			// edit location
			if (Array.isArray(lc.selectedList[0].rooms)) {
				$mdDialog.show({
					templateUrl : "html/templates/locationTemplate.html",
					controller : "locationDialogCtrl",
					controllerAs : "ldCtrl",
					locals : {
						location : lc.selectedList[0],
						state : "edit"
					},
					bindToController : true,
					clickOutsideToClose : true
				}).then(function() {
					lc.showToast("Location updated.");
					lc.repull();
				}, function() {
					lc.showToast("Failed to update location.");
				});
			}
			// edit room
			else {
				$mdDialog.show({
					templateUrl : "html/templates/roomTemplate.html",
					controller : "roomDialogCtrl",
					controllerAs : "rdCtrl",
					locals : {
						room : lc.selectedList[0],
						state : "edit"
					},
					bindToController : true,
					clickOutsideToClose : true
				}).then(function() {
					lc.showToast("Room updated.");
					lc.repull();
				}, function() {
					lc.showToast("Failed to update room.");
				});
			}
		}
	};

	// delete location
	// TODO DELETE BUTTON CALLS THIS
	lc.deleteSelected = function() {
		var summary = lc.categorizeSelected();
		$mdDialog.show({
			templateUrl : "html/templates/deleteTemplate.html",
			controller : "deleteDialogCtrl", //deleteDialogController.js
			controllerAs : "dCtrl",
			locals : {
				list : lc.selectedList,
				summary : summary
			},
			bindToController : true,
			clickOutsideToClose : true
	}).then(function() {
			//lc.showToast(lc.formatMessage(summary) + " deleted.");
			console.log("first log");
			//lc.showToast("Item deleted.");
			lc.repull();
			console.log("repull log");
		}, function() {

			console.log("bad log");
			lc.showToast("Failed to delete rooms/buildings/locations.");
		});
	};

	// formats toast message based on deletion summary
	lc.formatMessage = function(summary) {

		var message = "";
		if (summary.rooms == 1) {
			message += "1 room";
		} else if (summary.rooms > 1) {
			message += summary.rooms + " rooms";
		}
		
		if(summary.buildings == 1) {
			message += "1 building";
		} else if (summary.buildings > 1){
			message += summary.buildings + " buildings";
		}

		if (summary.locations == 1) {
			if (summary.rooms > 0) {
				message += " and ";
			}
			message += "1 location";
		} else if (summary.locations > 1) {
			if (summary.rooms > 0) {
				message += " and ";
			}
			message += summary.locations + " locations";
		}
		return message;
	};

	// counts the number of rooms/buildings/locations selected
	lc.categorizeSelected = function() {

		var summary = {
			rooms : 0,
			buildings: 0,
			locations : 0
		}; //this is where the deletion is mucking up
		if (lc.selectedList.length > 0) {			
			lc.selectedList.forEach(function(item) {
				if (Array.isArray(item.rooms)) {
					item.rooms.forEach(function(room){
						summary.rooms++;
					});
					summary.buildings++;
				}
				else if (Array.isArray(item.buildings)){
					item.buildings.forEach(function(building){
						summary.buildings++;
					});
					summary.locations++;
				}
				else{
					summary.locations++;
				}
			});
		}
		return summary;
	};

	// checks box if location/room is in selectedList
	lc.exists = function(obj) {
		return lc.selectedList.indexOf(obj) > -1;
	};

	// adds/removes location/room from selectedList
	lc.toggle = function(obj) {

		var idx = lc.selectedList.indexOf(obj);
		if (idx == -1) {
			lc.selectedList.push(obj);
		} else {
			lc.selectedList.splice(idx, 1);
		}
	};

	// tests whether room list of given location is visible
	lc.visible = function(location) {

		var element = $("#loc" + location.id)[0];
		if (!element) {
			return false;
		} else {
			var style = window.getComputedStyle(element);
			if (style.display == "none") {
				return false;
			} else {
				return true;
			}
		}
	};

	// repulls all locations
	lc.repull = function() {
		lc.locations = undefined;
		lc.selectedList = [];
		locationService.getAll(function(response) {
			lc.locations = response;
		}, function(error) {
			// error.data.message);
			lc.showToast("Could not fetch locations.");
		});
	};

	// data
	lc.selectedList = [];

	// page initialization
	// data gathering
	locationService.getAll(function(response) {
		lc.locations = response;
	}, function(error) {
		// error.data.message);
		lc.showToast("Could not fetch locations.");
	});

});
