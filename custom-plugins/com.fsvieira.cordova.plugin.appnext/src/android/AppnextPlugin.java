//Copyright (c) 2016 Filipe Vieira
//Email: sv.filipe@gmail.com
//Homepage: http://www.fsvieira.com
//License: MIT (http://opensource.org/licenses/MIT)
package com.fsvieira.cordova.plugin.appnext;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaWebView;
import android.annotation.TargetApi;
import android.app.Activity;
import android.util.Log;

import com.appnext.appnextsdk.API.AppnextAPI;
import com.appnext.appnextsdk.API.AppnextAd;
import com.appnext.appnextsdk.API.AppnextAdRequest;
import com.appnext.appnextsdk.API.AppnextAPI.AppnextAdListener;

import java.util.ArrayList;

public class AppnextPlugin extends CordovaPlugin {
	AppnextAPI api;
	private CallbackContext ads = null;
	private ArrayList<AppnextAd> clickAds = null;
	
	class MyEventListener implements AppnextAdListener {
		@Override
		public void onError(String error) { 
			if (ads != null) {
				ads.error(error);
				ads = null;
			}
		}
		
		@Override
		public void onAdsLoaded(ArrayList<AppnextAd> result) {
			//collect and store the data received 
			try {
				if (result.size() == 0) {
					ads.error("NO_ADS");
				}
				else if (ads != null) {
					JSONArray json = new JSONArray();
					
					int idx = 0;
					for (AppnextAd ad : result) {
						JSONObject o = new JSONObject();

						o.put("idx", ad.getIdx());
						o.put("adDescription", ad.getAdDescription());
						o.put("revenueType", ad.getRevenueType());
						o.put("revenueRate", ad.getRevenueRate());
						o.put("categories", ad.getCategories());
						o.put("adTitle", ad.getAdTitle());
						o.put("imageURL", ad.getImageURL());
						o.put("imageURLWide", ad.getImageURLWide());
						o.put("adPackage", ad.getAdPackage());
						o.put("campaignType", ad.getCampaignType());
						o.put("supportedVersion", ad.getSupportedVersion());
						o.put("storeRating", ad.getStoreRating());
						o.put("storeDownloads", ad.getStoreDownloads());
						o.put("appSize", ad.getAppSize());
						o.put("id", idx);
						
						json.put(idx, o);
						idx++;
					}
					
					clickAds = result;
					ads.sendPluginResult(new PluginResult(PluginResult.Status.OK, json));
					ads = null;
				}
			}
			catch (Exception e) {
				ads.error(e.toString());
				ads = null;
			}
		}
	};

	
    @Override
	public void pluginInitialize() {
		super.pluginInitialize();
    }
	
	@Override
	public void onPause(boolean multitasking) {
		super.onPause(multitasking);
	}
	
	@Override
	public void onResume(boolean multitasking) {
		super.onResume(multitasking);
	}
	
	@Override
	public void onDestroy() {
		super.onDestroy();
		api.finish();
	}
	
	@Override
	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		if (action.equals("init")) {
			init(action, args, callbackContext);
			return true;
		}
		
		if (action.equals("loadAds")) {
			loadAds(action, args, callbackContext);
			return true;
		}

		if (action.equals("openAd")) {
			openAd(action, args, callbackContext);
			return true;
		}

		return false; // Returning false results in a "MethodNotFound" error.
	}

	
	private void init(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		final String placementID = args.getString(0);
		api = new AppnextAPI(cordova.getActivity(), placementID);
		api.setAdListener(new MyEventListener());
		callbackContext.success();
	}
	
	private void loadAds(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		if (ads == null) {
			String category = ""; 
			if (args.length() > 0) {
				category = args.getString(0);
			}
			
			ads = callbackContext;
			if (category == "") {
				api.loadAds(new AppnextAdRequest().setCount(7));
			}
			else {
				api.loadAds(new AppnextAdRequest().setCount(7).setCategory(category));
			}
		}
		else {
			callbackContext.error("RUNNING");
		}
	}
	
	private void openAd(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
		if (ads == null) {
			try {
				final int index = args.getInt(0);
				final CallbackContext cb = callbackContext;
				
				cordova.getActivity().runOnUiThread(new Runnable() {
					@Override
					public void run() {
						try {
							api.adClicked(clickAds.get(index));
						}
						catch (Exception e) {
							cb.error(e.toString());
						}
					}
				});

				callbackContext.success();
			}
			catch (Exception e) {
				callbackContext.error(e.toString());
			}
		}
		else {
			callbackContext.error("RUNNING");
		}
	}
}
