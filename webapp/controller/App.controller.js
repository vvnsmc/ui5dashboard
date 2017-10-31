sap.ui.define([
	"ysc/websocket/controller/BaseController",
	'sap/m/MessageToast'
], function(Controller,MessageToast) {
	"use strict";

	return Controller.extend("ysc.websocket.controller.App", {
		
		onInit:function(){
			this._oSplitApp = this.byId("idAppControl");
			
		   //local model
			var oLocalData = {"Chat":[{"Title":"Notification","Text":"아래는 Google Assistant를 통한 요청 내용이 표시됩니다","Datetime":new Date(),"Icon":"sap-icon://business-objects-mobile"}]
			};
			var oViewModel = new sap.ui.model.json.JSONModel();
			oViewModel.setData(oLocalData);
			this.getView().setModel(oViewModel, "localModel");
			var that = this;
			//Websocket오픈
			//var sUrl = "ws://127.0.0.1:8000";//local
			var sUrl = "wss://websocket3347.herokuapp.com";
			jQuery.sap.require("sap.ui.core.ws.WebSocket");
			
		    this.oWS = new sap.ui.core.ws.WebSocket(sUrl);
		    
		    var that = this;
		    this.oWS.attachOpen(function(){
		    	MessageToast.show("서버에 연결되었습니다.");	
		    });
		    
		    this.oWS.attachMessage(function (oControlEvent) {
		    	//예외인 화면 정의
		    	
		    	
		        // var oEntry = jQuery.parseJSON(oControlEvent.getParameter('data')).data;
		        var oReturnData = JSON.parse(JSON.parse(oControlEvent.getParameter('data')));
		        //add Request Text to Upper notification item
		        that._addTextToChat(oReturnData.forUIRequest);
		        
		       
		        //navTo
		        var oRouter = that.getRouter();
		        var oResult = JSON.parse(oReturnData.forUIresults);
		         //MessageToast.show("Received:"+oResult.Action);
		        switch (oResult.Action) {
		        	//Country, Category, Product를 년도별로 매출 출력
		        	case "input.SalesCategory_Year":
		        		switch (oResult.Parameters.SalesCategory) {
		        			case "Country":
		        				oRouter.navTo("salesByCountry",oResult.Parameters);
		        				break;
		        			case "Category":
		        				oRouter.navTo("salesByCategory",oResult.Parameters);
		        				break;
		        			case "Product":
		        				oRouter.navTo("salesByProduct",oResult.Parameters);
		        				break;
		        			default:
		        		}
		        		break;
		        		case "input.DetailCategory":
		        			//if Category ID is supplied show picture dialog for 5 secs
		        			var sURL = "https://cors-anywhere.herokuapp.com/http://services.odata.org/V2/Northwind/Northwind.svc/"
							    if(oResult.Parameters.CategoryName) {
							    	var sUrlPicture = sURL + "Categories?$filter=CategoryName eq '"+ oResult.Parameters.CategoryName +"'&$format=json";
			                          $.get(sUrlPicture, function( data ) {
			                              //var sTrimmedData = data.value[0].Picture.substr(104);
			                              var sTrimmedData = data.d.results[0].Picture.substr(104);
			                              if(!that.oDialog){
				                              that.oDialog = new sap.m.Dialog({
				                              	title : oResult.Parameters.CategoryName,
				                              	stretchOnPhone:true,
				                              	content : new sap.m.Image({src:"data:image/png;base64," + sTrimmedData})
				                              });
				                              //var oDialog = sap.ui.getCore().byId("idCategoryPictureDialog");
				                              //var oImage = sap.ui.getCore().byId("idCategoryImage");
				                              that.getView().addDependent(that.oDialog);
			                              } else {
			                              	that.oDialog.destroyContent();
			                              	that.oDialog.addContent(new sap.m.Image({src:"data:image/png;base64," + sTrimmedData}));
			                              	that.oDialog.setTitle(oResult.Parameters.CategoryName);
			                              }
			                              //oImage.setSrc("data:image/jpg;base64," + sTrimmedData);
			                              that.oDialog.open();
			                              setTimeout(function(){that.oDialog.close()}, 5000);
			                              //locModel.setProperty("/CategoryPicture",sTrimmedData);
			                          });
							    }
							    // oRouter.navTo("salesByCategory",{Year:1998,CategoryName:"Beverages"});
							    break;
					    //두개 년도를 비교
						case "input.CountryCompare":
					     	oRouter.navTo("salesCompare",oResult.Parameters);
					     	break;
		        	default:
		        }
		    });
		       
		     
		       // error handling
		    this.oWS.attachError(function (oControlEvent) {
		    	MessageToast.show('서버와의 연결에 실패하였습니다.');
		       }); 
		        
		       // onConnectionClose
		    this.oWS.attachClose(function (oControlEvent) {
		    	MessageToast.show('서버와의 연결이 끊겼습니다.');
		       });	
		},
		
		_addTextToChat:function(newText){
			var locModel = this.getModel("localModel");
			var aData = locModel.getData();
			aData.Chat.push({Text:newText,Username:"You",Datetime:new Date(),Icon:"sap-icon://customer"});
			locModel.refresh();
		},
		onPressHamburger:function(oEvent){
			if(this._oSplitApp.isMasterShown()){
			  
			  //mobile only
			  if(sap.ui.Device.system.phone){
				  var oDetail = this._oSplitApp.getDetailPages()[0];
	              this._oSplitApp.toDetail(oDetail, "flip");
			  } else {
			  	this._oSplitApp.hideMaster()	;
			  }
                 
			} else { 
				
				if(sap.ui.Device.system.phone){
				 var oMaster = this._oSplitApp.getMasterPages()[0];
                 this._oSplitApp.toMaster(oMaster, "flip");
				} else {
					this._oSplitApp.showMaster();
				}
				
			}
		}
    });
});