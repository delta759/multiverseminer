//---------------------------------------------------------------------------
//core setup
//---------------------------------------------------------------------------
var game = new Game();
game.init();

var interval = 1000 / 60;
setInterval(function() {
	onUpdate();
}, interval);

$.noty.defaults.layout = 'bottomRight';
$.noty.defaults.timeout = 3000;

$(document).tooltip();

$(document).ready(function() {
	$('#inventoryTable').DataTable({
		"sScrollY" : "400px",
		"bScrollCollapse" : true,
		"bPaginate" : false,
		"bJQueryUI" : true,
		"aoColumnDefs" : [ {
			"sWidth" : "90%",
			"aTargets" : [ -1 ]
		} ]
	});

	$("#playerCraftingContent").accordion();
	
	updateInterface();
	updateInterfaceCrafting();
});

// Setup key bindings
Mousetrap.bind('f', function(e) {
    onDigDown();       
});
Mousetrap.bind('d', function(e) {
   onDigSideways();
});
Mousetrap.bind('g', function(e) {
   onGatherAtmosphere();
});
Mousetrap.bind('u', function(e) {
   onMoveUp();
});
Mousetrap.bind('s', function(e) {
   onSave();
});
Mousetrap.bind('r', function(e) {
   onReset();
});

var inventoryCategoryFilter = undefined;

// ---------------------------------------------------------------------------
// user interface
// ---------------------------------------------------------------------------
Utils.logCallback = function(type, message) {
	noty({
		text : message,
		type : type
	});
};

function updateInterfaceInventory() {
	var scrollInvSaved = $('.dataTables_scrollBody').scrollTop();
	var bodyScrollSaved = $('body').scrollTop();
	$('#inventoryTable').DataTable().rows().remove();

	if (!inventoryCategoryFilter) {
		var items = game.player.storage.getItems();
	} else {
		var items = game.player.storage
				.getItemsOfCategory(inventoryCategoryFilter);
	}

	if (!items || items.length <= 0) {
		$('#inventoryTable').DataTable().draw();
		return;
	}

	for (var i = 0; i < items.length; i++) {
		var itemName = game.getItemName(items[i]);
		var count = game.player.storage.getItemCount(items[i]);
		$('#inventoryTable').DataTable().row.add([ count, itemName ]).draw();
	}

	$('#inventoryTable').DataTable().draw();
	$('.dataTables_scrollBody').scrollTop(scrollInvSaved);
	$('body').scrollTop(bodyScrollSaved);
}

function updateInterfaceGear() {
	$('#gear').empty();

	slots = [];
	var slots = '<div id="gearGUI">', slotText = "";
	var gearSlots = game.player.gear.getSlots();
	for (var i = 0; i < gearSlots.length; i++) {
		var name = "N/A", icon = '';
		var itemId = game.player.gear.getItemInSlot(gearSlots[i]);
		if (itemId) {
			name = game.getItemName(itemId);
			icon = game.getItem(itemId).icon;
			console.log(game.getItem(itemId));			
		}
		console.log(icon);
		slots += '<div class="'+ gearSlots[i] +' gearSlot"><img src="'+icon+'" /></div>';
		slotText += '<span>' + gearSlots[i] + ':' + name + '</span><br />';
	}

	$('#gear').append(slots + '</div>' + slotText);
	$('#pickPower').text(game.player.pickPower + " / mpc");
}

function updateInterfaceCrafting() {
	var activePage = $('#playerCraftingContent').accordion('option', 'active');
	$('#playerCraftingContent').accordion("destroy");
	$('#playerCraftingContent').empty();
	
	for ( var key in ItemCategory) {
		var items = game.getItemsByCategory(ItemCategory[key]);
		if (!items || items.length <= 0) {
			continue;
		}

		var craftableItems = [];
		for (var i = 0; i < items.length; i ++) {
			if (items[i].craftCost && game.player.storage.canAdd(items[i].id)) {
				craftableItems.push(items[i]);
			}
		}

		if (craftableItems.length <= 0) {
			continue;
		}

		var headerContent = $('<div/>');
		var header = $('#playerCraftingContent').append(
				'<h4>' + ItemCategory[key]+'</h4>').append(headerContent);
		for (var i = 0; i < craftableItems.length; i ++) {
			headerContent.append(UI.buildCraftingEntry(craftableItems[i]));
		}
	}

	$("#playerCraftingContent").accordion({heightStyle: "content" });
	$("#playerCraftingContent").accordion('option', 'active', activePage);
}

function updateInterface() {
	$('#planet').text(game.currentPlanet.data.name);
	$('#depth').text(game.currentPlanet.currentDepth);

	$('#oxygen').text(game.player.storage.getItemCount(Items.oxygen.id));
	$('#oxygenCan').text(game.player.storage.getItemCount(Items.oxygenCan.id));
	$('#oxygenTank')
			.text(game.player.storage.getItemCount(Items.oxygenTank.id));

	$('#copper').text(game.player.storage.getItemCount(Items.copper.id));
	$('#copperBar').text(game.player.storage.getItemCount(Items.copperBar.id));
	$('#iron').text(game.player.storage.getItemCount(Items.iron.id));
	$('#ironBar').text(game.player.storage.getItemCount(Items.ironBar.id));
	$('#gold').text(game.player.storage.getItemCount(Items.gold.id));
	$('#goldBar').text(game.player.storage.getItemCount(Items.goldBar.id));

	$('#fuel').text(game.player.storage.getItemCount(Items.fuel.id));
	$('#fuelCan').text(game.player.storage.getItemCount(Items.fuelCan.id));
	$('#fuelTank').text(game.player.storage.getItemCount(Items.fuelTank.id));

	if (game.currentPlanet) {
		resources = game.currentPlanet._getAvailableResources("mine");
		var resElement = "<div>";
		var resGem = "<ul>";
		for (var i = 0; i < resources.length; i++) {
			// If it's dirt skip
			if ( resources[i].id == 2 ) {
				continue;
			}
			// This is a raw material
			if ( resources[i].id < 2000 ) {
				resElement += ('<div class="element">' + 
									'<span class="elementName">' + game.getItemName(resources[i].id) + '</span>' +
									'<span class="elementAbr">' + game.getItem(resources[i].id).el + '</span>' +
								'</div>');
			} else {
				resGem += "<li>" + game.getItemName(resources[i].id) + "</li>";
			}
		}
		$('#elementFinder').html(resElement + "</div>");
		$('#gemFinder').html(resGem + "</ul>");
	} else {
		$('#elementFinder').text("N/A");
	}

	if (game.player.gear.gearChanged) {
		updateInterfaceGear();
		game.player.gear.gearChanged = false;
	}

	if (game.player.storage.getStorageChanged()) {
		updateInterfaceInventory();
		game.player.storage.setStorageChanged(false);
	}
}

// ---------------------------------------------------------------------------
// function hooks
// ---------------------------------------------------------------------------
function onUpdate() {
	game.update();

	updateInterface();
};

function onCraft(what) {
	if (what == undefined) {
		Utils.logError("onCraft with invalid target");
		return;
	}

	if(game.player.craft(what)) {
		updateInterface();
		updateInterfaceCrafting();
	}
};

function onDigSideways() {
	game.settings.addStat('clickCount');
	game.player.mine();
};

function onDigDown() {
	if (!game.currentPlanet) {
		Utils.logError("Can not dig down, not on planet");
		return;
	}

	game.settings.addStat('clickCount');

	// Todo: this needs to happen in the player or something to account for
	// items / bonus etc
	game.player.digDown();
};

function onMoveUp() {
	if (!game.currentPlanet) {
		Utils.logError("Can not dig up, not on planet");
		return;
	}

	game.settings.addStat('clickCount');

	// Todo: this needs to happen in the player or something to account for
	// items / bonus etc
	if(game.currentPlanet.currentDepth > 0) {
		game.currentPlanet.currentDepth--;
	}
};

function onGatherAtmosphere() {
	game.settings.addStat('clickCount');
	game.player.gather();
};

function onSwitchLeftCategory(content) {
    $('#leftCategoryContent').children().hide();
    $('#'+content).show();
};

function onPlanetEarth() {
	$(".planet")
			.planetarium(
					{
						autospin : "1000ms",
						angle : "20deg",
						glow : "rgba(255, 255, 255, 0.34902) 0px 0px 50px, inset 33px 20px 50px rgba(0,0,0,0.5)",
						pattern : "assets/texture-earth.jpg",
						size : "100x100",
						float : true,
						space : "body",
						ring : false,
						ringColor : "#fff",
						ringAngle : "20deg"
					});
	$(".hidePlanetBtn").hide();
}

function onSave() {
	game.save();

	Utils.log("Game saved");
}

function onReset() {
	noty({
		text : 'Are you sure you want to reset?',
		type : 'confirmation',
		buttons : [ {
			text : 'Ok',
			onClick : function($noty) {
				$noty.close();
				game.reset();
				
				updateInterfaceCrafting();
			}
		}, {
			text : 'Cancel',
			onClick : function($noty) {
				$noty.close();
			}
		} ]
	});
}

function onSetInventoryFilter(filter) {
	inventoryCategoryFilter = filter;
	updateInterfaceInventory();
}
