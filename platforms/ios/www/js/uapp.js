var json;
var jsonlabels;
var statusindex = 0;
var channeloverride;
var cvarupdateindex;
var editcontrollerid;
var seriesOptions;
var chart;
var names;
var memoryraw;
var MemString;
var MemURL;
var memindex;

var rfmodes = ["Constant","Lagoon","Reef Crest","Short Pulse","Long Pulse","Nutrient Transport","Tidal Swell","Feeding","Feeding","Night","Storm","Custom","Else"];
var rfimages= ["constant.png","lagoon.png","reefcrest.png","shortpulse.png","longpulse.png","ntm.png","tsm.png","feeding.png","feeding.png","night.png","storm.png","custom.png","custom.png"];
var rfmodecolors = ["#00682e","#ffee00","#ffee00","#16365e","#d99593","#eb70ff","#eb70ff","#000000","#000000","#000000","#000000","#000000","#000000"];
var dimmingchannels = ["Daylight Channel","Actinic Channel","Daylight 2 Channel","Actinic 2 Channel","Dimming Channel 0","Dimming Channel 1","Dimming Channel 2","Dimming Channel 3","Dimming Channel 4","Dimming Channel 5","AI White Channel","AI Royal Blue Channel","AI Blue Channel","Radion White Channel","Radion Royal Blue Channel","Radion Red Channel","Radion Green Channel","Radion Blue Channel","Radion Intensity Channel"];
var customvars = ["Custom Var 0","Custom Var 1","Custom Var 2","Custom Var 3","Custom Var 4","Custom Var 5","Custom Var 6","Custom Var 7"];
var pwmchannels = ["PWMD","PWMA","PWMD2","PWMA2","PWME0","PWME1","PWME2","PWME3","PWME4","PWME5","AIW","AIRB","AIB","RFW","RFRB","RFR","RFG","RFB","RFI"];

var app = ons.bootstrap('uapp',['ngStorage','ngAnimate']);

app.controller('DropdownController', function($rootScope, $scope, $http, $localStorage){
    $scope.rfmodes = [{"name":"Constant","color":"#00682e","id":"0"},{"name":"Lagoon","color":"#ffee00","id":"1"},{"name":"Reef Crest","color":"#ffee00","id":"2"},{"name":"Short Pulse","color":"#16365e","id":"3"},{"name":"Long Pulse","color":"#d99593","id":"4"},{"name":"Nutrient Transport","color":"#eb70ff","id":"5"},{"name":"Tidal Swell","color":"#eb70ff","id":"6"},{"name":"Feeding","color":"#F5C127","id":"7"},{"name":"Night","color":"#90C3D4","id":"9"},{"name":"Storm","color":"black","id":"10"},{"name":"Custom","color":"#72BD4D","id":"11"}];
    $scope.dcmodes = [{"name":"Constant","color":"#00682e","id":"0"},{"name":"Lagoon","color":"#ffee00","id":"1"},{"name":"Reef Crest","color":"#ffee00","id":"2"},{"name":"Short Pulse","color":"#16365e","id":"3"},{"name":"Long Pulse","color":"#d99593","id":"4"},{"name":"Nutrient Transport","color":"#eb70ff","id":"5"},{"name":"Tidal Swell","color":"#eb70ff","id":"6"},{"name":"Feeding","color":"#F5C127","id":"7"},{"name":"Night","color":"#90C3D4","id":"9"},{"name":"Storm","color":"black","id":"10"},{"name":"Custom","color":"#72BD4D","id":"11"},{"name":"Else","color":"#B28DC4","id":"12"},{"name":"Sine","color":"#47ADAC","id":"13"},{"name":"Gyre","color":"#768C8C","id":"14"}];
	$scope.$storage = $localStorage;
	//$localStorage.controllers = null;
	if ($localStorage.controllers != null)
	{
		$scope.activecontroller=$localStorage.activecontroller;
		if ($localStorage.activecontroller==null)
			if ($localStorage.controllers.length>0)
			{
				$scope.activecontroller=$localStorage.controllers[0].name;
				$localStorage.activecontrollerid=0;
			}
	}
	else
	{
		$localStorage.controllers=[];
		$localStorage.jsonarray=[];
		$localStorage.jsonlabelsarray=[];
		$scope.activecontroller=null;
		$localStorage.activecontroller=null;
		$localStorage.activecontrollerid=null;
	}
//	console.log("$localStorage.controllers: " + $localStorage.controllers);
//	console.log("$localStorage.jsonarray: " + $localStorage.jsonarray);
//	console.log("$localStorage.jsonlabelsarray: " + $localStorage.jsonlabelsarray);
//	console.log("$scope.activecontroller: " + $scope.activecontroller);
//	console.log("$localStorage.activecontrollerid: " + $localStorage.activecontrollerid);
	
	$scope.$on('msg', function(event, msg) {
		//console.log('DropdownController'+msg);
		if (msg=="popoverclose")
		{
			$scope.activecontroller=$localStorage.activecontroller;
			$scope.popover.hide();
		}
	});
	ons.createPopover('popover.html').then(function(popover) {
		$scope.popover = popover;
	});
	$scope.closealert=function(){
		alertDialog.hide();
	}
	$scope.syncdate=function(){
		var d=new Date();
		$scope.getcontrollerdata('d' + d.getHours().toString() + d.getMinutes().toString() + "," + (d.getMonth()+1).toString() + d.getDate().toString() + "," + (d.getYear()-100).toString());
	}
	$scope.getcontrollerdata=function(cmd){
		if ($localStorage.controllers.length==0) return;
		console.log(cmd);
		modal.show();
		var tempurl="http://" + $localStorage.controllers[$localStorage.activecontrollerid].ipaddress + ":" + $localStorage.controllers[$localStorage.activecontrollerid].port + "/" + cmd;
		var request=$http({
			method:"GET",
			url: tempurl,
			timeout: 3000
		});
		request.success(function(data){
			console.log(data);
			modal.hide();
			if (cmd.substring(0,1)=='r')
			{
				var x2js = new X2JS();
				json = x2js.xml_str2json( data );
				//console.log(json);
				$localStorage.json=json;
				$localStorage.jsonarray[$localStorage.activecontrollerid]=json;
				$rootScope.$broadcast('msg', 'update');
				if (statusindex==3) tabbar.loadPage('dimming.html');
				if (statusindex==5) tabbar.loadPage('rf.html');
				if (statusindex==7) tabbar.loadPage('dimmingoverride.html');
				if (statusindex==8) tabbar.loadPage('dimmingoverride.html');
			}
			if (cmd=='v')
				ons.notification.alert({message: 'Version: ' + data.replace('<V>','').replace('</V>',''), title: 'Reef Angel Controller' });
			if (cmd=='boot' || cmd=='mf' || cmd=='mw' || cmd=='bp' || cmd=='l1' || cmd=='l0' || cmd=='mt' || cmd=='mo' || cmd=='ml' || cmd=='cal0' || cmd=='cal1' || cmd=='cal2' || cmd=='cal3' || cmd=='cal4')
				ons.notification.alert({message: 'Command result: ' + data.replace('<MODE>','').replace('</MODE>',''), title: 'Reef Angel Controller' });
			if (cmd.substring(0,2)=='po')
			{
				if (data.search("Ok"))
				{
					var channel = cmd.substring(0,cmd.search(",")).replace("po","");
					var value = cmd.substring(cmd.search(",")+1,cmd.length)
					setjson(pwmchannels[channel],value);
					setjson(pwmchannels[channel] + 'O',value);
					$rootScope.$broadcast('msg', 'overrideok');
				}
			}
			if (cmd.substring(0,4)=='cvar')
			{
				if (data.search("Ok"))
				{
					var channel = cmd.substring(0,cmd.search(",")).replace("cvar","");
					var value = cmd.substring(cmd.search(",")+1,cmd.length)
					setjson('C'+channel,value);
					$rootScope.$broadcast('msg', 'cvarok');
				}
			}
			if (cmd.substring(0,5)=='mb255' || cmd.substring(0,5)=='mb256' || cmd.substring(0,5)=='mb257')
			{
				if (data.search("Ok"))
				{
					var channel;
					var value = cmd.substring(cmd.search(",")+1,cmd.length)
					if (cmd.substring(0,5)=='mb255') channel="M"
					if (cmd.substring(0,5)=='mb256') channel="S"
					if (cmd.substring(0,5)=='mb257') channel="D"
					setjson('RF'+channel,value);
					$rootScope.$broadcast('msg', 'rfok');
				}
			}
			if (cmd.substring(0,5)=='mb337' || cmd.substring(0,5)=='mb338' || cmd.substring(0,5)=='mb339')
			{
				if (data.search("Ok"))
				{
					var channel;
					var value = cmd.substring(cmd.search(",")+1,cmd.length)
					if (cmd.substring(0,5)=='mb337') channel="M"
					if (cmd.substring(0,5)=='mb338') channel="S"
					if (cmd.substring(0,5)=='mb339') channel="D"
					setjson('DC'+channel,value);
					$rootScope.$broadcast('msg', 'dcok');
				}
			}
			if (cmd.substring(0,2)=='mr')
			{
				memoryraw = data.replace('<MEM>','').replace('</MEM>','');
				$rootScope.$broadcast('msg', 'memoryrawok');
			}
		});
		request.error(function(data){
			modal.hide();
			ons.notification.alert({message: 'Unable to process controller data!'});
		})
	}
	$scope.getportallabels=function(){
		if (json!=null)
		{
			modal.show();
			var request=$http({
				method:"GET",
				url:"http://forum.reefangel.com/status/labels.aspx?id=" + json.RA.ID,
				timeout: 3000
			});
			request.success(function(data){
				modal.hide();
				var x2js = new X2JS();
				jsonlabels = x2js.xml_str2json( data );
				//console.log(jsonlabels);
				$localStorage.jsonlabels=jsonlabels;
				$localStorage.jsonlabelsarray[$localStorage.activecontrollerid]=jsonlabels;
				$rootScope.$broadcast('msg', 'labels');
			});
			request.error(function(data){
				modal.hide();
				ons.notification.alert({message: 'Unable to process controller data!'});
			})
		}
	}
	$scope.changerelay=function(id,mode){
		$scope.getcontrollerdata('r' + id + mode);
	}
});

app.controller('Parameters', function($rootScope, $scope, $timeout, $localStorage) {
	$scope.$storage = $localStorage;
	$scope.$on('msg', function(event, msg) {
		console.log('Parameters'+msg);
		if (msg=="update")
		{
			json.RA.lastrefresh=new Date().toLocaleString();
			UpdateParams($scope,$timeout,$localStorage);
			//$scope.loadparameterstab();
		}
		if (msg=="paramsok")
		{
			loaddefaultvalues($scope);
			loadlabels($scope);
			UpdateParams($scope,$timeout,$localStorage);
		}
		if (msg=="overrideok")
		{
			UpdateParams($scope,$timeout,$localStorage);
			$scope.backoverride();
		}
		if (msg=="cvarok")
		{
			UpdateParams($scope,$timeout,$localStorage);
			$scope.backcvarupdate();
		}
		if (msg=="rfok")
		{
			UpdateParams($scope,$timeout,$localStorage);
			$scope.backrfupdate();
		}
		if (msg=="dcok")
		{
			UpdateParams($scope,$timeout,$localStorage);
			$scope.backdcupdate();
		}
		if (msg=="labels")
		{
			loadlabels($scope);
		}
	});
	$scope.loadparameterstab=function(){
		tabbar.loadPage('parameters.html');
		statusindex=0;
	}
	$scope.loadflagstab=function(){
		tabbar.loadPage('flags.html');
		statusindex=1;
	}
	$scope.loadiotab=function(){
		tabbar.loadPage('io.html');
		statusindex=2;
	}
	$scope.loaddimmingtab=function(){
		tabbar.loadPage('dimming.html');
		statusindex=3;
	}
	$scope.loadcustomvartab=function(){
		tabbar.loadPage('customvar.html');
		statusindex=4;
	}
	$scope.loadrftab=function(){
		tabbar.loadPage('rf.html');
		statusindex=5;
	}
	$scope.loaddcpumptab=function(){
		tabbar.loadPage('dcpump.html');
		statusindex=6;
	}
	$scope.dimmingoverride=function(channel){
		tabbar.loadPage('dimmingoverride.html');
		channeloverride=channel;
		if (channel<10)
			statusindex=7;
		else if (channel>12)
			statusindex=8;
	}
	$scope.overridechange=function(){
		$scope.pwmoverride=$scope.dimmingoverridechange;
	}
	$scope.backoverride=function(){
		if (statusindex==3 || statusindex==7) tabbar.loadPage('dimming.html');
		if (statusindex==5 || statusindex==8) tabbar.loadPage('rf.html');
		if (statusindex==6) tabbar.loadPage('dcpump.html');
	}
	$scope.setoverride=function(){
		if (channeloverride<10)
			statusindex=3;
		else if (channeloverride>12)
			statusindex=5;
		$scope.getcontrollerdata('po'+channeloverride+','+$scope.dimmingoverridechange);
	}
	$scope.canceloverride=function(){
		if (channeloverride<10)
			statusindex=3;
		else if (channeloverride>12)
			statusindex=5;
		$scope.getcontrollerdata('po'+channeloverride+',255');
	}
	$scope.cvarupdate=function(channel){
		tabbar.loadPage('cvarupdate.html');
		cvarupdateindex=channel;
	}
	$scope.setcvarupdate=function(){
		$scope.getcontrollerdata('cvar'+cvarupdateindex+','+$scope.cvarupdatechange);
	}
	$scope.backcvarupdate=function(){
		tabbar.loadPage('customvar.html');
	}
	$scope.rfmodeupdate=function(channel){
		tabbar.loadPage('rfmodeupdate.html');
	}
	$scope.setrfmodeupdate=function(mode){
		$scope.getcontrollerdata('mb255,'+mode);
	}
	$scope.backrfupdate=function(){
		tabbar.loadPage('rf.html');
	}
	$scope.dcmodeupdate=function(){
		tabbar.loadPage('dcmodeupdate.html');
	}
	$scope.setdcmodeupdate=function(mode){
		$scope.getcontrollerdata('mb337,'+mode);
	}
	$scope.backdcupdate=function(){
		tabbar.loadPage('dcpump.html');
	}
	$scope.rfspeedupdate=function(channel){
		$scope.speedupdatechange=$scope.rfs;
		statusindex=8;
		tabbar.loadPage('speedupdate.html');
	}
	$scope.rfdurationupdate=function(channel){
		$scope.durationupdatechange=$scope.rfd;
		statusindex=8;
		tabbar.loadPage('durationupdate.html');
	}
	$scope.setspeedupdate=function(){
		if (statusindex==6)	$scope.getcontrollerdata('mb338,'+$scope.speedupdatechange);
		if (statusindex==8)	$scope.getcontrollerdata('mb256,'+$scope.speedupdatechange);
	}
	$scope.dcspeedupdate=function(channel){
		$scope.speedupdatechange=$scope.dcs;
		statusindex=6;
		tabbar.loadPage('speedupdate.html');
	}
	$scope.dcdurationupdate=function(channel){
		$scope.durationupdatechange=$scope.dcd;
		statusindex=6;
		tabbar.loadPage('durationupdate.html');
	}
	$scope.setdurationupdate=function(){
		if (statusindex==6)	$scope.getcontrollerdata('mb339,'+$scope.durationupdatechange);
		if (statusindex==8)	$scope.getcontrollerdata('mb257,'+$scope.durationupdatechange);
	}
	$scope.invokegraph=function(id){
		names = [];
		names.push(id);
		tabbar.loadPage("singlegraph.html");
		CreateChart($scope,"paramscontainer");
	}
	if (statusindex==7) $scope.dimmingtab=true;
	if (statusindex==8) $scope.rftab=true;
	if (statusindex==6) $scope.dctab=true;
	$scope.dimmingtab=true;
	$scope.dimmingoverridelabel="Dimming Channel";
	$scope.cvarenabled=false;
	$scope.rfimage="spacer.png";
	$scope.dimmingoverrideslider = "{'range': true, 'actinicslider': true}";
	$scope.pwmoverride = "0";
	if ($localStorage.json != null && $localStorage.controllers.length>0) json=$localStorage.json
	if ($localStorage.jsonlabels != null && $localStorage.controllers.length>0) jsonlabels=$localStorage.jsonlabels
	loaddefaultvalues($scope);
	loadlabels($scope);
	UpdateParams($scope,$timeout,$localStorage);
});


app.controller('Settings', function($rootScope, $scope, $timeout, $localStorage) {

	$scope.$storage = $localStorage;
	$scope.controllers=$localStorage.controllers;
	$scope.$on('msg', function(event, msg) {
		console.log('Settings'+msg);
		if (msg=="update")
		{
			json.RA.lastrefresh=new Date().toLocaleString();
		}
	});
	if (editcontrollerid!=null)
	{
		$scope.controllername=$localStorage.controllers[editcontrollerid].name;
		$scope.controllerip=$localStorage.controllers[editcontrollerid].ipaddress;
		$scope.controllerport=$localStorage.controllers[editcontrollerid].port;
	}
	$scope.saveaddcontroller=function(){
		if (editcontrollerid==null)
		{
			$localStorage.controllers.push({
				name : $scope.controllername,
				ipaddress : $scope.controllerip,
				port : $scope.controllerport
			}); 
			$localStorage.jsonarray.push(null);
			$localStorage.jsonlabelsarray.push(null);
			$localStorage.activecontroller=$scope.controllername;
			$localStorage.activecontrollerid=$localStorage.controllers.length-1;
			json=null;
			$localStorage.json=null;
			jsonlabel=null;
			$localStorage.jsonlabel=null;
			$rootScope.$broadcast('msg', 'paramsok');
			$rootScope.$broadcast('msg', 'popoverclose');
		}
		else
		{
			$localStorage.controllers[editcontrollerid].name=$scope.controllername;
			$localStorage.controllers[editcontrollerid].ipaddress=$scope.controllerip;
			$localStorage.controllers[editcontrollerid].port=$scope.controllerport;
			if (editcontrollerid==$localStorage.activecontrollerid)
			{
				$localStorage.activecontroller=$scope.controllername;
				$rootScope.$broadcast('msg', 'popoverclose');
			}
		}
		$scope.loadcontrollertab();
	}
	$scope.loadcontrollertab=function(){
		editcontrollerid=null;
		tabbar.loadPage('settings.html');
	}
	$scope.loadinternalmemorytab=function(){
		tabbar.loadPage('internalmemory.html');
		$scope.getcontrollerdata('mr');
	}
	$scope.addcontroller=function(){
		tabbar.loadPage('addcontroller.html');
	}
	$scope.editcontroller=function(id){
		editcontrollerid=id;
		tabbar.loadPage('addcontroller.html');
	}
	$scope.deletecontroller=function(id){
		ons.notification.confirm({
		  message: 'Are you sure you want to delete ' + $localStorage.controllers[id].name + " controller?",
		  callback: function(idx) {
			switch (idx) {
			  case 1:
				delete $localStorage.controllers[id];
				$localStorage.controllers = $localStorage.controllers.filter(function(n){ return n != null }); 
				delete $localStorage.jsonarray[id];
				$localStorage.jsonarray = $localStorage.jsonarray.filter(function(n){ return n != null }); 
				if ($localStorage.jsonarray==null) $localStorage.jsonarray=[];
				delete $localStorage.jsonlabelsarray[id];
				$localStorage.jsonlabelsarray = $localStorage.jsonlabelsarray.filter(function(n){ return n != null }); 
				if ($localStorage.jsonlabelsarray==null) $localStorage.jsonlabelsarray=[];
				if ($localStorage.controllers.length==0)
				{
					json=null;
					$localStorage.json=null;
					jsonlabels=null;
					$localStorage.jsonlabels=null;
					$scope.activecontroller=null;
					$localStorage.activecontroller=null;
					$localStorage.activecontrollerid=null;
					$rootScope.$broadcast('msg', 'paramsok');
					$rootScope.$broadcast('msg', 'popoverclose');
				}
				if ($localStorage.activecontrollerid==id)
				{
					changeactivecontroller($scope, $localStorage, $rootScope, id-1);
				}
				tabbar.loadPage('settings.html');
				break;
			}
		  }
		});		
	}
});

app.controller('PopoverController', function($rootScope, $scope, $http, $localStorage){
	$scope.$storage = $localStorage;
	$scope.controllers=$localStorage.controllers;
	if ($localStorage.controllers == null) $localStorage.controllers=[];
	$scope.controllerselected=function(id){
		changeactivecontroller($scope, $localStorage, $rootScope, id);
	}
});

app.controller('Relay', function($rootScope, $scope, $timeout, $localStorage) {
	$scope.$storage = $localStorage;
	$scope.$on('msg', function(event, msg) {
		console.log('Relay'+msg);
		if (msg=="update")
		{
			json.RA.lastrefresh=new Date().toLocaleString();
			UpdateParams($scope,$timeout,$localStorage);
		}
		if (msg=="paramsok")
		{
			loaddefaultvalues($scope);
			loadlabels($scope);
			UpdateParams($scope,$timeout,$localStorage);
		}
	});
	$scope.loadmaintab=function(){
		console.log("main relay box");
	}
	$scope.loadexp1tab=function(){
		$localStorage.exp1tab=true;
		console.log("exp1 relay box");
		
	}
	loaddefaultvalues($scope);
	loadlabels($scope);
	UpdateParams($scope,$timeout,$localStorage);
});

app.controller('Graph', function($rootScope, $scope, $http, $timeout, $localStorage){
	$scope.$storage = $localStorage;
	$scope.showgraphlist=true;
	loaddefaultvalues($scope);
	loadlabels($scope);
	UpdateParams($scope,$timeout,$localStorage);
	$scope.$on('msg', function(event, msg) {
		console.log('Graph'+msg);
		if (msg=="update")
		{
			json.RA.lastrefresh=new Date().toLocaleString();
		}
		if (msg=="paramsok")
		{
			loaddefaultvalues($scope);
			loadlabels($scope);
			UpdateParams($scope,$timeout,$localStorage);
		}
	});
	$scope.buildgraph=function(){
		names = [];
		if ($scope.grapht1==true) names.push("T1");
		if ($scope.grapht2==true) names.push("T2");
		if ($scope.grapht3==true) names.push("T3");
		if ($scope.graphph==true) names.push("PH");
		if ($scope.graphsal==true) names.push("SAL");
		if ($scope.graphorp==true) names.push("ORP");
		if ($scope.graphphe==true) names.push("PHE");
		if ($scope.graphwl==true) names.push("WL");
		if ($scope.graphwl1==true) names.push("WL1");
		if ($scope.graphwl2==true) names.push("WL2");
		if ($scope.graphwl3==true) names.push("WL3");
		if ($scope.graphwl4==true) names.push("WL4");
		if ($scope.graphpar==true) names.push("PAR");
		if ($scope.graphhum==true) names.push("HUM");
		CreateChart($scope,"container");
	}
});

app.controller('InternalMemory', function($rootScope, $scope, $http, $timeout, $localStorage){
	$scope.$storage = $localStorage;
	$scope.showim=true;
	$scope.$on('msg', function(event, msg) {
		//console.log('Parameters'+msg);
		if (msg=="memoryrawok")
		{
			$scope.daylighton=new Date("01/01/01 " + getbytevalue(memoryraw,4).pad() + ":" + getbytevalue(memoryraw,5).pad());
			$scope.daylightoff=new Date("01/01/01 " + getbytevalue(memoryraw,6).pad() + ":" + getbytevalue(memoryraw,7).pad());
			$scope.daylightdelayed=getbytevalue(memoryraw,35);
			$scope.actinicoffset=getbytevalue(memoryraw,84);
			$scope.heateron=parseFloat(getintvalue(memoryraw,22)/10);
			$scope.heateroff=parseFloat(getintvalue(memoryraw,24)/10);
			$scope.chilleron=parseFloat(getintvalue(memoryraw,26)/10);
			$scope.chilleroff=parseFloat(getintvalue(memoryraw,28)/10);
			$scope.overheat=parseFloat(getintvalue(memoryraw,18)/10);
			$scope.atotimeout=getintvalue(memoryraw,76);
			$scope.waterlevellow=getbytevalue(memoryraw,131);
			$scope.waterlevelhigh=getbytevalue(memoryraw,132);
			$scope.wmtimer=getintvalue(memoryraw,8);
			$scope.co2controlon=parseFloat(getintvalue(memoryraw,85)/100);
			$scope.co2controloff=parseFloat(getintvalue(memoryraw,87)/100);
			$scope.phcontrolon=parseFloat(getintvalue(memoryraw,89)/100);
			$scope.phcontroloff=parseFloat(getintvalue(memoryraw,91)/100);
			$scope.dp1interval=getintvalue(memoryraw,43);
			$scope.dp1timer=getbytevalue(memoryraw,12);
			$scope.dp2interval=getintvalue(memoryraw,45);
			$scope.dp2timer=getbytevalue(memoryraw,13);
			$scope.dp3interval=getintvalue(memoryraw,134);
			$scope.dp3timer=getbytevalue(memoryraw,133);
			$scope.delayedon=getbytevalue(memoryraw,120);
			$scope.pwmslopestartd=getbytevalue(memoryraw,49);
			$scope.pwmslopeendd=getbytevalue(memoryraw,50);
			$scope.pwmslopedurationd=getbytevalue(memoryraw,51);
			$scope.pwmslopestarta=getbytevalue(memoryraw,52);
			$scope.pwmslopeenda=getbytevalue(memoryraw,53);
			$scope.pwmslopedurationa=getbytevalue(memoryraw,54);
			m=58;
			$scope.pwmslopestart=[];
			$scope.pwmslopeend=[];
			$scope.pwmslopeduration=[];
			for (a=0;a<6;a++)
			{
				$scope.pwmslopestart[a]=getbytevalue(memoryraw,m++);
				$scope.pwmslopeend[a]=getbytevalue(memoryraw,m++);
				$scope.pwmslopeduration[a]=getbytevalue(memoryraw,m++);
			}
		}
	});
	$scope.loadinternalmemorytab=function(){
		$scope.showim=true;
		$scope.getcontrollerdata('mr');
		$scope.memoryresult="";
	}
	$scope.loadcontrollertab=function(){
		editcontrollerid=null;
		tabbar.loadPage('settings.html');
	}
	$scope.toggleGroup = function(group){
		if ($scope.isGroupShown(group)) 
			$scope.shownGroup = null;
		else
			$scope.shownGroup = group;
	};
	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};
	$scope.memback = function(group) {
		$scope.getcontrollerdata('mr');
	};
	$scope.memsave = function(group) {
		MemString=[]; 
		MemURL=[];
		memindex=0;
		$scope.memoryresult="";
		if ($scope.daylightdelayed!=getbytevalue(memoryraw,35))
			SaveMemory("Daylights Delayed Start", "mb235," + $scope.daylightdelayed);
		if ($scope.actinicoffset!=getbytevalue(memoryraw,84))
			SaveMemory("Actinic Offset", "mb284," + $scope.actinicoffset);
		if  ($scope.daylighton-new Date("01/01/01 " + getbytevalue(memoryraw,4).pad() + ":" + getbytevalue(memoryraw,5).pad()))
		{
			SaveMemory("Daylights On Hour", "mb204," + new Date(Date.parse($scope.daylighton)).getHours());
			SaveMemory("Daylights On Minute", "mb205," + new Date(Date.parse($scope.daylighton)).getMinutes());
		}
		if  ($scope.daylightoff-new Date("01/01/01 " + getbytevalue(memoryraw,6).pad() + ":" + getbytevalue(memoryraw,7).pad()))
		{
			SaveMemory("Daylights Off Hour", "mb206," + new Date(Date.parse($scope.daylightoff)).getHours());
			SaveMemory("Daylights Off Minute", "mb207," + new Date(Date.parse($scope.daylightoff)).getMinutes());
		}
		if ($scope.heateron!=getintvalue(memoryraw,22)/10)
			SaveMemory("Heater On", "mi222," + Math.round($scope.heateron*10));
		if ($scope.heateroff!=getintvalue(memoryraw,24)/10)
			SaveMemory("Heater Off", "mi224," + Math.round($scope.heateroff*10));
		if ($scope.chilleron!=getintvalue(memoryraw,26)/10)
			SaveMemory("Chiller On", "mi226," + Math.round($scope.chilleron*10));
		if ($scope.chilleroff!=getintvalue(memoryraw,28)/10)
			SaveMemory("Chiller Off", "mi228," + Math.round($scope.chilleroff*10));
		if ($scope.overheat!=getintvalue(memoryraw,18)/10)
			SaveMemory("Overheat Temperature", "mi218," + Math.round($scope.overheat*10));
		if ($scope.atotimeout!=getintvalue(memoryraw,76))
			SaveMemory("Auto Top Off Timeout", "mi276," + $scope.atotimeout);
		if ($scope.wmtimer!=getintvalue(memoryraw,8))
			SaveMemory("Wavemaker Timer", "mi208," + $scope.wmtimer);
		if ($scope.co2controlon!=getintvalue(memoryraw,85)/100)
			SaveMemory("CO2 Control On", "mi285," + Math.round($scope.co2controlon*100));
		if ($scope.co2controloff!=getintvalue(memoryraw,87)/100)
			SaveMemory("CO2 Control Off", "mi287," + Math.round($scope.co2controloff*100));
		if ($scope.phcontrolon!=getintvalue(memoryraw,89)/100)
			SaveMemory("pH Control Off", "mi289," + Math.round($scope.phcontrolon*100));
		if ($scope.phcontroloff!=getintvalue(memoryraw,91)/100)
			SaveMemory("pH Control Off", "mi291," + Math.round($scope.phcontroloff*100));
		if ($scope.dp1interval!=getintvalue(memoryraw,43))
			SaveMemory("Dosing Pump 1 Interval", "mi243," + $scope.dp1interval);
		if ($scope.dp1timer!=getbytevalue(memoryraw,12))
			SaveMemory("Dosing Pump 1 Timer", "mb212," + $scope.dp1timer);
		if ($scope.dp2interval!=getintvalue(memoryraw,45))
			SaveMemory("Dosing Pump 2 Interval", "mi245," + $scope.dp2interval);
		if ($scope.dp2timer!=getbytevalue(memoryraw,13))
			SaveMemory("Dosing Pump 2 Timer", "mb213," + $scope.dp2timer);
		if ($scope.dp3interval!=getintvalue(memoryraw,134))
			SaveMemory("Dosing Pump 3 Interval", "mi334," + $scope.dp3interval);
		if ($scope.dp3timer!=getbytevalue(memoryraw,133))
			SaveMemory("Dosing Pump 3 Timer", "mb333," + $scope.dp3timer);
		if ($scope.delayedon!=getbytevalue(memoryraw,120))			
			SaveMemory("Delayed Start", "mb320," + $scope.delayedon);
		if ($scope.pwmslopestartd!=getbytevalue(memoryraw,49))			
			SaveMemory("Daylight Dimming Start %", "mb249," + $scope.pwmslopestartd);
		if ($scope.pwmslopeendd!=getbytevalue(memoryraw,50))			
			SaveMemory("Daylight Dimming End %", "mb250," + $scope.pwmslopeendd);
		if ($scope.pwmslopedurationd!=getbytevalue(memoryraw,51))			
			SaveMemory("Daylight Dimming Duration", "mb251," + $scope.pwmslopedurationd);
		if ($scope.pwmslopestarta!=getbytevalue(memoryraw,52))			
			SaveMemory("Actinic Dimming Start %", "mb252," + $scope.pwmslopestarta);
		if ($scope.pwmslopeenda!=getbytevalue(memoryraw,53))			
			SaveMemory("Actinic Dimming End %", "mb253," + $scope.pwmslopeenda);
		if ($scope.pwmslopedurationa!=getbytevalue(memoryraw,54))			
			SaveMemory("Actinic Dimming Duration", "mb254," + $scope.pwmslopedurationa);
		if ($scope.waterlevellow!=getbytevalue(memoryraw,131))			
			SaveMemory("Low Water Level", "mb331," + $scope.waterlevellow);
		if ($scope.waterlevelhigh!=getbytevalue(memoryraw,132))			
			SaveMemory("High Water Level", "mb332," + $scope.waterlevelhigh);
		m=58;
		for (a=0;a<6;a++)
		{
			if ($scope.pwmslopestart[a]!=getbytevalue(memoryraw,m))
			{
				t=200+m;
				SaveMemory("Dimming Expansion Channel " + a + " Start %", "mb" + t + "," + $scope.pwmslopestart[a]);
			}
			m++;
			if ($scope.pwmslopeend[a]!=getbytevalue(memoryraw,m))	
			{		
				t=200+m;
				SaveMemory("Dimming Expansion Channel " + a + " End %", "mb" + t + "," + $scope.pwmslopeend[a]);
			}
			m++;
			if ($scope.pwmslopeduration[a]!=getbytevalue(memoryraw,m))
			{			
				t=200+m;
				SaveMemory("Dimming Expansion Channel " + a + " Duration", "mb" + t + "," + $scope.pwmslopeduration[a]);
			}
			m++;
		}
		if (MemString.length>0)
		{
			modal.show();
			$scope.showim=false;
			$scope.memoryresult+=MemString[memindex];
			$scope.updatecontrollermemory(MemURL[memindex]);
		}
		else
		{
			ons.notification.alert({message: 'Nothing to update.'});
		}
	};
	
	$scope.updatecontrollermemory=function(cmd){
		console.log(cmd);
		var tempurl="http://" + $localStorage.controllers[$localStorage.activecontrollerid].ipaddress + ":" + $localStorage.controllers[$localStorage.activecontrollerid].port + "/" + cmd;
		var request=$http({
			method:"GET",
			url: tempurl,
			timeout: 3000
		});
		request.success(function(data){
			console.log(data);
			if (data.indexOf("OK")>0)
				$scope.memoryresult+=": OK\n";
			else
				$scope.memoryresult+=": Error\n";
			if (memindex<(MemString.length-1))
			{
				memindex++;
				$scope.memoryresult+=MemString[memindex];
				$timeout(function() {
					$scope.updatecontrollermemory(MemURL[memindex]);
				}, 1000);
			}
			else
			{
				modal.hide();
			}

		});
		request.error(function(data){
			modal.hide();
			ons.notification.alert({message: 'Unable to process controller data!'});
		})
	}	
});

function UpdateParams($scope,$timeout,$localStorage)
{
	$scope.$storage = $localStorage;
	if (json!=null)
	{
		$scope.lastupdated=json.RA.lastrefresh;
		$scope.dimmingexpansionenabled = ((json.RA.EM & 1) == 1)
				if (json.RA.C0>0 || json.RA.C1>0 || json.RA.C2>0 || json.RA.C3>0 || json.RA.C4>0 || json.RA.C5>0 || json.RA.C6>0 || json.RA.C7>0) $scope.cvarenabled=true;
		$scope.rfenabled = ((json.RA.EM & 2) == 2)
				$scope.dcpumpenabled = ((json.RA.EM1 & 2) == 2)
				$scope.forumid = json.RA.ID;
		$scope.t1 = (json.RA.T1/10).toFixed(1);
		$scope.t2 = (json.RA.T2/10).toFixed(1);
		$scope.t3 = (json.RA.T3/10).toFixed(1);
		$scope.ph = (json.RA.PH/100).toFixed(2);
		if (json.RA.BID == 4)
		{
			$scope.stardimmingenabled=true;
			$scope.pwmd2 = json.RA.PWMD2;
			$scope.pwma2 = json.RA.PWMA2;
			if (json.RA.PWMD2O<=100) $scope.pwmd2class = "dimmingoverridehighlight";
			if (json.RA.PWMA2O<=100) $scope.pwma2class = "dimmingoverridehighlight";
			$scope.alarm = json.RA.ALARM;
			$scope.leak = json.RA.LEAK;
		}
		else
		{
			$scope.mainenabled=true;
		}
		if (json.RA.REM>0)
		{
			$scope.expansionenabled=true;
			if ((json.RA.REM & 1) == 1)
				$scope.exp1enabled=true;
			if ((json.RA.REM & 2) == 2)
				$scope.exp2enabled=true;
			if ((json.RA.REM & 4) == 4)
				$scope.exp3enabled=true;
			if ((json.RA.REM & 8) == 8)
				$scope.exp4enabled=true;
			if ((json.RA.REM & 16) == 16)
				$scope.exp5enabled=true;
			if ((json.RA.REM & 32) == 32)
				$scope.exp6enabled=true;
			if ((json.RA.REM & 64) == 64)
				$scope.exp7enabled=true;
			if ((json.RA.REM & 128) == 128)
				$scope.exp8enabled=true;
		}
		if ((json.RA.EM & 1) == 1)
		{
			$scope.pwme0 = json.RA.PWME0;
			$scope.pwme1 = json.RA.PWME1;
			$scope.pwme2 = json.RA.PWME2;
			$scope.pwme3 = json.RA.PWME3;
			$scope.pwme4 = json.RA.PWME4;
			$scope.pwme5 = json.RA.PWME5;
			if (json.RA.PWME0O<=100) $scope.pwme0class = "dimmingoverridehighlight";
			if (json.RA.PWME1O<=100) $scope.pwme1class = "dimmingoverridehighlight";
			if (json.RA.PWME2O<=100) $scope.pwme2class = "dimmingoverridehighlight";
			if (json.RA.PWME3O<=100) $scope.pwme3class = "dimmingoverridehighlight";
			if (json.RA.PWME4O<=100) $scope.pwme4class = "dimmingoverridehighlight";
			if (json.RA.PWME5O<=100) $scope.pwme5class = "dimmingoverridehighlight";
		}
		if ((json.RA.EM & 2) == 2)
		{
			$scope.rfm = rfmodes[json.RA.RFM];
			$scope.rfs = json.RA.RFS;
			$scope.rfd = json.RA.RFD;
			$scope.rfmodecolor = rfmodecolors[json.RA.RFM];
			$scope.rfimage = rfimages[json.RA.RFM];
			$scope.rfw = json.RA.RFW;
			$scope.rfrb = json.RA.RFRB;
			$scope.rfr = json.RA.RFR;
			$scope.rfg = json.RA.RFG;
			$scope.rfb = json.RA.RFB;
			$scope.rfi = json.RA.RFI;
			if (json.RA.RFWO<=100) $scope.rfwclass = "dimmingoverridehighlight";
			if (json.RA.RFRBO<=100) $scope.rfrbclass = "dimmingoverridehighlight";
			if (json.RA.RFRO<=100) $scope.rfrclass = "dimmingoverridehighlight";
			if (json.RA.RFGO<=100) $scope.rfgclass = "dimmingoverridehighlight";
			if (json.RA.RFBO<=100) $scope.rfbclass = "dimmingoverridehighlight";
			if (json.RA.RFIO<=100) $scope.rficlass = "dimmingoverridehighlight";
			
		}
		if ((json.RA.EM & 8) == 8)
		{
			$scope.salinityenabled=true;
			$scope.saln = "Salinity";
			$scope.sal = (json.RA.SAL/10).toFixed(1);
		}
		if ((json.RA.EM & 16) == 16)
		{
			$scope.orpenabled=true;
			$scope.orpn = "ORP";
			$scope.orp = json.RA.ORP;
		}
		if ((json.RA.EM & 32) == 32)
		{
			$scope.io0n = "I/O Channel 0";
			$scope.io1n = "I/O Channel 1";
			$scope.io2n = "I/O Channel 2";
			$scope.io3n = "I/O Channel 3";
			$scope.io4n = "I/O Channel 4";
			$scope.io5n = "I/O Channel 5";
			$scope.io0 = (json.RA.IO & 1)/1;
			$scope.io1 = (json.RA.IO & 2)/2;
			$scope.io2 = (json.RA.IO & 4)/4;
			$scope.io3 = (json.RA.IO & 8)/8;
			$scope.io4 = (json.RA.IO & 16)/16;
			$scope.io5 = (json.RA.IO & 32)/32;
		}
		if ((json.RA.EM & 64) == 64)
		{
			$scope.pheenabled=true;
			$scope.phen = "pH Expansion";
			$scope.phe = (json.RA.PHE/100).toFixed(2);
		}
		if ((json.RA.EM & 128) == 128)
		{
			$scope.wln = "Water Level 0";
			$scope.wl1n = "Water Level 1";
			$scope.wl2n = "Water Level 2";
			$scope.wl3n = "Water Level 3";
			$scope.wl4n = "Water Level 4";
			$scope.wl = json.RA.WL;
			$scope.wl1 = json.RA.WL1;
			$scope.wl2 = json.RA.WL2;
			$scope.wl3 = json.RA.WL3;
			$scope.wl4 = json.RA.WL4;
			if (json.RA.WL!=null) $scope.wlenabled=true;
			if (json.RA.WL1!=null) $scope.multiwlenabled=true;
		}
		if ((json.RA.EM1 & 1) == 1)
		{
			$scope.humenabled=true;
			$scope.humn = "Humidity";
			$scope.hum = json.RA.HUM;
		}
		if ((json.RA.EM1 & 2) == 2)
		{
			$scope.dcm = rfmodes[json.RA.DCM];
			$scope.dcs = json.RA.DCS;
			$scope.dcd = json.RA.DCD;
			$scope.dcmodecolor = rfmodecolors[json.RA.DCM];
			$scope.dcimage = rfimages[json.RA.DCM];
		}
		if ((json.RA.EM1 & 8) == 8)
		{
			$scope.parenabled=true;
			$scope.parn = "PAR";
			$scope.par = json.RA.PAR;
		}
		if (json.RA.AF>0 || json.RA.SF>0)
			$scope.lbl_NoFlags = "";
		else
			$scope.lbl_NoFlags = "No alert flags";
		if ((json.RA.AF & 1) == 1)
		{
			$scope.lbl_ATOTimeout = "ATO Timeout";
			$scope.ATOTimeout = "clock"
		}
		if ((json.RA.AF & 2) == 2)
		{
			$scope.lbl_Overheat = "Overheat";
			$scope.Overheat = "overheat"
		}
		if ((json.RA.AF & 4) == 4)
		{
			$scope.lbl_BusLock = "Bus Lock";
			$scope.BusLock = "buserror"
		}
		if ((json.RA.AF & 8) == 8)
		{
			$scope.leakn = "Water Leak";
			$scope.Leak = "leak"
		}
		if ((json.RA.SF & 1) == 1)
		{
			$scope.lbl_LightsOn = "Lights On";
			$scope.LightsOn = "lights"
		}
		$scope.atohigh = json.RA.ATOHIGH;
		$scope.atolow = json.RA.ATOLOW;
		if (json.RA.PWMD!=null)
			$scope.pwmd = json.RA.PWMD;
		if (json.RA.PWMA!=null)
			$scope.pwma = json.RA.PWMA;
		if (json.RA.PWMDO<=100) $scope.pwmdclass = "dimmingoverridehighlight";
		if (json.RA.PWMAO<=100) $scope.pwmaclass = "dimmingoverridehighlight";
		$scope.c0 = json.RA.C0;
		$scope.c1 = json.RA.C1;
		$scope.c2 = json.RA.C2;
		$scope.c3 = json.RA.C3;
		$scope.c4 = json.RA.C4;
		$scope.c5 = json.RA.C5;
		$scope.c6 = json.RA.C6;
		$scope.c7 = json.RA.C7;

		$scope.dimmingoverridelabel=dimmingchannels[channeloverride];
		if (channeloverride==0)
		{
			$scope.dimmingoverridechange = $scope.pwmd;
			$scope.dimmingoverrideslider = "{'range': true, 'daylightslider': true}";
		}
		if (channeloverride==1)
		{
			$scope.dimmingoverridechange = $scope.pwma;
			$scope.dimmingoverrideslider = "{'range': true, 'actinicslider': true}";
		}
		if (channeloverride==2)
		{
			$scope.dimmingoverridechange = $scope.pwmd2;
			$scope.dimmingoverrideslider = "{'range': true, 'daylightslider': true}";
		}
		if (channeloverride==3)
		{
			$scope.dimmingoverridechange = $scope.pwma2;
			$scope.dimmingoverrideslider = "{'range': true, 'actinicslider': true}";
		}
		if (channeloverride==4)
		{
			$scope.dimmingoverridechange = $scope.pwme0;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==5)
		{
			$scope.dimmingoverridechange = $scope.pwme1;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==6)
		{
			$scope.dimmingoverridechange = $scope.pwme2;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==7)
		{
			$scope.dimmingoverridechange = $scope.pwme3;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==8)
		{
			$scope.dimmingoverridechange = $scope.pwme4;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==9)
		{
			$scope.dimmingoverridechange = $scope.pwme5;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==13)
		{
			$scope.dimmingoverridechange = $scope.rfw;
			$scope.dimmingoverrideslider = "{'range': true, 'daylightslider': true}";
		}
		if (channeloverride==14)
		{
			$scope.dimmingoverridechange = $scope.rfrb;
			$scope.dimmingoverrideslider = "{'range': true, 'actinicslider': true}";
		}
		if (channeloverride==15)
		{
			$scope.dimmingoverridechange = $scope.rfr;
			$scope.dimmingoverrideslider = "{'range': true, 'redslider': true}";
		}
		if (channeloverride==16)
		{
			$scope.dimmingoverridechange = $scope.rfg;
			$scope.dimmingoverrideslider = "{'range': true, 'pwmeslider': true}";
		}
		if (channeloverride==17)
		{
			$scope.dimmingoverridechange = $scope.rfb;
			$scope.dimmingoverrideslider = "{'range': true, 'blueslider': true}";
		}
		if (channeloverride==18)
		{
			$scope.dimmingoverridechange = $scope.rfi;
			$scope.dimmingoverrideslider = "{'range': true, 'intensityslider': true}";
		}
		$scope.cvarupdatelabel=customvars[cvarupdateindex];
		if (cvarupdateindex==0) $scope.cvarupdatechange = $scope.c0;
		if (cvarupdateindex==1) $scope.cvarupdatechange = $scope.c1;
		if (cvarupdateindex==2) $scope.cvarupdatechange = $scope.c2;
		if (cvarupdateindex==3) $scope.cvarupdatechange = $scope.c3;
		if (cvarupdateindex==4) $scope.cvarupdatechange = $scope.c4;
		if (cvarupdateindex==5) $scope.cvarupdatechange = $scope.c5;
		if (cvarupdateindex==6) $scope.cvarupdatechange = $scope.c6;
		if (cvarupdateindex==7) $scope.cvarupdatechange = $scope.c7;
		$scope.rfmodeupdatechange = $scope.rfm;
		$scope.dcmodeupdatechange = $scope.dcm;
		if (statusindex==6)
		{
			$scope.speedupdatechange=$scope.dcs;
			$scope.durationupdatechange=$scope.dcd;
		}
		if (statusindex==8)
		{
			$scope.speedupdatechange=$scope.rfs;
			$scope.durationupdatechange=$scope.rfd;
		}
		for (a=1;a<=8;a++)
		{
			if ((json.RA.RON & (1<<(a-1))) == 0 && (json.RA.ROFF & (1<<(a-1))) == (1<<(a-1)))
			{
				$scope["r"+a+"on"]=false;
				$scope["r"+a+"off"]=false;
				$scope["r"+a+"auto"]=true;
				if ((json.RA.R & (1<<(a-1))) == (1<<(a-1)))
					$scope["r"+a+"autoclass"]="relaygreenclass";
				else
					$scope["r"+a+"autoclass"]="relayredclass";
				$scope["r"+a+"onclass"]="relayblankclass";
				$scope["r"+a+"offclass"]="relayblankclass";
			}
			if ((json.RA.RON & (1<<(a-1))) == (1<<(a-1)))
			{
				$scope["r"+a+"onclass"]="relaygreenclass";
				$scope["r"+a+"offclass"]="relayblankclass";
				$scope["r"+a+"autoclass"]="relayblankclass";
				$scope["r"+a+"on"]=true;
				$scope["r"+a+"off"]=false;
				$scope["r"+a+"auto"]=false;
			}
			if ((json.RA.ROFF & (1<<(a-1))) == 0)
			{
				$scope["r"+a+"onclass"]="relayblankclass";
				$scope["r"+a+"offclass"]="relayredclass";
				$scope["r"+a+"autoclass"]="relayblankclass";
				$scope["r"+a+"on"]=false;
				$scope["r"+a+"off"]=true;
				$scope["r"+a+"auto"]=false;
			}
			for (b=1;b<=8;b++)
			{
				if ((json.RA["RON"+a] & (1<<(b-1))) == 0 && (json.RA["ROFF"+a] & (1<<(b-1))) == (1<<(b-1)))
				{
					$scope["r"+a+b+"on"]=false;
					$scope["r"+a+b+"off"]=false;
					$scope["r"+a+b+"auto"]=true;
					if ((json.RA.R & (1<<(b-1))) == (1<<(b-1)))
						$scope["r"+a+b+"autoclass"]="relaygreenclass";
					else
						$scope["r"+a+b+"autoclass"]="relayredclass";
					$scope["r"+a+b+"onclass"]="relayblankclass";
					$scope["r"+a+b+"offclass"]="relayblankclass";
				}
				if ((json.RA["RON"+a] & (1<<(b-1))) == (1<<(b-1)))
				{
					$scope["r"+a+b+"onclass"]="relaygreenclass";
					$scope["r"+a+b+"offclass"]="relayblankclass";
					$scope["r"+a+b+"autoclass"]="relayblankclass";
					$scope["r"+a+b+"on"]=true;
					$scope["r"+a+b+"off"]=false;
					$scope["r"+a+b+"auto"]=false;
				}
				if ((json.RA["ROFF"+a] & (1<<(b-1))) == 0)
				{
					$scope["r"+a+b+"onclass"]="relayblankclass";
					$scope["r"+a+b+"offclass"]="relayredclass";
					$scope["r"+a+b+"autoclass"]="relayblankclass";
					$scope["r"+a+b+"on"]=false;
					$scope["r"+a+b+"off"]=true;
					$scope["r"+a+b+"auto"]=false;
				}
			}			
		}
	}
}

function loaddefaultvalues($scope)
{
	$scope.lbl_forumid = "Forum username:";
	$scope.forumid = "Unknown";
	$scope.lastupdated = "Never";
	$scope.t1n = "Temp 1";
	$scope.t1 = "0.0";
	$scope.t2n = "Temp 2";
	$scope.t2 = "0.0";
	$scope.t3n = "Temp 3";
	$scope.t3 = "0.0";
	$scope.phn = "pH";
	$scope.ph = "0.00";
	$scope.lbl_NoFlags="No alert flags";
	$scope.atohighn="ATO High";
	$scope.atohigh="0";
	$scope.atolown="ATO Low";
	$scope.atolow="0";
	$scope.pwmd1n="Daylight Channel";
	$scope.pwmd="0";
	$scope.pwma1n="Actinic Channel";
	$scope.pwma="0";
	$scope.alarmn="Alarm";
	$scope.alarm="0";
	$scope.leakn="Leak";
	$scope.leak="0";
	$scope.pwmd2n="Daylight Channel 2";
	$scope.pwmd2="0";
	$scope.pwma2n="Actinic Channel 2";
	$scope.pwma2="0";
	$scope.pwme0n="Dimming Channel 0";
	$scope.pwme0="0";
	$scope.pwme1n="Dimming Channel 1";
	$scope.pwme1="0";
	$scope.pwme2n="Dimming Channel 2";
	$scope.pwme2="0";
	$scope.pwme3n="Dimming Channel 3";
	$scope.pwme3="0";
	$scope.pwme4n="Dimming Channel 4";
	$scope.pwme4="0";
	$scope.pwme5n="Dimming Channel 5";
	$scope.pwme5="0";
	$scope.c0n="Custom Var 0:";
	$scope.c0="0";
	$scope.c1n="Custom Var 1:";
	$scope.c1="0";
	$scope.c2n="Custom Var 2:";
	$scope.c2="0";
	$scope.c3n="Custom Var 3:";
	$scope.c3="0";
	$scope.c4n="Custom Var 4:";
	$scope.c4="0";
	$scope.c5n="Custom Var 5:";
	$scope.c5="0";
	$scope.c6n="Custom Var 6:";
	$scope.c6="0";
	$scope.c7n="Custom Var 7:";
	$scope.c7="0";
	$scope.rfwn="White Channel";
	$scope.rfw="0";
	$scope.rfrbn="Royal Blue Channel";
	$scope.rfrb="0";
	$scope.rfrn="Red Channel";
	$scope.rfr="0";
	$scope.rfgn="Green Channel";
	$scope.rfg="0";
	$scope.rfbn="Blue Channel";
	$scope.rfb="0";
	$scope.rfin="Intensity Channel";
	$scope.rfi="0";
	$scope.atohigh = 0;
	$scope.atolow = 0;
	$scope.pwmd = 0;
	$scope.pwma = 0;
	$scope.salinityenabled=false;
	$scope.orpenabled=false;
	$scope.pheenabled=false;
	$scope.wlenabled=false;
	$scope.multiwlenabled=false;
	$scope.humenabled=false;
	$scope.parenabled=false;
	$scope.stardimmingenabled=false;
	$scope.cvarenabled=false;
	$scope.rfenabled=false;
	$scope.dcpumpenabled=false;
	$scope.dimmingexpansionenabled=false;
	$scope.saln = "";
	$scope.sal = "";
	$scope.orpn = "";
	$scope.orp = "";
	$scope.phen = "";
	$scope.phe = "";
	$scope.wln = "";
	$scope.wl1n = "";
	$scope.wl2n = "";
	$scope.wl3n = "";
	$scope.wl4n = "";
	$scope.wl = "";
	$scope.wl1 = "";
	$scope.wl2 = "";
	$scope.wl3 = "";
	$scope.wl4 = "";
	$scope.humn = "";
	$scope.hum = "";
	$scope.parn = "";
	$scope.par = "";
	$scope.lbl_NoFlags = "No alert flags";
	$scope.lbl_ATOTimeout = "";
	$scope.ATOTimeout = "spacer"
	$scope.lbl_Overheat = "";
	$scope.Overheat = "spacer"
	$scope.lbl_BusLock = "";
	$scope.BusLock = "spacer"
	$scope.leakn = "";
	$scope.Leak = "spacer"
	$scope.lbl_LightsOn = "";
	$scope.LightsOn = "spacer"
	$scope.mainenabled=false;
	$scope.expansionenabled=false;
	$scope.exp1enabled=false;
	$scope.exp2enabled=false;
	$scope.exp3enabled=false;
	$scope.exp4enabled=false;
	$scope.exp5enabled=false;
	$scope.exp6enabled=false;
	$scope.exp7enabled=false;
	$scope.exp8enabled=false;
	for (a=1;a<=8;a++)
	{
		$scope["r"+a+"on"]=false;
		$scope["r"+a+"off"]=false;
		$scope["r"+a+"auto"]=false;
		$scope["r"+a+"onclass"]="relayblankclass";
		$scope["r"+a+"offclass"]="relayblankclass";
		$scope["r"+a+"autoclass"]="relayblankclass";
		$scope["r"+a+"n"]="Relay " + a;
		for (b=1;b<=8;b++)
		{
			$scope["r"+a+b+"on"]=false;
			$scope["r"+a+b+"off"]=false;
			$scope["r"+a+b+"auto"]=false;
			$scope["r"+a+b+"onclass"]="relayblankclass";
			$scope["r"+a+b+"offclass"]="relayblankclass";
			$scope["r"+a+b+"autoclass"]="relayblankclass";
			$scope["r"+a+b+"n"]="Relay " + a + b;
		}
	}
}

function loadlabels($scope) {
	if (jsonlabels!=null)
	{
		if (jsonlabels.RA.T1N=="null")
			$scope.t1n = "Temp 1";
		else
			$scope.t1n=jsonlabels.RA.T1N;
		if (jsonlabels.RA.T2N=="null")
			$scope.t2n = "Temp 2";
		else
			$scope.t2n=jsonlabels.RA.T2N;
		if (jsonlabels.RA.T3N=="null")
			$scope.t3n = "Temp 3";
		else
			$scope.t3n=jsonlabels.RA.T3N;
		if (jsonlabels.RA.PHN=="null")
			$scope.phn = "pH";
		else
			$scope.phn=jsonlabels.RA.PHN;
		if (jsonlabels.RA.SALN=="null")
			$scope.saln = "Salinity";
		else
			$scope.saln=jsonlabels.RA.SALN;
		if (jsonlabels.RA.ORPN=="null")
			$scope.orpn = "ORP";
		else
			$scope.orpn=jsonlabels.RA.ORPN;
		if (jsonlabels.RA.PHEN=="null")
			$scope.phen = "pH Expansion";
		else
			$scope.phen=jsonlabels.RA.PHEN;
		if (jsonlabels.RA.HUMN=="null")
			$scope.humn = "Humidity";
		else
			$scope.humn=jsonlabels.RA.HUMN;
		if (jsonlabels.RA.WLN=="null")
			$scope.wln = "Water Level 0";
		else
			$scope.wln=jsonlabels.RA.WLN;
		if (jsonlabels.RA.WL1N=="null")
			$scope.wl1n = "Water Level 1";
		else
			$scope.wl1n=jsonlabels.RA.WL1N;
		if (jsonlabels.RA.WL2N=="null")
			$scope.wl2n = "Water Level 2";
		else
			$scope.wl2n=jsonlabels.RA.WL2N;
		if (jsonlabels.RA.WL3N=="null")
			$scope.wl3n = "Water Level 3";
		else
			$scope.wl3n=jsonlabels.RA.WL3N;
		if (jsonlabels.RA.WL4N=="null")
			$scope.wl4n = "Water Level 4";
		else
			$scope.wl4n=jsonlabels.RA.WL4N;

		if (jsonlabels.RA.ATOHIGHN=="null")
			$scope.atohighn = "ATO High";
		else
			$scope.atohighn=jsonlabels.RA.ATOHIGHN;
		if (jsonlabels.RA.ATOLOWN=="null")
			$scope.atolown = "ATO Low";
		else
			$scope.atolown=jsonlabels.RA.ATOLOWN;
		if (jsonlabels.RA.PWMD1N=="null")
			$scope.pwmd1n = "Daylight Channel";
		else
			$scope.pwmd1n=jsonlabels.RA.PWMD1N;
		if (jsonlabels.RA.PWMA1N=="null")
			$scope.pwma1n = "Actinic Channel";
		else
			$scope.pwma1n=jsonlabels.RA.PWMA1N;
		if (jsonlabels.RA.ALARMN=="null")
			$scope.alarmn = "Alarm";
		else
			$scope.alarmn=jsonlabels.RA.ALARMN;
		if (jsonlabels.RA.LEAKN=="null")
			$scope.leakn = "Leak";
		else
			$scope.leakn=jsonlabels.RA.LEAKN;
		if (jsonlabels.RA.PWMD2N=="null")
			$scope.pwmd2n = "Daylight Channel 2";
		else
			$scope.pwmd2n=jsonlabels.RA.PWMD2N;
		if (jsonlabels.RA.PWMA2N=="null")
			$scope.pwma2n = "Actinic Channel 2";
		else
			$scope.pwma2n=jsonlabels.RA.PWMA2N;
		if (jsonlabels.RA.PWME0N=="null")
			$scope.pwme0n = "Dimming Channel 0";
		else
			$scope.pwme0n=jsonlabels.RA.PWME0N;
		if (jsonlabels.RA.PWME1N=="null")
			$scope.pwme1n = "Dimming Channel 1";
		else
			$scope.pwme1n=jsonlabels.RA.PWME1N;
		if (jsonlabels.RA.PWME2N=="null")
			$scope.pwme2n = "Dimming Channel 2";
		else
			$scope.pwme2n=jsonlabels.RA.PWME2N;
		if (jsonlabels.RA.PWME3N=="null")
			$scope.pwme3n = "Dimming Channel 3";
		else
			$scope.pwme3n=jsonlabels.RA.PWME3N;
		if (jsonlabels.RA.PWME4N=="null")
			$scope.pwme4n = "Dimming Channel 4";
		else
			$scope.pwme4n=jsonlabels.RA.PWME4N;
		if (jsonlabels.RA.PWME5N=="null")
			$scope.pwme5n = "Dimming Channel 5";
		else
			$scope.pwme5n=jsonlabels.RA.PWME5N;
		if (jsonlabels.RA.C0N=="null")
			$scope.c0n = "Custom Var 0:";
		else
			$scope.c0n=jsonlabels.RA.C0N;
		if (jsonlabels.RA.C1N=="null")
			$scope.c1n = "Custom Var 1:";
		else
			$scope.c1n=jsonlabels.RA.C1N;
		if (jsonlabels.RA.C2N=="null")
			$scope.c2n = "Custom Var 2:";
		else
			$scope.c2n=jsonlabels.RA.C2N;
		if (jsonlabels.RA.C3N=="null")
			$scope.c3n = "Custom Var 3:";
		else
			$scope.c3n=jsonlabels.RA.C3N;
		if (jsonlabels.RA.C4N=="null")
			$scope.c4n = "Custom Var 4:";
		else
			$scope.c4n=jsonlabels.RA.C4N;
		if (jsonlabels.RA.C5N=="null")
			$scope.c5n = "Custom Var 5:";
		else
			$scope.c5n=jsonlabels.RA.C5N;
		if (jsonlabels.RA.C6N=="null")
			$scope.c6n = "Custom Var 6:";
		else
			$scope.c6n=jsonlabels.RA.C6N;
		if (jsonlabels.RA.C7N=="null")
			$scope.c7n = "Custom Var 7:";
		else
			$scope.c7n=jsonlabels.RA.C7N;
		if (jsonlabels.RA.RFWN=="null")
			$scope.rfwn = "White Channel:";
		else
			$scope.rfwn=jsonlabels.RA.RFWN;
		if (jsonlabels.RA.RFRBN=="null")
			$scope.rfrbn = "Royal Blue Channel:";
		else
			$scope.rfrbn=jsonlabels.RA.RFRBN;
		if (jsonlabels.RA.RFRN=="null")
			$scope.rfrn = "Red Channel:";
		else
			$scope.rfrn=jsonlabels.RA.RFRN;
		if (jsonlabels.RA.RFGN=="null")
			$scope.rfgn = "Green Channel:";
		else
			$scope.rfgn=jsonlabels.RA.RFGN;
		if (jsonlabels.RA.RFBN=="null")
			$scope.rfbn = "Blue Channel:";
		else
			$scope.rfbn=jsonlabels.RA.RFBN;
		if (jsonlabels.RA.RFIN=="null")
			$scope.rfin = "Intensity Channel:";
		else
			$scope.rfin=jsonlabels.RA.RFIN;
		if (jsonlabels.RA.IO0N=="null")
			$scope.io0n = "I/O Channel 0";
		else
			$scope.io0n=jsonlabels.RA.IO0N;
		if (jsonlabels.RA.IO1N=="null")
			$scope.io1n = "I/O Channel 1";
		else
			$scope.io1n=jsonlabels.RA.IO1N;
		if (jsonlabels.RA.IO2N=="null")
			$scope.io2n = "I/O Channel 2";
		else
			$scope.io2n=jsonlabels.RA.IO2N;
		if (jsonlabels.RA.IO3N=="null")
			$scope.io3n = "I/O Channel 3";
		else
			$scope.io3n=jsonlabels.RA.IO3N;
		if (jsonlabels.RA.IO4N=="null")
			$scope.io4n = "I/O Channel 4";
		else
			$scope.io4n=jsonlabels.RA.IO4N;
		if (jsonlabels.RA.IO5N=="null")
			$scope.io5n = "I/O Channel 5";
		else
			$scope.io5n=jsonlabels.RA.IO5N;
		for (a=1; a<=8; a++)
		{
			if (jsonlabels.RA["R"+a+"N"]=="null")
				$scope["r"+a+"n"] = "Relay "+a;
			else
				$scope["r"+a+"n"]=jsonlabels.RA["R"+a+"N"];
			for (b=1; b<=8; b++)
			{
				if (jsonlabels.RA["R"+a+b+"N"]=="null")
					$scope["r"+a+b+"n"] = "Relay "+a+b;
				else
					$scope["r"+a+b+"n"]=jsonlabels.RA["R"+a+b+"N"];
			}
		}
	}
}

function setjson(id, value) {
	//console.log(id);
	for (item in Object.keys(json.RA))
	{
		if (Object.keys(json.RA)[item] == id)
		{
			json.RA[Object.keys(json.RA)[item]]=value;
			return;	
		}
	}
}

function changeactivecontroller($scope, $localStorage, $rootScope, id)
{
	$scope.activecontroller=$localStorage.controllers[id].name;
	$localStorage.activecontroller=$scope.activecontroller;
	$localStorage.activecontrollerid=id;
	json=$localStorage.jsonarray[id];
	$localStorage.json=json;
	jsonlabels=$localStorage.jsonlabelsarray[id];
	$localStorage.jsonlabels=jsonlabels;
	$rootScope.$broadcast('msg', 'paramsok');
	$rootScope.$broadcast('msg', 'popoverclose');
}

// create the chart when all data is loaded
function CreateChart($scope, container)
{
	if (names.length==0)
	{
		ons.notification.alert({message: 'At least on parameter needs to be checked.' });
		return false;
	}
	$scope.showgraphlist=false;
	modal.show();
	$("#"+container).html("");
	$("#"+container).css("height",($(window).height()-15)+"px");
	$("#"+container).css("margin-top","-200px");
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});
	seriesOptions = [],
	seriesCounter = 0,
	seriesID = 0;

	$.each(names, function (i, name) {
		$.getJSON('http://forum.reefangel.com/status/jsonp.aspx?id=' + json.RA.ID + '&filter=' + name.toLowerCase() + '&callback=?', function (data) {
			var pcolor;
			var tname;
			var ydec;
			var yunit;
			if (name == "PH") {
				pcolor = '#669900'
				tname = $scope.phn
				ydec = 2
				yunit = 'pH'
			}
			else if (name == "PHE") {
				pcolor = '#447700'
				tname = $scope.phen
				ydec = 2
				yunit = 'pH'
			}
			else if (name == "SAL") {
				pcolor = '#000066'
				tname = $scope.saln
				ydec = 1
				yunit = 'ppt'
			}
			else if (name == "ORP") {
				pcolor = '#330000'
				tname = $scope.orpn
				ydec = 0
				yunit = 'mV'
			}
			else if (name == "T1") {
				pcolor = '#FF0000'
				tname = $scope.t1n
				ydec = 1
				yunit = '°'
			}
			else if (name == "T2") {
				pcolor = '#FF8800'
				tname = $scope.t2n
				ydec = 1
				yunit = '°'
			}
			else if (name == "T3") {
				pcolor = '#9900CC'
				tname = $scope.t3n
				ydec = 1
				yunit = '°'
			}
			else if (name == "WL") {
				pcolor = '#0033FF'
				tname = $scope.wln
				ydec = 1
				yunit = '°'
			}
			else if (name == "WL1") {
				pcolor = '#0033FF'
				tname = $scope.wl1n
				ydec = 1
				yunit = '°'
			}
			else if (name == "WL2") {
				pcolor = '#0033FF'
				tname = $scope.wl2n
				ydec = 1
				yunit = '°'
			}
			else if (name == "WL3") {
				pcolor = '#0033FF'
				tname = $scope.wl3n
				ydec = 1
				yunit = '°'
			}
			else if (name == "WL4") {
				pcolor = '#0033FF'
				tname = $scope.wl4n
				ydec = 1
				yunit = '°'
			}
			else if (name == "PAR") {
				pcolor = '#0033FF'
				tname = $scope.parn
				ydec = 1
				yunit = '°'
			}
			else if (name == "HUM") {
				pcolor = '#0033FF'
				tname = $scope.humn
				ydec = 1
				yunit = '°'
			}
			else {
				pcolor = '#FF0000'
				tname = ''
				ydec = 0
				yunit = ''
			}
			if (data.length) {
				seriesOptions[seriesID] = {
					dataGrouping: {
						smoothed: true
					},
					name: tname,
					color: pcolor,
					tooltip: {
						yDecimals: ydec,
						ySuffix: yunit
					},
					data: data
				};
				seriesID++;
			}
			// As we're loading the data asynchronously, we don't know what order it will arrive. So
			// we keep a counter and create the chart when all the data is loaded.
			seriesCounter++;

			if(data.length==0) 
			{
				modal.hide();
				ons.notification.alert({message: 'No data to display' });
			}
			else
				if (seriesCounter == names.length) {
					DrawChart(container);
			}
		});
	});
}

// create the chart when all data is loaded
function DrawChart(container) {

	chart = new Highcharts.StockChart({
		chart: {
			renderTo: container,
			type: 'spline'
		},
		credits: {
			enabled: false
		},

		legend: {
			enabled: true,
			//align: 'right',
			//backgroundColor: '#FCFFC5',
			borderColor: 'black',
			borderWidth: 2,
			//layout: 'vertical',
			verticalAlign: 'top',
			y: 100,
			shadow: true
		},


		rangeSelector: {
			buttons: [{
				type: 'minute',
				count: 60,
				text: '1h'
			}, {
				type: 'minute',
				count: 720,
				text: '12h'
			}, {
				type: 'day',
				count: 1,
				text: '1d'
			}, {
				type: 'day',
				count: 3,
				text: '3d'
			}, {
				type: 'all',
				text: '7d'
			}],
			selected: 2,
			inputEnabled: false
		},

		navigator: {
			xAxis: {
				type: 'datetime',
				maxZoom: 3600000, // 1 hour
				dateTimeLabelFormats: { // don't display the dummy year
					second: '%I:%M:%S %p',
					minute: '%I:%M %p',
					hour: '%b/%e',
					day: '%b/%e',
					week: '%b/%e'
				}
			}

		},
		xAxis: {
			type: 'datetime',
			maxZoom: 3600000, // 1 hour
			dateTimeLabelFormats: { // don't display the dummy year
				second: '%I:%M:%S %p',
				minute: '%I:%M %p',
				hour: '%I:%M %p',
				day: '%b/%e',
				week: '%b/%e'
			}
		},

		yAxis: {

			plotLines: [{
				value: 0,
				width: 1,
				color: 'silver'
			}]
		},

		tooltip: {
			borderColor: 'silver',
			xDateFormat: '%A, %b %e, %l:%M %p',
			pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>'
		},

		series: seriesOptions
	});
	modal.hide();

}	

Number.prototype.pad = function(size) {
      var s = String(this);
      while (s.length < (size || 2)) {s = "0" + s;}
      return s;
    }
	
function getbytevalue(d,i)
{
	return parseInt(d.substr(i*2,2),16);
}

function getintvalue(d,i)
{
	return parseInt(d.substr((i+1)*2,2) + d.substr(i*2,2),16);
}

function SaveMemory(s,l)
{
	MemString.push(s);
	MemURL.push(l);
}
